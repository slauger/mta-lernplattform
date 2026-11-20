// Zweisprachigkeit (Deutsch / Ukrainisch) für Quiz und Fragenübersicht.
// Übersetzungen der Fragen liegen in questions-<katalog>-uk.json ({ "<id>": { question, answers, explanation } }).
// Im Ukrainisch-Modus wird der deutsche Originaltext klein darunter angezeigt (die Prüfung ist auf Deutsch).

const LANG_STORAGE_KEY = 'quizLang';

const UI_TEXTS = {
    de: {
        quizTitle: 'MTA Prüfungs-Quiz',
        quizHeading: '🚒 MTA Prüfungs-Quiz',
        quizSubtitle: 'Interaktive Prüfungsvorbereitung für die Modulare Truppausbildung',
        browseTitle: 'Fragen durchsehen - MTA Quiz',
        browseHeading: '📚 Fragen durchsehen',
        browseSubtitle: 'Alle Fragen mit Antworten zum Lernen und Wiederholen',
        exam: 'Prüfung:',
        groupLernbar: 'Aktuell: Feuerwehr-Lernbar (Stand 20.11.2026)',
        groupArchiv: 'Archiv: Prüfungsgenerator (Stand 12.01.2026, veraltet)',
        catalogZwp: 'Zwischenprüfung (Basismodul), 193 Fragen',
        catalogAbp: 'Abschlussprüfung (Truppführer), 60 Fragen',
        catalogBasis: 'Basismodul, 214 Fragen (alt)',
        catalogTf: 'Truppführer, 60 Fragen (alt)',
        sourceLernbar: 'Quelle: offizielle Übungs-Quiz der Feuerwehr-Lernbar.Bayern (Staatliche Feuerwehrschulen), Stand 20.11.2026. Das ist der aktuelle Fragenkatalog.',
        sourceArchiv: 'Archiv: Fragenkatalog aus dem früheren Prüfungsgenerator, Stand 12.01.2026. Seitdem wurden viele Fragen und einige Lösungen geändert. Zum Lernen den aktuellen Katalog verwenden!',
        thema: 'Thema / Kursabend:',
        allThemen: 'Alle Themen',
        questionCount: 'Anzahl Fragen:',
        randomize: 'Fragen zufällig durchmischen',
        randomizeAnswers: 'Antworten durchmischen',
        start: '📝 Quiz starten',
        newOnly: '🆕 Nur neue Fragen',
        wrongOnly: '❌ Nur falsche Fragen',
        resetProgress: '🔄 Fortschritt zurücksetzen',
        browseAll: '📚 Alle Fragen durchsehen',
        backOverview: '← Zurück zur Übersicht',
        backOverviewPlain: 'Zurück zur Übersicht',
        toQuiz: '← Zum interaktiven Quiz',
        progress: 'Fortschritt:',
        quizDone: '🎉 Quiz abgeschlossen!',
        allDone: 'Du hast alle Fragen durchgearbeitet.',
        newQuiz: 'Neues Quiz starten',
        questionOf: (i, n) => `Frage ${i} von ${n}`,
        submit: 'Antwort abgeben',
        correct: '✅ Richtig!',
        wrong: '❌ Falsch!',
        moreTheory: '📖 Mehr dazu im Theorie-Kapitel →',
        next: 'Weiter →',
        scoreCorrect: (c, n) => `${c}/${n} richtig`,
        rightLabel: '✅ Richtig:',
        wrongLabel: '❌ Falsch:',
        skippedLabel: '⏭️ Übersprungen:',
        tip: '💡 Tipp:',
        tipWrong: (n) => `Du hast ${n} Frage(n) falsch beantwortet.`,
        tipSaved: 'Diese werden automatisch gespeichert für spätere Wiederholung!',
        reviewWrong: (n) => `❌ Falsche Fragen wiederholen (${n})`,
        learnProgress: '📊 Lernfortschritt:',
        seen: '✅ Bearbeitet:',
        unseen: '🆕 Neue Fragen:',
        wrongAnswered: '❌ Falsch beantwortet:',
        loadError: 'Fehler beim Laden der Fragen. Bitte Seite neu laden.',
        loadErrorShort: '❌ Fehler beim Laden der Fragen',
        loading: 'Lade Fragen...',
        noQuestions: 'Keine Fragen gefunden!',
        pickOne: 'Bitte wähle mindestens eine Antwort!',
        allSeen: '🎉 Du hast bereits alle Fragen bearbeitet!\n\nNutze "Fortschritt zurücksetzen" um von vorne zu beginnen.',
        noWrong: 'Keine falsch beantworteten Fragen gespeichert!',
        noWrongThema: 'Keine falsch beantworteten Fragen zu diesem Thema gespeichert!',
        confirmReset: (name) => `Möchtest du wirklich deinen Lernfortschritt für "${name}" zurücksetzen?\n\n- Gesehene Fragen\n- Falsch beantwortete Fragen\n\nDiese Aktion kann nicht rückgängig gemacht werden!`,
        resetDone: '✅ Fortschritt wurde zurückgesetzt!',
        statsQuestions: (n) => `${n} Fragen`,
        statsImages: 'Mit Bildern',
        explanation: '💡 Erklärung:',
        imageAlt: 'Fragebild',
    },
    uk: {
        quizTitle: 'Тест MTA',
        quizHeading: '🚒 Тест до іспиту MTA',
        quizSubtitle: 'Інтерактивна підготовка до іспиту модульної підготовки ланки (MTA)',
        browseTitle: 'Перегляд питань – тест MTA',
        browseHeading: '📚 Перегляд питань',
        browseSubtitle: 'Усі питання з відповідями для навчання й повторення',
        exam: 'Іспит (Prüfung):',
        groupLernbar: 'Актуально: Feuerwehr-Lernbar (стан 20.11.2026)',
        groupArchiv: 'Архів: Prüfungsgenerator (стан 12.01.2026, застаріло)',
        catalogZwp: 'Проміжний іспит (Zwischenprüfung, базовий модуль), 193 питання',
        catalogAbp: 'Підсумковий іспит (Abschlussprüfung, командир ланки), 60 питань',
        catalogBasis: 'Базовий модуль (Basismodul), 214 питань (старе)',
        catalogTf: 'Командир ланки (Truppführer), 60 питань (старе)',
        sourceLernbar: 'Джерело: офіційні тренувальні тести Feuerwehr-Lernbar.Bayern (Державні пожежні школи Баварії), стан 20.11.2026. Це актуальний каталог питань.',
        sourceArchiv: 'Архів: каталог питань із колишнього генератора іспитів (Prüfungsgenerator), стан 12.01.2026. Відтоді багато питань і деякі відповіді змінено. Для навчання використовуй актуальний каталог!',
        thema: 'Тема / заняття:',
        allThemen: 'Усі теми',
        questionCount: 'Кількість питань:',
        randomize: 'Перемішати питання',
        randomizeAnswers: 'Перемішати відповіді',
        start: '📝 Почати тест',
        newOnly: '🆕 Лише нові питання',
        wrongOnly: '❌ Лише помилкові питання',
        resetProgress: '🔄 Скинути прогрес',
        browseAll: '📚 Переглянути всі питання',
        backOverview: '← Назад до огляду',
        backOverviewPlain: 'Назад до огляду',
        toQuiz: '← До інтерактивного тесту',
        progress: 'Прогрес:',
        quizDone: '🎉 Тест завершено!',
        allDone: 'Ти пройшов усі питання.',
        newQuiz: 'Почати новий тест',
        questionOf: (i, n) => `Питання ${i} з ${n}`,
        submit: 'Відповісти',
        correct: '✅ Правильно!',
        wrong: '❌ Неправильно!',
        moreTheory: '📖 Детальніше в розділі теорії →',
        next: 'Далі →',
        scoreCorrect: (c, n) => `${c}/${n} правильно`,
        rightLabel: '✅ Правильно:',
        wrongLabel: '❌ Неправильно:',
        skippedLabel: '⏭️ Пропущено:',
        tip: '💡 Порада:',
        tipWrong: (n) => `Ти неправильно відповів на ${n} питань(ня).`,
        tipSaved: 'Вони автоматично зберігаються для подальшого повторення!',
        reviewWrong: (n) => `❌ Повторити помилкові питання (${n})`,
        learnProgress: '📊 Прогрес навчання:',
        seen: '✅ Опрацьовано:',
        unseen: '🆕 Нові питання:',
        wrongAnswered: '❌ Неправильні відповіді:',
        loadError: 'Помилка під час завантаження питань. Онови сторінку.',
        loadErrorShort: '❌ Помилка під час завантаження питань',
        loading: 'Завантаження питань...',
        noQuestions: 'Питань не знайдено!',
        pickOne: 'Обери щонайменше одну відповідь!',
        allSeen: '🎉 Ти вже опрацював усі питання!\n\nНатисни «Скинути прогрес», щоб почати спочатку.',
        noWrong: 'Збережених помилкових питань немає!',
        noWrongThema: 'Збережених помилкових питань із цієї теми немає!',
        confirmReset: (name) => `Справді скинути твій прогрес навчання для «${name}»?\n\n- Переглянуті питання\n- Питання з неправильними відповідями\n\nЦю дію неможливо скасувати!`,
        resetDone: '✅ Прогрес скинуто!',
        statsQuestions: (n) => `${n} питань`,
        statsImages: 'З зображеннями',
        explanation: '💡 Пояснення:',
        imageAlt: 'Зображення до питання',
    },
};

