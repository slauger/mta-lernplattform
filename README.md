# MTA-Vorbereitung - Freiwillige Feuerwehr Goldkronach

Vollständiges Lern- und Übungsdokument für die **Modulare Truppausbildung (MTA)** in Bayern.

## Über dieses Projekt

Dieses Repository enthält eine umfassende MTA-Vorbereitung mit:

- **Theorie**: Alle relevanten Themen (Brennen & Löschen, Fahrzeuge, Recht, Einsatz & Funk)
- **Praxis**: Knoten, Fitness-Übungen, Materiallisten
- **Prüfungsfragen**: 120+ Fragen mit Antworten und Erklärungen
- **Begriffe & Abkürzungen**: 100+ Einträge mit Beispielen
- **Ressourcen**: Bücher, YouTube-Kanäle, Apps, Links
- **Lernfortschritt**: Checklisten und Tracking-Methoden

## Schnellstart

### Option 1: MkDocs lokal ausführen (empfohlen)

**Voraussetzungen:**
- Python 3.8+ installiert
- `pip` (Python-Paketmanager)

**Installation:**

```bash
# 1. Repository klonen
git clone https://github.com/slauger/mta-lernplattform.git
cd mta-lernplattform

# 2. Python Virtual Environment erstellen (optional, aber empfohlen)
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# oder: venv\Scripts\activate  # Windows

# 3. MkDocs und Material Theme installieren
pip install mkdocs mkdocs-material

# 4. MkDocs starten
mkdocs serve
```

**Öffne im Browser:**
```
http://127.0.0.1:8000
```

Die Landing Page zeigt dir zwei Optionen:
- **Dokumentation**: Alle Theorie- und Praxiskapitel
- **Interaktives Quiz**: Prüfungsvorbereitung mit Lernmodus

Die Seite wird automatisch neu geladen, wenn du Änderungen an den Markdown-Dateien vornimmst!

---

### Option 2: Statische HTML-Website bauen

```bash
# Website bauen
mkdocs build

# Ergebnis: site/ Ordner mit statischen HTML-Dateien
# Diese kannst du z. B. auf GitHub Pages hosten
```

---

### Option 3: Direkt auf GitHub Pages hosten

```bash
# GitHub Pages automatisch deployen
mkdocs gh-deploy
```

Deine Website ist dann unter `https://<username>.github.io/feuerwehr/` erreichbar.

Die Landing Page (`docs/index.md`) wird zur Startseite und verlinkt zu:
- **Dokumentation**: Navigation durch alle MkDocs-Seiten
- **Quiz**: `docs/quiz/index.html` (funktioniert als statische HTML-App)

---

## Projekt-Struktur

```
feuerwehr/
├── mkdocs.yml              # MkDocs-Konfiguration
├── README.md               # Diese Datei
├── docs/                   # Alle Markdown-Dateien + Quiz
│   ├── index.md            # Landing Page (Startseite)
│   ├── einfuehrung.md      # Einführung & Orientierung
│   ├── begriffe.md         # Begriffe & Abkürzungen (100+)
│   ├── theorie/            # Theorie-Kapitel
│   │   ├── ziele-aufgaben.md
│   │   ├── brennen-loeschen.md
│   │   ├── fahrzeuge-geraete.md
│   │   ├── recht-sicherheit.md
│   │   └── einsatz-funk.md
│   ├── praxis/             # Praxis-Kapitel
│   │   ├── knoten.md
│   │   ├── uebungen-fitness.md
│   │   └── materialliste.md
│   ├── pruefung/           # Prüfungsfragen
│   │   └── fragen.md       # 120+ Fragen
│   ├── quiz/               # Interaktive Quiz-App
│   │   ├── index.html      # Quiz UI
│   │   ├── quiz.js         # Quiz-Logik
│   │   └── questions.json  # 25+ Fragen (erweiterbar)
│   ├── goldkronach.md      # Lokale Besonderheiten
│   ├── ressourcen.md       # Bücher, Links, YouTube
│   └── lernfortschritt.md  # Fortschritt dokumentieren
└── site/                   # Generierte HTML-Website (nach `mkdocs build`)
```

---

## Features

### 📚 Theorie (5 Kapitel)

- Ziele, Aufgaben & Werte der Feuerwehr
- Brennen & Löschen (Brandklassen, Löschmittel, Brandverhalten)
- Fahrzeuge & Geräte (LF, HLF, PSA, Atemschutz)
- Rechtsgrundlagen & Sicherheit (BayFwG, UVV, GAMS)
- Verhalten im Einsatz & Funk (Einsatzablauf, Digitalfunk)

