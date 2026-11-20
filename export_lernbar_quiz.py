#!/usr/bin/env python3
"""
Exportiert Fragen und offizielle Lösungen aus den Übungs-Quiz der Feuerwehr-Lernbar.Bayern.

Die Lernbar gibt Fragen nur innerhalb eines Quizversuchs heraus und zeigt die Lösung
erst nach einer Antwort. Das Skript startet deshalb je Quiz einen Versuch, gibt zu
jeder Frage eine leere Antwort ab, speichert Frage und Lösung und löscht den Versuch
anschließend wieder.

Zugangsdaten (eigener, kostenloser Lernbar-Account) in ~/.lernbar.env:

    LERNBAR_EMAIL=...
    LERNBAR_PASSWORT=...

Aufruf (Ergebnis nach unterlagen/lernbar-quiz/, danach import_lernbar_quiz.py):

    python3 export_lernbar_quiz.py unterlagen/lernbar-quiz 37 38

Quiz 37 = „Zwischenprüfung (alle Fragen)“, Quiz 38 = „Abschlussprüfung (alle Fragen)“.
Benötigt das Paket requests (im venv installieren).
"""

import json
import sys
import time
from pathlib import Path

import requests

API = "https://www.feuerwehr-lernbar.bayern/api"


def zugangsdaten():
    werte = {}
    for zeile in Path("~/.lernbar.env").expanduser().read_text().splitlines():
        zeile = zeile.strip()
        if "=" in zeile and not zeile.startswith("#"):
            k, v = zeile.split("=", 1)
            werte[k.strip()] = v.strip().strip("\"'")
    return werte["LERNBAR_EMAIL"], werte["LERNBAR_PASSWORT"]


def anmelden():
    email, passwort = zugangsdaten()
    r = requests.post(f"{API}/auth/login", timeout=30, headers={"accept": "application/json"},
                      json={"email": email, "password": passwort, "device_name": "default_device_name"})
    r.raise_for_status()
    return {"Authorization": f"Bearer {r.json()['token']}", "accept": "application/json"}


def exportieren(h, quiz_id, ziel):
    bilder = ziel / "bilder"
    bilder.mkdir(parents=True, exist_ok=True)
    meta = requests.get(f"{API}/quizzes/{quiz_id}", headers=h, timeout=30).json()["data"]
    versuch = requests.post(f"{API}/quizzes/{quiz_id}/start", headers=h, timeout=30).json()["data"]["id"]
    fragen = []
    try:
        while len(fragen) < meta["questions_count"]:
            r = requests.get(f"{API}/quizzes/regular/{versuch}/questions/next", headers=h, timeout=30)
            if r.status_code != 200:
                print("Abbruch:", r.status_code, r.text[:150])
                break
            q = r.json()["data"]
            a = requests.post(f"{API}/quizzes/regular/{versuch}/questions/{q['id']}/answer",
                              headers=h, json={"answers": []}, timeout=30).json()["data"]
            eintrag = {
                "id": q["id"], "nr": q.get("current_question_number"), "type": q.get("type"),
                "difficulty": q.get("difficulty_level"), "text": q["text"], "hint": q.get("hint"),
                "image_url": q.get("image_url"),
                "antworten": [{"id": x["id"], "text": x["text"], "richtig": x["is_correct"]} for x in a["answers"]],
            }
            if q.get("image_url"):
                b = requests.get(f"{API}/media/{q['image_url'].lstrip('/')}", headers=h, timeout=60)
                if b.status_code == 200:
                    datei = bilder / f"{q['id']}{Path(q['image_url']).suffix or '.jpg'}"
                    datei.write_bytes(b.content)
                    eintrag["bild"] = str(datei.relative_to(ziel))
            fragen.append(eintrag)
            time.sleep(0.4)
    finally:
        requests.delete(f"{API}/quizzes/regular/{versuch}", headers=h, timeout=30)
    ergebnis = {
        "quiz": {k: meta[k] for k in ("id", "name", "questions_count", "published_at", "updated_at")},
        "exportiert": time.strftime("%Y-%m-%d"),
        "fragen": fragen,
    }
    (ziel / f"quiz{quiz_id}.json").write_text(json.dumps(ergebnis, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Quiz {quiz_id} „{meta['name']}“: {len(fragen)} von {meta['questions_count']} Fragen")


def main():
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    ziel = Path(sys.argv[1])
    h = anmelden()
    try:
        for quiz_id in sys.argv[2:]:
            exportieren(h, quiz_id, ziel)
    finally:
        requests.post(f"{API}/auth/logout", headers=h, timeout=30)


if __name__ == "__main__":
    main()
