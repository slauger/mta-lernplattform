#!/usr/bin/env python3
"""
Ordnet jede Prüfungsfrage einem MTA-Thema (= Kursabend) zu.

Schreibt das Feld "thema" in die Fragenkataloge unter docs/quiz/.
Nach jedem Neu-Extrahieren mit extract_any_exam.py erneut ausführen:

    python3 tag_themen.py
"""

import json
from pathlib import Path

QUIZ_DIR = Path(__file__).parent / "docs" / "quiz"

# Standard-Zuordnung über die Kategorie aus dem Fragenkatalog
KATEGORIE_ZU_THEMA = {
    "Rechtsgrundlagen und Organisation": "recht",
    "Brennen und Löschen": "brennen",
    "Erste Hilfe": "erstehilfe",
    "Verhalten im Einsatz": "einsatz",
    "Funk": "funk",
    "Verhalten bei Gefahr": "gefahr",
    "ABC-Einsatz": "gefahr",
    "Fahrzeugkunde": "fahrzeuge",
    "Fahrzeugtechnik": "fahrzeuge",
    "Sichern gegen Absturz": "absturz",
    "Hilfeleistungseinsatz": "thl",
    "Löscheinsatz": "loescheinsatz",
}

# Einzelzuordnungen (Frage-ID -> Thema), wo die Kategorie zu grob ist
BASISMODUL = {
    # Gerätekunde: PSA & Feuerlöscher (5.1-5.4)
    **dict.fromkeys([9, 59, 98, 140, 177, 196, 37, 42, 61, 107, 130, 157], "psa"),
    # Gerätekunde: Leitern, Rettungsgeräte, Leine (5.9, 5.11, 10.x)
    **dict.fromkeys([16, 26, 29, 35, 39, 54, 60, 103, 114, 134, 178, 214], "absturz"),
    # Knoten & Stiche, Warngeräte (5.10, 5.13)
    **dict.fromkeys([41, 160, 111], "knoten"),
    # Geräte der Technischen Hilfeleistung (5.7, 5.8)
    **dict.fromkeys([36, 141], "thl"),
    # Schläuche, Armaturen, Strahlrohre, Wasserversorgung (5.5, 9.1, 9.2, 9.4)
    **dict.fromkeys([25, 31, 64, 84, 86, 90, 99, 102, 113, 118, 176, 179, 205,
                     7, 58, 71, 91, 131, 159, 180], "wasser"),
    # Stress & Belastung (6.2)
    **dict.fromkeys([69, 73, 79, 121], "belastung"),
    # Gefahren der Einsatzstelle (8.0)
    **dict.fromkeys([62, 108], "gefahr"),
    # Hygiene (7.2)
    88: "einsatz",
    # Feuerlöscher-Auswahl (5.4)
    72: "psa",
    # Kontamination / Inkorporation (12.2)
    **dict.fromkeys([145, 185], "gefahr"),
    # Medikamente / Einsatzfähigkeit (6.2)
    76: "belastung",
    # Brustbund-Knoten (5.10), wie Frage 41
    39: "knoten",
}

TRUPPFUEHRER = {
    **dict.fromkeys([26, 28, 42, 50, 51], "brennen"),
    **dict.fromkeys([1, 2, 3, 10, 11, 12, 13, 19, 22, 31, 39, 47, 48, 52, 57, 58, 60], "loescheinsatz"),
    **dict.fromkeys([4, 15, 16, 29, 45, 49, 54], "absturz"),
    **dict.fromkeys([5, 40], "belastung"),
    **dict.fromkeys([6, 9, 17], "einsatz"),
    7: "erstehilfe",
    **dict.fromkeys([8, 21, 25, 38, 41, 53], "psa"),
    **dict.fromkeys([14, 24, 32, 36, 56], "thl"),
    **dict.fromkeys([18, 20, 23, 33, 43, 46, 55, 59], "gefahr"),
    **dict.fromkeys([27, 35, 37, 44], "wasser"),
    30: "fahrzeuge",
    34: "recht",
}

KATALOGE = {
    "questions-mta-basismodul.json": BASISMODUL,
    "questions-mta-truppfuehrer.json": TRUPPFUEHRER,
}


def main():
    for filename, overrides in KATALOGE.items():
        path = QUIZ_DIR / filename
        questions = json.loads(path.read_text(encoding="utf-8"))
        missing = []
        for q in questions:
            thema = overrides.get(q["id"]) or KATEGORIE_ZU_THEMA.get(q["category"])
            if thema is None:
                missing.append(q["id"])
            q["thema"] = thema
        path.write_text(json.dumps(questions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{filename}: {len(questions)} Fragen getaggt")
        if missing:
            raise SystemExit(f"Ohne Thema in {filename}: {missing}")


if __name__ == "__main__":
    main()
