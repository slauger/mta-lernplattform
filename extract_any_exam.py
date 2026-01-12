#!/usr/bin/env python3
"""
🔥 Generic Exam Extractor für fra-gen.sfs-bayern.de

Extrahiert automatisch ALLE Fragen und Lösungen für jeden verfügbaren
Prüfungskatalog der Bayerischen Feuerwehrschulen.

Usage:
    python3 extract_any_exam.py                    # Zeigt verfügbare Kataloge
    python3 extract_any_exam.py 5                  # MTA Basismodul
    python3 extract_any_exam.py 6 custom_output    # Mit custom Output-Verzeichnis

Features:
    ✓ Extrahiert alle verfügbaren Fragen (nicht nur Prüfungsanzahl)
    ✓ Lösungen direkt aus HTML (keine PDF-Parsing notwendig)
    ✓ Unterstützt Multiple-Choice (Truppführer, etc.)
    ✓ Speichert in JSON-Format für Web-App
"""

import requests
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import re
import json
import os
import sys
import base64

BASE_URL = "https://fra-gen.sfs-bayern.de/"

# Available Kataloge (exam types)
# Diese Liste kann erweitert werden mit weiteren verfügbaren Prüfungen
KATALOGE = {
    '5': {
        'name': 'MTA - Basismodul (Zwischenprüfung)',
        'output_file': 'questions-mta-basismodul.json'
    },
    '6': {
        'name': 'MTA - Truppführer (Abschlussprüfung)',
        'output_file': 'questions-mta-truppfuehrer.json'
    },
    '7': {
        'name': 'Atemschutzgeräteträger',
        'output_file': 'questions-atemschutz.json'
    },
    '8': {
        'name': 'Sprechfunker',
        'output_file': 'questions-sprechfunk.json'
    },
    '9': {
        'name': 'Maschinist für Löschfahrzeuge',
        'output_file': 'questions-maschinist.json'
    },
}

def extract_exam(katalog_id, katalog_name, output_dir):
    """
    Extract all questions and solutions for a given Katalog
    """
    print("=" * 80)
    print(f"EXAM EXTRACTOR: {katalog_name}")
    print(f"Katalog ID: {katalog_id}")
    print("=" * 80)

    os.makedirs(output_dir, exist_ok=True)

    # Create session
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    })

    print("\n📍 Step 1: Loading homepage...")
    session.get(BASE_URL)

    print("📝 Step 2: Loading exam form...")
    session.get(urljoin(BASE_URL, "Pruefung/PruefungSelectPartial"))

    print(f"📚 Step 3: Loading categories for {katalog_name}...")
    response = session.get(urljoin(BASE_URL, f"Pruefung/BereicheSelectPartial?katalogId={katalog_id}"))

    # Parse categories
    soup = BeautifulSoup(response.text, 'html.parser')
    categories = []
    inputs = soup.find_all('input')

    for inp in inputs:
        name = inp.get('name', '')
        value = inp.get('value', '')

        match = re.match(r'\[(\d+)\]\.Id', name)
        if match:
            idx = match.group(1)
            cat_id = value

            max_fragen_input = soup.find('input', attrs={'name': f'[{idx}].MaxFragen'})
            max_fragen = max_fragen_input.get('value', '0') if max_fragen_input else '0'

            categories.append({
                'index': int(idx),
                'id': cat_id,
                'max_fragen': int(max_fragen)
            })

    total_questions = sum(cat['max_fragen'] for cat in categories)
    print(f"   Found {len(categories)} categories, {total_questions} total questions")

    print("🎲 Step 4: Generating exam with ALL questions...")

    # Build form data
    form_data = {
        'BereicheSaveButton': 'Prüfung generieren',
        'pruefungsname': f'{katalog_name} - ALL Questions',
    }

    for cat in categories:
        idx = cat['index']
        form_data[f'[{idx}].Id'] = cat['id']
        form_data[f'[{idx}].MaxFragen'] = str(cat['max_fragen'])
        form_data[f'[{idx}].AnzAbsolut'] = str(cat['max_fragen'])

    response = session.post(
        urljoin(BASE_URL, f"Pruefung/BereicheSelectPartial?Length={len(categories)}"),
        data=form_data
    )

    print("🌐 Step 5: Getting HTML with all questions...")
    response = session.get(urljoin(BASE_URL, "Pruefung/PruefungPartial"))

    if response.status_code != 200:
        print(f"❌ Failed to get HTML: {response.status_code}")
        return None

    html_content = response.text

    # Save HTML to temp (for debugging, optional)
    # Uncomment if you need to inspect the raw HTML:
    # html_file = os.path.join(output_dir, 'exam_all_questions.html')
    # with open(html_file, 'w', encoding='utf-8') as f:
    #     f.write(html_content)

    print(f"✅ HTML received: {len(html_content):,} characters")

    # Parse HTML
    print("📖 Step 6: Parsing questions and solutions...")
    soup = BeautifulSoup(html_content, 'html.parser')
    aufgaben = soup.find_all('div', class_='aufgabe')

    questions = []

    for idx, aufgabe in enumerate(aufgaben, 1):
        # Category
        category_div = aufgabe.find('div', class_='col-sm-4')
        category = category_div.get_text(strip=True) if category_div else 'Unbekannt'

        # Question text
        frage_div = aufgabe.find('div', class_='frage')
        if not frage_div:
            continue

        question_text = frage_div.get_text(strip=True)

        # Extract images from question (in collapse div)
        question_images = []
        collapse_div = aufgabe.find('div', class_='collapse')
        if collapse_div:
            img_tags = collapse_div.find_all('img', class_='dxeImage_MaterialCompact')
            for img in img_tags:
                src = img.get('src', '')
                if src and not src.endswith('q68mg'):  # Skip placeholder images
                    try:
                        # Download image
                        img_url = urljoin(BASE_URL, src)
                        img_response = session.get(img_url)
                        if img_response.status_code == 200:
                            # Convert to base64
                            img_base64 = base64.b64encode(img_response.content).decode('utf-8')
                            # Detect mime type from content
                            mime_type = img_response.headers.get('Content-Type', 'image/png')
                            question_images.append({
                                'data': img_base64,
                                'mime_type': mime_type
                            })
                    except Exception as e:
                        print(f"   ⚠️ Could not download image for Q{idx}: {e}")

        # Find answers
        answers = []
        correct_indices = []

        li_elements = aufgabe.find_all('li')

        for ans_idx, li in enumerate(li_elements):
            checkbox = li.find('input', type='checkbox')
            if not checkbox:
                continue

            # Check if correct (checked="checked")
            is_correct = checkbox.get('checked') == 'checked'
            if is_correct:
                correct_indices.append(ans_idx)

            # Remove input elements
            for inp in li.find_all('input'):
                inp.decompose()

            answer_text = li.get_text(strip=True)
            answers.append(answer_text)

        # Build question object
        if len(correct_indices) == 1:
            correct = correct_indices[0]
        else:
            correct = correct_indices

        correct_letters = [chr(97 + i) for i in correct_indices]
        if len(correct_letters) == 1:
            explanation = f"Laut Lösungsbogen: {correct_letters[0].upper()}"
        else:
            explanation = f"Laut Lösungsbogen (Multiple Choice): {', '.join([l.upper() for l in correct_letters])}"

        question = {
            'id': idx,
            'category': category,
            'question': question_text,
            'answers': answers,
            'correct': correct,
            'explanation': explanation,
            'multiple_choice': len(correct_indices) > 1
        }

        # Add images if present
        if question_images:
            question['images'] = question_images

        questions.append(question)

    print(f"\n📊 Extracted {len(questions)} questions")
    print(f"   - Single choice: {sum(1 for q in questions if not q['multiple_choice'])}")
    print(f"   - Multiple choice: {sum(1 for q in questions if q['multiple_choice'])}")
    print(f"   - With images: {sum(1 for q in questions if 'images' in q and q['images'])}")

    # Save to JSON
    json_file = os.path.join(output_dir, 'questions.json')
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)

    print(f"\n💾 Saved to: {json_file}")

    return questions