function detectLang() {
    const param = new URLSearchParams(window.location.search).get('lang');
    if (param === 'uk' || param === 'de') return param;
    try {
        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (saved === 'uk' || saved === 'de') return saved;
    } catch (e) { /* localStorage nicht verfügbar */ }
    if (document.referrer && document.referrer.includes('/uk/')) return 'uk';
    return 'de';
}

let currentLang = detectLang();

function t(key, ...args) {
    const value = UI_TEXTS[currentLang][key] ?? UI_TEXTS.de[key];
    return typeof value === 'function' ? value(...args) : value;
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Ukrainischer Text mit deutschem Original darunter (im Deutsch-Modus nur Deutsch)
function bilingual(de, uk) {
    if (currentLang !== 'uk' || !uk) return de;
    return `${uk}<span class="de-original" lang="de">${de}</span>`;
}

function qText(question) { return bilingual(question.question, question._uk?.question); }
function answerText(question, idx) { return bilingual(question.answers[idx], question._uk?.answers?.[idx]); }
function explanationText(question) { return bilingual(question.explanation, question._uk?.explanation); }

// Lädt die Übersetzungen zu einem Katalog (Fehler → leeres Objekt, d. h. deutscher Fallback)
async function loadTranslations(catalogFile) {
    try {
        const response = await fetch(catalogFile.replace(/\.json$/, '-uk.json'));
        if (!response.ok) return {};
        return await response.json();
    } catch (e) {
        console.warn('Keine ukrainischen Übersetzungen geladen:', e);
        return {};
    }
}

// Hängt die Übersetzung als question._uk an (nur wenn die Antwortanzahl passt)
function attachTranslations(questions, translations) {
    questions.forEach(q => {
        const tr = translations[String(q.id)];
        q._uk = (tr && Array.isArray(tr.answers) && tr.answers.length === q.answers.length) ? tr : null;
    });
}

// Setzt alle festen Texte (Elemente mit data-i18n) und den Sprachumschalter
function applyStaticTexts(titleKey) {
    document.documentElement.lang = currentLang;
    if (titleKey) document.title = t(titleKey);
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-label]').forEach(el => { el.label = t(el.dataset.i18nLabel); });
    updateCatalogSource();
    document.querySelectorAll('.lang-switch button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
}

// Baut den Umschalter "Deutsch | Українська" in das Element mit der angegebenen ID
function initLangSwitch(containerId, onChange) {
    const container = document.getElementById(containerId);
    container.classList.add('lang-switch');
    container.innerHTML =
        '<button type="button" data-lang="de" lang="de">Deutsch</button>' +
        '<button type="button" data-lang="uk" lang="uk">Українська</button>';
    container.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.lang === currentLang) return;
            currentLang = btn.dataset.lang;
            try { localStorage.setItem(LANG_STORAGE_KEY, currentLang); } catch (e) { /* ignorieren */ }
            onChange();
        });
    });
}

// Hinweis unter der Katalogauswahl: aktueller Stand oder Archiv
function updateCatalogSource() {
    const select = document.getElementById('catalogFilter');
    const hint = document.getElementById('catalogSource');
    if (!select || !hint) return;
    const archiv = !select.value.startsWith('questions-lernbar-');
    hint.textContent = t(archiv ? 'sourceArchiv' : 'sourceLernbar');
    hint.classList.toggle('archiv', archiv);
}

// Fragebild: Datei im Ordner bilder/ (src) oder eingebettet (data, alte Kataloge)
function imageSrc(img) { return img.src || `data:${img.mime_type};base64,${img.data}`; }

// Navigationsziele abhängig von der Sprache
function overviewUrl() { return currentLang === 'uk' ? '../uk/' : '../'; }
function pageUrl(page) { return `${page}?lang=${currentLang}`; }
