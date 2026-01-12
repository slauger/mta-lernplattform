// Quiz State
let allQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let questionsAnswered = 0;
let correctCount = 0;
let wrongCount = 0;
let wrongQuestionIds = []; // IDs der falsch beantworteten Fragen
let seenQuestionIds = []; // IDs der bereits gesehenen Fragen

// Load questions from JSON
async function loadQuestions() {
    try {
        // Get selected catalog
        const catalogSelect = document.getElementById('catalogFilter');
        const catalogFile = catalogSelect ? catalogSelect.value : 'questions-mta-basismodul.json';

        const response = await fetch(catalogFile);
        allQuestions = await response.json();
        loadWrongQuestions(); // Load from localStorage
        loadSeenQuestions(); // Load from localStorage
        console.log(`Loaded ${allQuestions.length} questions from ${catalogFile}`);

        // Update max question count based on available questions
        const questionCountInput = document.getElementById('questionCount');
        questionCountInput.max = allQuestions.length;

        // Update progress display
        updateProgressDisplay();

    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Fehler beim Laden der Fragen. Bitte Seite neu laden.');
    }
}

// Start Quiz
function startQuiz() {
    const count = parseInt(document.getElementById('questionCount').value);
    const randomize = document.getElementById('randomize').checked;

    // Start with all questions
    let filteredQuestions = [...allQuestions];

    // Randomize if selected
    if (randomize) {
        filteredQuestions = shuffleArray(filteredQuestions);
    }

    // Limit to selected count
    currentQuestions = filteredQuestions.slice(0, Math.min(count, filteredQuestions.length));

    if (currentQuestions.length === 0) {
        alert('Keine Fragen gefunden!');
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

    // Shuffle answers if option is enabled (and not already shuffled for this question)
    const randomizeAnswers = document.getElementById('randomizeAnswers')?.checked ?? false;
    if (randomizeAnswers && !question._answersShuffled) {
        shuffleAnswers(question);
        question._answersShuffled = true;
    }

    document.getElementById('questionNumber').textContent =
        `Frage ${currentQuestionIndex + 1} von ${currentQuestions.length}`;
    document.getElementById('category').textContent = question.category;

    // Build question HTML with answers
    let questionHTML = `<p style="margin-bottom: 20px;">${question.question}</p>`;

    // Add images if present
    if (question.images && question.images.length > 0) {
        questionHTML += '<div style="margin: 20px 0;">';
        question.images.forEach(img => {
            questionHTML += `<img src="data:${img.mime_type};base64,${img.data}" style="max-width: 100%; border-radius: 8px; margin: 10px 0;" alt="Fragebild">`;
        });
        questionHTML += '</div>';
    }

    // Add answer options
    if (question.multiple_choice) {
        // Multiple Choice - Checkboxes
        questionHTML += '<div style="margin-top: 20px;" id="answerOptions">';
        question.answers.forEach((answer, idx) => {
            const letter = String.fromCharCode(97 + idx).toUpperCase();
            questionHTML += `
                <div class="answer-option" data-index="${idx}" style="padding: 15px; margin: 8px 0; background: #f8f9fa; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;">
                    <label style="cursor: pointer; display: flex; align-items: center; width: 100%;">
                        <input type="checkbox" id="answer_${idx}" style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
                        <strong style="margin-right: 8px;">${letter})</strong> ${answer}
                    </label>
                </div>`;
        });
        questionHTML += '</div>';
        questionHTML += '<button class="btn-primary" onclick="checkAnswer()" style="margin-top: 20px; width: 100%;">Antwort abgeben</button>';
    } else {
        // Single Choice - Buttons
        questionHTML += '<div style="margin-top: 20px;" id="answerOptions">';
        question.answers.forEach((answer, idx) => {
            const letter = String.fromCharCode(97 + idx).toUpperCase();
            questionHTML += `
                <div class="answer-option" onclick="selectAnswer(${idx})" data-index="${idx}" style="padding: 15px; margin: 8px 0; background: #f8f9fa; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;">
                    <strong>${letter})</strong> ${answer}
                </div>`;
        });
        questionHTML += '</div>';
    }

    document.getElementById('question').innerHTML = questionHTML;

    // Hide answer reveal section
    document.getElementById('answerReveal').classList.add('hidden');
    document.getElementById('feedbackSection').classList.add('hidden');

    // Update progress
    updateProgress();
}

// Select answer for single choice
function selectAnswer(selectedIndex) {
    const question = currentQuestions[currentQuestionIndex];
    const answerOptions = document.querySelectorAll('.answer-option');

    // Check if already answered
    if (answerOptions[0].style.pointerEvents === 'none') return;

    const isCorrect = question.correct === selectedIndex;

    // Disable further clicks
    answerOptions.forEach(opt => opt.style.pointerEvents = 'none');

    // Show correct/wrong
    answerOptions.forEach((opt, idx) => {
        const dataIdx = parseInt(opt.getAttribute('data-index'));
        if (dataIdx === question.correct) {
            opt.style.background = '#4caf50';
            opt.style.color = 'white';
            opt.style.borderColor = '#45a049';
        } else if (dataIdx === selectedIndex && !isCorrect) {
            opt.style.background = '#f44336';
            opt.style.color = 'white';
            opt.style.borderColor = '#da190b';
        }
    });

    // Show feedback
    showFeedback(isCorrect);
}

// Check answer for multiple choice
function checkAnswer() {
    const question = currentQuestions[currentQuestionIndex];
    const answerOptions = document.querySelectorAll('.answer-option');

    // Get selected checkboxes
    const selected = [];
    answerOptions.forEach((opt, idx) => {
        const checkbox = opt.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
            selected.push(parseInt(opt.getAttribute('data-index')));
        }
    });

    if (selected.length === 0) {
        alert('Bitte wähle mindestens eine Antwort!');
        return;
    }

    // Check if correct
    const correctSet = new Set(Array.isArray(question.correct) ? question.correct : [question.correct]);
    const selectedSet = new Set(selected);
    const isCorrect = correctSet.size === selectedSet.size &&
                      [...correctSet].every(x => selectedSet.has(x));

    // Disable further clicks
    answerOptions.forEach(opt => {
        opt.style.pointerEvents = 'none';
        const checkbox = opt.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.disabled = true;
    });

    // Show correct/wrong
    answerOptions.forEach((opt, idx) => {
        const dataIdx = parseInt(opt.getAttribute('data-index'));
        const correctIndices = Array.isArray(question.correct) ? question.correct : [question.correct];

        if (correctIndices.includes(dataIdx)) {
            opt.style.background = '#4caf50';
            opt.style.color = 'white';
            opt.style.borderColor = '#45a049';
        } else if (selected.includes(dataIdx)) {
            opt.style.background = '#f44336';
            opt.style.color = 'white';
            opt.style.borderColor = '#da190b';
        }
    });

    // Hide submit button
    const submitBtn = document.querySelector('#question button');
    if (submitBtn) submitBtn.style.display = 'none';

    // Show feedback
    showFeedback(isCorrect);
}