if __name__ == "__main__":
    # Show available exams
    if len(sys.argv) < 2:
        print("=" * 80)
        print("🔥 FEUERWEHR QUIZ EXTRACTOR")
        print("=" * 80)
        print("\nExtrahiert alle Fragen und Lösungen von fra-gen.sfs-bayern.de")
        print("\n📚 Verfügbare Prüfungen:")
        print("-" * 80)
        for kid, info in KATALOGE.items():
            print(f"  [{kid}] {info['name']}")
            print(f"      → Output: docs/quiz/{info['output_file']}")
        print("\n" + "=" * 80)
        print("Usage:")
        print("  python3 extract_any_exam.py <katalog_id> [output_dir]")
        print("\nBeispiele:")
        print("  python3 extract_any_exam.py 5          # MTA Basismodul → docs/quiz/")
        print("  python3 extract_any_exam.py 7 custom/  # Atemschutz → custom/")
        print("=" * 80)
        sys.exit(0)

    katalog_id = sys.argv[1]

    # Default output to docs/quiz/ with proper filename
    if katalog_id in KATALOGE:
        katalog_info = KATALOGE[katalog_id]
        katalog_name = katalog_info['name']
        default_output = 'docs/quiz'
        output_filename = katalog_info['output_file']
    else:
        katalog_name = f"Katalog {katalog_id}"
        default_output = f"output/katalog_{katalog_id}"
        output_filename = 'questions.json'

    output_dir = sys.argv[2] if len(sys.argv) > 2 else default_output

    questions = extract_exam(katalog_id, katalog_name, output_dir)

    if questions:
        # Save with proper filename
        final_output = os.path.join(output_dir, output_filename)
        with open(final_output, 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)

        print("\n" + "=" * 80)
        print("✅ EXTRACTION COMPLETE!")
        print("=" * 80)
        print(f"\n📄 Output: {final_output}")
        print(f"📊 Questions: {len(questions)}")
        print(f"   - Single choice: {sum(1 for q in questions if not q['multiple_choice'])}")
        print(f"   - Multiple choice: {sum(1 for q in questions if q['multiple_choice'])}")
        print(f"   - With images: {sum(1 for q in questions if 'images' in q and q['images'])}")
        print(f"\n💡 First 3 questions:")
        for q in questions[:3]:
            correct_str = chr(97 + q['correct']) if isinstance(q['correct'], int) else [chr(97 + i) for i in q['correct']]
            img_marker = " 🖼️" if 'images' in q and q['images'] else ""
            print(f"   Q{q['id']}: {q['question'][:65]}... → {correct_str}{img_marker}")
