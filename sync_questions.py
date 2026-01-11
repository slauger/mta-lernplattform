#!/usr/bin/env python3
"""
Synchronisiert questions.json mit docs/pruefung/fragen.md
JSON ist die Single Source of Truth!
"""

import json
from pathlib import Path

def generate_markdown_from_json():
    # Pfade
    json_file = Path("docs/quiz/questions.json")
    markdown_file = Path("docs/pruefung/fragen.md")

    # JSON laden
    with open(json_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # Nach Kategorie gruppieren
    categories = {}
    for q in questions:
        cat = q['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(q)

    # Markdown generieren
    markdown = """# Prüfungsfragen MTA

!!! info "Hinweis"
    Diese Fragen wurden automatisch aus `docs/quiz/questions.json` generiert.

    **Zum interaktiven Quiz:** [Klick hier](../quiz/index.html)

---

## Über diese Fragen

Hier findest du alle **{total} Prüfungsfragen** für die MTA, sortiert nach Kategorien.

**Tipp:** Nutze das [interaktive Quiz](../quiz/index.html) zum Lernen - dort kannst du:

- Fragen nach Kategorie filtern
- Zufällige Reihenfolge aktivieren
- Falsche Fragen markieren und wiederholen
- Deinen Fortschritt tracken

---

""".format(total=len(questions))

    # Kategorien in fester Reihenfolge
    category_order = [
        "Ziele & Aufgaben",
        "Brennen & Löschen",
        "Fahrzeuge & Geräte",
        "Rechtsgrundlagen",
        "Einsatz & Funk",
        "Knoten"
    ]

    question_counter = 1

    for category in category_order:
        if category not in categories:
            continue

        questions_in_cat = categories[category]

        markdown += f"## {category}\n\n"
        markdown += f"**{len(questions_in_cat)} Fragen**\n\n"
        markdown += "---\n\n"

        for q in questions_in_cat:
            markdown += f"### Frage {question_counter}\n\n"
            markdown += f"**{q['question']}**\n\n"

            # Antwort als Collapsible
            markdown += f'??? success "Antwort"\n'
            markdown += f'    {q["answer"]}\n\n'

            # Erklärung
            if q.get('explanation'):
                markdown += f'    **Erklärung:**\n'
                markdown += f'    {q["explanation"]}\n\n'

            # Referenz
            if q.get('reference'):
                ref_text = q['reference'].replace('../', '')
                markdown += f'    **Mehr Infos:** [{ref_text}]({q["reference"]})\n'

            markdown += "\n---\n\n"
            question_counter += 1

    # Zusammenfassung
    markdown += "## Zusammenfassung\n\n"
    markdown += "| Kategorie | Anzahl Fragen |\n"
    markdown += "|-----------|---------------|\n"

    for category in category_order:
        if category in categories:
            count = len(categories[category])
            markdown += f"| **{category}** | {count} |\n"

    markdown += f"| **GESAMT** | **{len(questions)}** |\n\n"

    markdown += "---\n\n"
    markdown += "## Nächste Schritte\n\n"
    markdown += "1. **[Zum interaktiven Quiz](../quiz/index.html)** - Lerne spielerisch!\n"
    markdown += "2. **[Lernfortschritt dokumentieren](../lernfortschritt.md)** - Tracke deine Erfolge\n"
    markdown += "3. **[Ressourcen](../ressourcen.md)** - Weitere Lernmaterialien\n"

    # Markdown schreiben
    with open(markdown_file, 'w', encoding='utf-8') as f:
        f.write(markdown)

    print(f"✅ {len(questions)} Fragen erfolgreich synchronisiert!")
    print(f"   JSON: {json_file}")
    print(f"   Markdown: {markdown_file}")

    # Statistik ausgeben
    print("\n📊 Statistik:")
    for category in category_order:
        if category in categories:
            print(f"   {category}: {len(categories[category])} Fragen")
    print(f"   GESAMT: {len(questions)} Fragen")

if __name__ == "__main__":
    generate_markdown_from_json()
