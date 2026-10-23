// MTA-Themen = Kursabende des Ausbildungsplans (Feld "thema" in den Fragenkatalogen)
const THEMEN = {
    recht:         'Rechtsgrundlagen & Organisation (1.0, 2.1, 2.2)',
    brennen:       'Brennen & Löschen (3.0, 9.3)',
    psa:           'PSA & Löschgeräte (5.1–5.4)',
    erstehilfe:    'Erste Hilfe & Rettung (6.1, 5.12)',
    belastung:     'Physische & psychische Belastung (6.2)',
    einsatz:       'Verhalten im Einsatz & Hygiene (7.1, 7.2)',
    funk:          'Digitalfunk (14.1–14.6)',
    gefahr:        'Verhalten bei Gefahr & ABC (8.0, 12.1, 12.2)',
    fahrzeuge:     'Fahrzeugkunde & neue Technologien (4.1, 4.2, 13)',
    knoten:        'Knoten & Stiche, Warngeräte (5.10, 5.13)',
    absturz:       'Leitern, Rettungsgeräte & Sichern gegen Absturz (5.9, 5.11, 10.x)',
    thl:           'Technische Hilfeleistung (5.7, 5.8, 11.x)',
    wasser:        'Schläuche, Armaturen & Wasserversorgung (5.5, 9.1, 9.2, 9.4)',
    loescheinsatz: 'Einheiten im Löscheinsatz (5.6, 9.5–9.10)',
};

// Füllt ein <select> mit allen Themen und übernimmt ?thema=... / ?katalog=... aus der URL
function initThemaFilter(themaSelectId, catalogSelectId) {
    const select = document.getElementById(themaSelectId);
    select.innerHTML = '<option value="">Alle Themen</option>' +
        Object.entries(THEMEN).map(([key, label]) => `<option value="${key}">${label}</option>`).join('');

    const params = new URLSearchParams(window.location.search);
    if (params.get('thema') in THEMEN) select.value = params.get('thema');
    const katalog = params.get('katalog');
    if (katalog) {
        const catalogSelect = document.getElementById(catalogSelectId);
        const file = `questions-mta-${katalog}.json`;
        if ([...catalogSelect.options].some(o => o.value === file)) catalogSelect.value = file;
    }
}

function filterByThema(questions, themaSelectId) {
    const thema = document.getElementById(themaSelectId)?.value;
    return thema ? questions.filter(q => q.thema === thema) : questions;
}

function themaLabel(question) {
    return THEMEN[question.thema] || question.category;
}
