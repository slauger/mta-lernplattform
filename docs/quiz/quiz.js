// Quiz State
let allQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let questionsAnswered = 0;
let correctCount = 0;
let wrongCount = 0;
let wrongQuestionIds = []; // IDs der falsch beantworteten Fragen

// Load questions from JSON
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        allQuestions = await response.json();
        populateCategoryFilter();
        loadWrongQuestions(); // Load from localStorage
        console.log(`Loaded ${allQuestions.length} questions`);
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Fehler beim Laden der Fragen. Bitte Seite neu laden.');
    }
}

// Populate category filter dropdown
function populateCategoryFilter() {
    const categories = ['all', ...new Set(allQuestions.map(q => q.category))];
    const select = document.getElementById('categoryFilter');

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat === 'all' ? 'Alle Kategorien' : cat;
        select.appendChild(option);
    });
}

// Start Quiz
function startQuiz() {
    const category = document.getElementById('categoryFilter').value;
    const count = parseInt(document.getElementById('questionCount').value);
    const randomize = document.getElementById('randomize').checked;

    // Filter questions by category
    let filteredQuestions = category === 'all'
        ? [...allQuestions]
        : allQuestions.filter(q => q.category === category);

    // Randomize if selected
    if (randomize) {
        filteredQuestions = shuffleArray(filteredQuestions);
    }

    // Limit to selected count
    currentQuestions = filteredQuestions.slice(0, Math.min(count, filteredQuestions.length));

    if (currentQuestions.length === 0) {
        alert('Keine Fragen gefunden! Wähle eine andere Kategorie.');
        return;
    }

    // Reset state
    currentQuestionIndex = 0;
    questionsAnswered = 0;
    correctCount = 0;
    wrongCount = 0;

    // Show quiz UI
    document.getElementById('controls').classList.add('hidden');
    document.getElementById('quizCard').classList.remove('hidden');
    document.getElementById('progress').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');

    // Display first question
    displayQuestion();
}

// Display current question
function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];

    document.getElementById('questionNumber').textContent =
        `Frage ${currentQuestionIndex + 1} von ${currentQuestions.length}`;
    document.getElementById('category').textContent = question.category;
    document.getElementById('question').textContent = question.question;

    // Hide answer initially
    document.getElementById('answerReveal').classList.add('hidden');

    // Update progress
    updateProgress();
}

// Show answer and explanation
function showAnswer() {
    const question = currentQuestions[currentQuestionIndex];

    document.getElementById('answer').textContent = question.answer;
    document.getElementById('explanation').textContent = question.explanation;

    // Set reference link
    const referenceLink = document.getElementById('referenceHref');
    referenceLink.href = question.reference;

    document.getElementById('answerReveal').classList.remove('hidden');
}

// Mark question as correct
function markCorrect() {
    correctCount++;
    nextQuestion();
}

// Mark question as wrong
function markWrong() {
    wrongCount++;
    const question = currentQuestions[currentQuestionIndex];

    // Add to wrong questions if not already there
    if (!wrongQuestionIds.includes(question.id)) {
        wrongQuestionIds.push(question.id);
        saveWrongQuestions();
    }

    nextQuestion();
}

// Go to next question
function nextQuestion() {
    currentQuestionIndex++;
    questionsAnswered++;

    if (currentQuestionIndex >= currentQuestions.length) {
        showResults();
    } else {
        displayQuestion();
    }
}

// Update progress bar
function updateProgress() {
    const progress = (questionsAnswered / currentQuestions.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.getElementById('progressText').textContent =
        `${questionsAnswered}/${currentQuestions.length}`;
}

// Show results
function showResults() {
    document.getElementById('quizCard').classList.add('hidden');
    document.getElementById('progress').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');

    const percentage = Math.round((correctCount / questionsAnswered) * 100);

    document.getElementById('score').textContent =
        `${correctCount}/${questionsAnswered} richtig (${percentage}%)`;

    // Show stats
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>🎉 Quiz abgeschlossen!</h2>
        <div class="score">${correctCount}/${questionsAnswered} richtig</div>
        <p style="font-size: 24px; color: #667eea; margin: 20px 0;">${percentage}%</p>
        <div style="text-align: left; background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <div style="margin-bottom: 10px;">✅ Richtig: <strong>${correctCount}</strong></div>
            <div style="margin-bottom: 10px;">❌ Falsch: <strong>${wrongCount}</strong></div>
            <div>⏭️ Übersprungen: <strong>${questionsAnswered - correctCount - wrongCount}</strong></div>
        </div>
        ${wrongQuestionIds.length > 0 ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <strong>💡 Tipp:</strong> Du hast ${wrongQuestionIds.length} Frage(n) falsch beantwortet.
                <br>Diese werden automatisch gespeichert für spätere Wiederholung!
            </div>
        ` : ''}
        <button class="btn-primary" onclick="resetQuiz()">Neues Quiz starten</button>
        ${wrongQuestionIds.length > 0 ? `
            <button class="btn-wrong" onclick="reviewWrongQuestions()" style="margin-top: 10px;">
                ❌ Falsche Fragen wiederholen (${wrongQuestionIds.length})
            </button>
        ` : ''}
    `;
}

// Review only wrong questions
function reviewWrongQuestions() {
    if (wrongQuestionIds.length === 0) {
        alert('Keine falschen Fragen gespeichert!');
        return;
    }

    currentQuestions = allQuestions.filter(q => wrongQuestionIds.includes(q.id));
    currentQuestionIndex = 0;
    questionsAnswered = 0;
    correctCount = 0;
    wrongCount = 0;

    document.getElementById('results').classList.add('hidden');
    document.getElementById('quizCard').classList.remove('hidden');
    document.getElementById('progress').classList.remove('hidden');

    displayQuestion();
}

// Reset quiz
function resetQuiz() {
    document.getElementById('controls').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
}

// Save wrong questions to localStorage
function saveWrongQuestions() {
    localStorage.setItem('wrongQuestions', JSON.stringify(wrongQuestionIds));
}

// Load wrong questions from localStorage
function loadWrongQuestions() {
    const saved = localStorage.getItem('wrongQuestions');
    if (saved) {
        wrongQuestionIds = JSON.parse(saved);
    }
}

// Clear wrong questions
function clearWrongQuestions() {
    if (confirm('Möchtest du wirklich alle falsch beantworteten Fragen löschen?')) {
        wrongQuestionIds = [];
        saveWrongQuestions();
        alert('Falsche Fragen wurden gelöscht!');
        location.reload();
    }
}

// Utility: Shuffle array (Fisher-Yates)
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (document.getElementById('quizCard').classList.contains('hidden')) return;

    // Ignore keyboard shortcuts if modifier keys are pressed (CMD, CTRL, ALT)
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    switch(e.key) {
        case 'ArrowRight':
        case 'Enter':
            if (!document.getElementById('answerReveal').classList.contains('hidden')) {
                markCorrect(); // Assume correct if answer shown and Enter pressed
            }
            break;
        case ' ':
        case 'Spacebar':
            showAnswer();
            e.preventDefault();
            break;
        case '1':
            if (!document.getElementById('answerReveal').classList.contains('hidden')) {
                markCorrect();
            }
            break;
        case '2':
            if (!document.getElementById('answerReveal').classList.contains('hidden')) {
                markWrong();
            }
            break;
    }
});

// Initialize
loadQuestions();
