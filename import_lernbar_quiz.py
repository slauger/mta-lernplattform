#!/usr/bin/env python3
"""
Übernimmt die Quiz-Exporte der Feuerwehr-Lernbar in das Quiz-Format unter docs/quiz/.

Eingabe: quiz37.json (Zwischenprüfung) und quiz38.json (Abschlussprüfung) aus
export_lernbar_quiz.py, dazu der Ordner bilder/.

Das Thema ("thema") und vorhandene ukrainische Übersetzungen werden von der
passenden Frage der alten Kataloge (Prüfungsgenerator, Stand 01/2026) übernommen.
Fragen ohne Gegenstück brauchen einen Eintrag in THEMA_NEU.

    python3 import_lernbar_quiz.py unterlagen/lernbar-quiz

Fragen ohne Übersetzung werden in docs/quiz/uebersetzung-offen.json gesammelt.
"""

import difflib
import json
import re
import shutil
import sys
from pathlib import Path

QUIZ_DIR = Path(__file__).parent / "docs" / "quiz"
BILD_DIR = QUIZ_DIR / "bilder"

KATALOGE = [
    # (Lernbar-Quiz, neue Datei, alte Datei, Abschlussprüfung = Mehrfachauswahl)
    (37, "questions-lernbar-zwischenpruefung.json", "questions-mta-basismodul.json", False),
    (38, "questions-lernbar-abschlusspruefung.json", "questions-mta-truppfuehrer.json", True),
]

# Thema für Fragen, die es in den alten Katalogen nicht gibt (Lernbar-ID -> Thema)
THEMA_NEU = {
    # Zwischenprüfung
    1137: "recht",       # Wer hat Feuerwehren aufzustellen ... (Gemeinde)
    1214: "absturz",     # Besteigen tragbarer Leitern nach FwDV 10
    1196: "wasser",      # Einstellmöglichkeiten Hohlstrahlrohr
    1211: "knoten",      # Knoten zum Halten, Sichern und Retten
    1244: "erstehilfe",  # Atmung überprüfen
    1229: "belastung",   # Wann nicht an Einsätzen teilnehmen (wie alte Frage 76)
    # Abschlussprüfung
    1081: "einsatz",        # Anheben schwerer Gegenstände
    1075: "gefahr",         # Stromunfall Niederspannung (wie alte Frage 18)
    1118: "wasser",         # Unterflurhydrant verstellt (wie alte Frage 27)
    1133: "loescheinsatz",  # Inhalt einer Lagemeldung
    1132: "gefahr",         # Einsatzkräfte im Gefahrenbereich begrenzen
    1129: "recht",          # Aufgaben des Truppführers bei Anwendung der UVV
    1130: "wasser",         # B-Druckschläuche falsch ausgeworfen
    1113: "thl",            # Patient im Fahrzeug betreuen
    1131: "gefahr",         # Einsturzgefahr
    1082: "gefahr",         # GAMS-Regel (wie alte Frage 43)
}

KATEGORIE = {
    "recht": "Rechtsgrundlagen und Organisation",
    "brennen": "Brennen und Löschen",
    "psa": "Gerätekunde",
    "erstehilfe": "Erste Hilfe",
    "belastung": "Verhalten im Einsatz",
    "einsatz": "Verhalten im Einsatz",
    "funk": "Funk",
    "gefahr": "Verhalten bei Gefahr",
    "fahrzeuge": "Fahrzeugkunde",
    "knoten": "Gerätekunde",
    "absturz": "Sichern gegen Absturz",
    "thl": "Hilfeleistungseinsatz",
    "wasser": "Löscheinsatz",
    "loescheinsatz": "Löscheinsatz",
}


def norm(text):
    text = text.lower().replace("„", '"').replace("“", '"').replace("”", '"')
    return re.sub(r"[^a-z0-9äöüß]+", " ", text).strip()


def als_liste(wert):
    return wert if isinstance(wert, list) else [wert]


def zuordnen(neu, alt):
    """Ordnet jeder neuen Frage die ähnlichste alte Frage zu (Fragetext und Antworten)."""
    def score(n, a):
        text = difflib.SequenceMatcher(None, norm(n["text"]), norm(a["question"])).ratio()
        na = [norm(x["text"]) for x in n["antworten"]]
        aa = [norm(x) for x in a["answers"]]
        antw = sum(max(difflib.SequenceMatcher(None, x, y).ratio() for y in aa) for x in na) / len(na)
        return text, 0.6 * text + 0.4 * antw

    kandidaten = sorted(
        ((score(n, a), i, j) for i, n in enumerate(neu) for j, a in enumerate(alt)),
        key=lambda k: -k[0][1],
    )
    paare, belegt_n, belegt_a = {}, set(), set()
    for (text, _), i, j in kandidaten:
        if i in belegt_n or j in belegt_a or text < 0.6:
            continue
        belegt_n.add(i)
        belegt_a.add(j)
        paare[i] = alt[j]
    return paare