// Show feedback section
function showFeedback(isCorrect) {
    const question = currentQuestions[currentQuestionIndex];
    const feedbackSection = document.getElementById('feedbackSection');

    let feedbackHTML = '';

    if (isCorrect) {
        feedbackHTML += '<div style="background: #d4edda; border: 2px solid #4caf50; padding: 15px; border-radius: 8px; margin: 20px 0;">';
        feedbackHTML += '<strong style="color: #155724;">✅ Richtig!</strong>';
    } else {
        feedbackHTML += '<div style="background: #f8d7da; border: 2px solid #f44336; padding: 15px; border-radius: 8px; margin: 20px 0;">';
        feedbackHTML += '<strong style="color: #721c24;">❌ Falsch!</strong>';
    }

    feedbackHTML += `<div style="margin-top: 10px; color: #333;">${question.explanation}</div>`;

    if (question.reference) {
        feedbackHTML += `<div style="margin-top: 10px;"><a href="${question.reference}" target="_blank" style="color: #667eea; font-weight: 600;">📖 Mehr dazu im Theorie-Kapitel →</a></div>`;
    }

    feedbackHTML += '</div>';

    // Add continue button
    feedbackHTML += `<button class="btn-primary" onclick="continueToNext(${isCorrect})" style="width: 100%; margin-top: 10px;">Weiter →</button>`;

    feedbackSection.innerHTML = feedbackHTML;
    feedbackSection.classList.remove('hidden');
}

// Continue to next question
function continueToNext(wasCorrect) {
    if (wasCorrect) {
        markCorrect();
    } else {
        markWrong();
    }
}