### 🛠️ Praxis (3 Kapitel)

- Knoten & Stiche (mit ASCII-Skizzen + Übungsplan)
- Übungen zuhause & Fitness (feuerwehrspezifisches Training)
- Materialliste (Prioritäten + Preise)

### ✅ Prüfung

- 120+ Prüfungsfragen mit Antworten und Erklärungen (statisch in Markdown)
- **Interaktive Quiz-App** (HTML/JS):
  - 25+ Fragen mit Antworten & Erklärungen
  - Kategorien-Filter
  - Zufalls-Reihenfolge
  - Fortschritts-Tracking (localStorage)
  - Falsche Fragen wiederholen
  - Referenzen zur Theorie
  - Keyboard-Shortcuts (Space, Enter, 1, 2)

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

## Verwendung

### Markdown-Dateien bearbeiten

Alle Inhalte sind in **Markdown** geschrieben. Du kannst sie einfach bearbeiten:

1. Öffne die Datei in einem Text-Editor (z. B. VS Code, Sublime Text)
2. Bearbeite den Inhalt
3. Speichere die Datei
4. MkDocs lädt die Änderungen automatisch neu (bei `mkdocs serve`)

### Neue Seite hinzufügen

1. Erstelle eine neue `.md`-Datei in `docs/` (z. B. `docs/neues-thema.md`)
2. Füge die Seite in `mkdocs.yml` unter `nav:` hinzu:

```yaml
nav:
  - ...
  - Neues Thema: neues-thema.md
```

3. MkDocs zeigt die Seite automatisch in der Navigation an

---

## MkDocs-Theme: Material

Dieses Projekt nutzt das **Material for MkDocs** Theme:

- Modern und responsive
- Dunkler/heller Modus
- Suchfunktion
- Syntax-Highlighting
- Admonitions (Info-Boxen)
- Tabs, Tabellen, etc.

**Dokumentation:** https://squidfunk.github.io/mkdocs-material/

---

## Erweiterungen

### Geplante Features

- [x] ✅ Interaktive Prüfungs-App (HTML/JS mit JSON-Fragen)
  - [x] ✅ Randomizer
  - [x] ✅ Filter nach Themen
  - [x] ✅ Fortschritts-Tracking
  - [x] ✅ Falsche Fragen wiederholen
  - [x] ✅ Referenzen zur Theorie
- [ ] Erweiterung auf 120+ Prüfungsfragen (aktuell: 25)
- [ ] Videos einbetten (YouTube)
- [ ] Bilder hinzufügen (Fahrzeuge, Geräte)
- [ ] Spaced Repetition System (SRS)

### Beiträge willkommen!

Du möchtest etwas verbessern oder ergänzen? Pull Requests sind willkommen!

---

## Lizenz

Dieses Projekt ist für **private, nicht-kommerzielle Nutzung** gedacht.

Die Inhalte basieren auf öffentlich verfügbaren Feuerwehr-Dienstvorschriften (FwDV), dem Bayerischen Feuerwehrgesetz (BayFwG) und allgemein bekanntem Feuerwehrwissen.

---

## Kontakt & Feedback

Bei Fragen, Anregungen oder Fehlern:
- Erstelle ein Issue auf GitHub
- Oder kontaktiere die FF Goldkronach direkt

---

## Changelog

### Version 1.0 (11.01.2026)

- ✅ Vollständige Theorie-Kapitel (5)
- ✅ Praxis-Kapitel (3)
- ✅ Begriffe & Abkürzungen (100+)
- ✅ Prüfungsfragen (25, Ziel: 120+)
- ✅ Ressourcen-Sammlung
- ✅ Lernfortschritt-Tracking
- ✅ MkDocs-Setup mit Material Theme
- ✅ **Interaktive Quiz-App** mit Tracking & Review-Funktion
- ✅ Landing Page mit direkten Links zu Doku & Quiz
- ✅ GitHub Pages ready

### Geplant für Version 1.1

- [ ] 95+ weitere Prüfungsfragen (Ziel: 120+)
- [ ] Bilder & Videos einbetten
- [ ] Spaced Repetition System

---

## Danksagung

- **Landesfeuerwehrverband Bayern (LFV)** für die Bereitstellung offizieller Lernmaterialien
- **Kreisfeuerwehrverband Bayreuth** für die MTA-Lehrgänge
- Alle Feuerwehrkameraden, die mit Rat und Tat zur Seite stehen

---

**Viel Erfolg bei der MTA!**