def uebersetzung_uebernehmen(n, a, uk_alt):
    """Alte Übersetzung nur, wenn Frage und alle Antworten unverändert sind."""
    t = uk_alt.get(str(a["id"]))
    if not t or norm(n["text"]) != norm(a["question"]):
        return None
    alt_antw = {norm(x): i for i, x in enumerate(a["answers"])}
    try:
        reihenfolge = [alt_antw[norm(x["text"])] for x in n["antworten"]]
    except KeyError:
        return None
    if len(reihenfolge) != len(a["answers"]):
        return None
    return {"question": t["question"], "answers": [t["answers"][i] for i in reihenfolge]}


def main():
    quelle = Path(sys.argv[1] if len(sys.argv) > 1 else "unterlagen/lernbar-quiz")
    BILD_DIR.mkdir(exist_ok=True)
    offen = {}
    for quiz_id, datei, alt_datei, mehrfach in KATALOGE:
        export = json.loads((quelle / f"quiz{quiz_id}.json").read_text(encoding="utf-8"))
        stand = ".".join(reversed(export["exportiert"].split("-")))  # 2026-11-20 -> 20.11.2026
        quiz_name = export["quiz"]["name"]
        neu = export["fragen"]
        alt = json.loads((QUIZ_DIR / alt_datei).read_text(encoding="utf-8"))
        uk_alt_pfad = QUIZ_DIR / alt_datei.replace(".json", "-uk.json")
        uk_alt = json.loads(uk_alt_pfad.read_text(encoding="utf-8")) if uk_alt_pfad.exists() else {}
        paare = zuordnen(neu, alt)

        fragen, uk, ohne_thema = [], {}, []
        for i, n in enumerate(neu):
            a = paare.get(i)
            thema = THEMA_NEU.get(n["id"]) or (a["thema"] if a else None)
            if thema is None:
                ohne_thema.append(n["id"])
            richtig = [k for k, x in enumerate(n["antworten"]) if x["richtig"]]
            buchstaben = ", ".join(chr(65 + k) for k in richtig)
            frage = {
                "id": n["id"],
                "category": KATEGORIE.get(thema, ""),
                "thema": thema,
                "question": n["text"],
                "answers": [x["text"] for x in n["antworten"]],
                "correct": richtig if mehrfach else richtig[0],
                "multiple_choice": mehrfach,
                "explanation": f"Lösung laut Feuerwehr-Lernbar, Quiz „{quiz_name}“ (Stand {stand}): {buchstaben}",
            }
            if n.get("bild"):
                ziel = BILD_DIR / Path(n["bild"]).name
                shutil.copyfile(quelle / n["bild"], ziel)
                frage["images"] = [{"src": f"bilder/{ziel.name}"}]
            if a:
                frage["alte_id"] = a["id"]
            fragen.append(frage)

            t = uebersetzung_uebernehmen(n, a, uk_alt) if a else None
            if t:
                uk[str(n["id"])] = t
            else:
                offen[str(n["id"])] = {"question": n["text"], "answers": frage["answers"],
                                        "alte_uebersetzung": uk_alt.get(str(a["id"])) if a else None}

        if ohne_thema:
            raise SystemExit(f"Ohne Thema in {datei}: {ohne_thema}")
        (QUIZ_DIR / datei).write_text(json.dumps(fragen, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        uk_pfad = QUIZ_DIR / datei.replace(".json", "-uk.json")
        if uk_pfad.exists():
            # bereits übersetzte Fragen behalten
            for k, v in json.loads(uk_pfad.read_text(encoding="utf-8")).items():
                if k in offen:
                    uk[k] = {"question": v["question"], "answers": v["answers"]}
                    del offen[k]
        uk = {k: {**v, "explanation": uk_erklaerung(quiz_name, stand, fragen, k)} for k, v in uk.items()}
        uk_pfad.write_text(json.dumps(uk, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{datei}: {len(fragen)} Fragen, {len(paare)} mit alter Frage verknüpft, {len(uk)} übersetzt")

    offen_pfad = QUIZ_DIR / "uebersetzung-offen.json"
    if offen:
        offen_pfad.write_text(json.dumps(offen, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{len(offen)} Fragen ohne Übersetzung -> {offen_pfad}")
    elif offen_pfad.exists():
        offen_pfad.unlink()


def uk_erklaerung(quiz_name, stand, fragen, frage_id):
    frage = next(f for f in fragen if str(f["id"]) == frage_id)
    buchstaben = ", ".join(chr(65 + k) for k in als_liste(frage["correct"]))
    return f"Відповідь згідно з Feuerwehr-Lernbar, тест „{quiz_name}“ (стан {stand}): {buchstaben}"


if __name__ == "__main__":
    main()