// Mark question as correct
function markCorrect() {
    correctCount++;
    const question = currentQuestions[currentQuestionIndex];

    // Mark as seen
    if (!seenQuestionIds.includes(question.id)) {
        seenQuestionIds.push(question.id);
        saveSeenQuestions();
    }

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

    // Mark as seen
    if (!seenQuestionIds.includes(question.id)) {
        seenQuestionIds.push(question.id);
        saveSeenQuestions();
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

// Review only wrong questions (alias for startQuizWrongOnly)
function reviewWrongQuestions() {
    startQuizWrongOnly();
}

// Reset quiz
function resetQuiz() {
    document.getElementById('controls').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    updateProgressDisplay();
}

// Start quiz with only unseen questions
function startQuizNewOnly() {
    const unseenQuestions = allQuestions.filter(q => !seenQuestionIds.includes(q.id));

    if (unseenQuestions.length === 0) {
        alert('🎉 Du hast bereits alle Fragen bearbeitet!\n\nNutze "Fortschritt zurücksetzen" um von vorne zu beginnen.');
        return;
    }

    currentQuestions = shuffleArray(unseenQuestions);

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

// Start quiz with only wrong questions
function startQuizWrongOnly() {
    if (wrongQuestionIds.length === 0) {
        alert('Keine falsch beantworteten Fragen gespeichert!');
        return;
    }

    currentQuestions = allQuestions.filter(q => wrongQuestionIds.includes(q.id));
    currentQuestions = shuffleArray(currentQuestions);

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

// Save seen questions to localStorage
function saveSeenQuestions() {
    localStorage.setItem('seenQuestions', JSON.stringify(seenQuestionIds));
}

// Load seen questions from localStorage
function loadSeenQuestions() {
    const saved = localStorage.getItem('seenQuestions');
    if (saved) {
        seenQuestionIds = JSON.parse(saved);
    }
}

// Clear all progress
function clearProgress() {
    if (confirm('Möchtest du wirklich deinen gesamten Lernfortschritt zurücksetzen?\n\n- Gesehene Fragen\n- Falsch beantwortete Fragen\n\nDiese Aktion kann nicht rückgängig gemacht werden!')) {
        wrongQuestionIds = [];
        seenQuestionIds = [];
        saveWrongQuestions();
        saveSeenQuestions();
        alert('✅ Fortschritt wurde zurückgesetzt!');
        location.reload();
    }
}

// Update progress display in controls
function updateProgressDisplay() {
    const progressInfo = document.getElementById('progressInfo');
    if (!progressInfo) return;

    const totalQuestions = allQuestions.length;
    const seenCount = seenQuestionIds.length;
    const wrongCount = wrongQuestionIds.length;
    const unseenCount = totalQuestions - seenCount;
    const percentage = totalQuestions > 0 ? Math.round((seenCount / totalQuestions) * 100) : 0;

    let html = '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">';
    html += '<div style="margin-bottom: 10px;"><strong>📊 Lernfortschritt:</strong></div>';
    html += `<div style="margin-bottom: 5px;">✅ Bearbeitet: <strong>${seenCount} / ${totalQuestions}</strong> (${percentage}%)</div>`;
    html += `<div style="margin-bottom: 5px;">🆕 Neue Fragen: <strong>${unseenCount}</strong></div>`;
    html += `<div>❌ Falsch beantwortet: <strong>${wrongCount}</strong></div>`;
    html += '</div>';

    progressInfo.innerHTML = html;
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

// Shuffle answers within a question and update correct index
function shuffleAnswers(question) {
    const indices = question.answers.map((_, idx) => idx);
    const shuffledIndices = shuffleArray(indices);

    // Reorder answers
    const newAnswers = shuffledIndices.map(idx => question.answers[idx]);
    question.answers = newAnswers;

    // Update correct index/indices
    if (Array.isArray(question.correct)) {
        // Multiple choice - update all correct indices
        question.correct = question.correct.map(correctIdx => {
            return shuffledIndices.indexOf(correctIdx);
        });
    } else {
        // Single choice - update single correct index
        question.correct = shuffledIndices.indexOf(question.correct);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (document.getElementById('quizCard').classList.contains('hidden')) return;

    // Ignore keyboard shortcuts if modifier keys are pressed (CMD, CTRL, ALT)
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const question = currentQuestions[currentQuestionIndex];
    if (!question) return;

    // Check if feedback is shown (answered already)
    const feedbackShown = !document.getElementById('feedbackSection').classList.contains('hidden');

    if (feedbackShown) {
        // Space, Enter, or Arrow keys to continue
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            const quizCard = document.getElementById('quizCard');
            if (quizCard.onclick) {
                quizCard.onclick();
            }
            e.preventDefault();
        }
    } else {
        // Only for single choice - number keys to select answer
        if (!question.multiple_choice) {
            const key = e.key;
            if (key >= '1' && key <= '9') {
                const index = parseInt(key) - 1;
                if (index < question.answers.length) {
                    selectAnswer(index);
                }
            }
            // a, b, c, d for answers
            if (key >= 'a' && key <= 'z') {
                const index = key.charCodeAt(0) - 97; // a=0, b=1, c=2, d=3
                if (index < question.answers.length) {
                    selectAnswer(index);
                }
            }
        } else {
            // For multiple choice - Enter to submit
            if (e.key === 'Enter') {
                const submitBtn = document.querySelector('#question button');
                if (submitBtn && submitBtn.style.display !== 'none') {
                    checkAnswer();
                }
            }
        }
    }
});

// Initialize
loadQuestions();
