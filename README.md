# MTA-Vorbereitung - Freiwillige Feuerwehr Goldkronach

Vollständiges Lern- und Übungsdokument für die **Modulare Truppausbildung (MTA)** in Bayern.

## Über dieses Projekt

Dieses Repository enthält eine umfassende MTA-Vorbereitung mit:

- **Theorie**: Alle relevanten Themen (Brennen & Löschen, Fahrzeuge, Recht, Einsatz & Funk)
- **Praxis**: Knoten, Fitness-Übungen, Materiallisten
- **Prüfungsfragen**: 253 Fragen aus den offiziellen Übungs-Quiz der Feuerwehr-Lernbar (193 Zwischenprüfung + 60 Abschlussprüfung, Stand 20.11.2026)
- **Begriffe & Abkürzungen**: 100+ Einträge mit Beispielen
- **Ressourcen**: Bücher, YouTube-Kanäle, Apps, Links
- **Lernfortschritt**: Checklisten und Tracking-Methoden

## Features

### 📚 Theorie (11 Kapitel)

- Ziele, Aufgaben & Werte der Feuerwehr
- Brennen & Löschen (Brandklassen, Löschmittel, Brandverhalten)
- Fahrzeuge & Geräte (LF, HLF, PSA, Atemschutz)
- Rechtsgrundlagen & Sicherheit (BayFwG, UVV, GAMS)
- Verhalten im Einsatz & Funk (Einsatzablauf, Digitalfunk)
- Einheiten im Löscheinsatz (FwDV 3: Trupp-Aufgaben, Befehlsschema, Verteiler)
- Löschwasserversorgung (Hydranten, Saugbetrieb, Schläuche, Armaturen, Strahlrohre)
- Technische Hilfeleistung & neue Fahrzeugtechnik
- Leitern & Absturzsicherung
- Verhalten bei Gefahr & ABC (4A-1C-4E, Gefahrgut, GAMS)
- Erste Hilfe & Belastung

### 🛠️ Praxis (3 Kapitel)

- Knoten & Stiche (mit ASCII-Skizzen + Übungsplan)
- Übungen zuhause & Fitness (feuerwehrspezifisches Training)
- Materialliste (Prioritäten + Preise)

### ✅ Prüfung

- **253 Prüfungsfragen** aus den Übungs-Quiz der Feuerwehr-Lernbar.Bayern (Stand 20.11.2026)
  - 193 Fragen: Zwischenprüfung (Basismodul), je eine richtige Antwort
  - 60 Fragen: Abschlussprüfung (Truppführer), immer als Mehrfachauswahl wie in der Prüfung
  - Archiv: Kataloge des früheren Prüfungsgenerators (Stand 12.01.2026, 214 + 60 Fragen), im Quiz als „veraltet“ auswählbar
- **Interaktive Quiz-App** (HTML/JS):
  - Multiple-Choice Support (Single & Multi-Select)
  - Katalog-Auswahl (aktuell / Archiv) mit Quellenhinweis
  - Antworten durchmischen (optional)
  - Fortschritts-Tracking (localStorage)
  - "Nur neue Fragen" / "Nur falsche wiederholen"
  - Sofortiges Feedback mit Erklärungen
  - Keyboard-Shortcuts (a/b/c, Enter, Space)
  - Filter nach MTA-Thema (alle Fragen den Modulen zugeordnet)
- **Durchsicht-Modus**: Alle Fragen aufklappbar zum Lernen

#### Fragenkatalog aktualisieren

1. `python3 export_lernbar_quiz.py unterlagen/lernbar-quiz 37 38` – exportiert Fragen und Lösungen der Lernbar-Quiz (eigener Lernbar-Account in `~/.lernbar.env`, im venv mit `requests`). `unterlagen/` ist von Git ausgeschlossen.
2. `python3 import_lernbar_quiz.py unterlagen/lernbar-quiz` – schreibt `docs/quiz/questions-lernbar-*.json`, übernimmt Themen und Übersetzungen unveränderter Fragen. Neue Fragen ohne Gegenstück brauchen ein Thema in `THEMA_NEU`, fehlende Übersetzungen landen in `docs/quiz/uebersetzung-offen.json`.
3. Die Archiv-Kataloge stammen aus `extract_any_exam.py` (früherer Prüfungsgenerator, nicht mehr erreichbar) und `tag_themen.py`.

### 🏠 Goldkronach-spezifisch

- Lokale Fahrzeuge & Geräte
- Typische Einsatzlagen
- Besonderheiten der Region

### 📖 Ressourcen

- Empfohlene Bücher
- YouTube-Kanäle
- Websites & Apps
- Podcasts & Communities

### 📊 Lernfortschritt

- Checklisten für jedes Kapitel
- Tracking-Methoden (Git, Notion, Excel)
- Wochen-Tracker
- Prüfungsfragen-Tracker

---

## Lizenz

Dieses Projekt ist für **private, nicht-kommerzielle Nutzung** gedacht.

Die Inhalte basieren auf öffentlich verfügbaren Feuerwehr-Dienstvorschriften (FwDV), dem Bayerischen Feuerwehrgesetz (BayFwG) und allgemein bekanntem Feuerwehrwissen.

---

## Kontakt & Feedback

Bei Fragen, Anregungen oder Fehlern:
- Erstelle ein Issue auf GitHub
- Oder kontaktiere die FF Goldkronach direkt

## Danksagung

- **Landesfeuerwehrverband Bayern (LFV)** für die Bereitstellung offizieller Lernmaterialien
- **Kreisfeuerwehrverband Bayreuth** für die MTA-Lehrgänge
- Alle Feuerwehrkameraden, die mit Rat und Tat zur Seite stehen

---

**Viel Erfolg bei der MTA!**
