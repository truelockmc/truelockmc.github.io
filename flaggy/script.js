const flagData = [
    {
        country: ['Deutschland', 'Germany', 'Allemagne', 'Germany'], // Mehrsprachige Eingaben
        flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Germany.svg/320px-Flag_of_Germany.svg.png',
    },
    {
        country: ['USA', 'United States', 'Estados Unidos'], // Mehrsprachige Eingaben
        flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg',
    },
    {
        country: ['Japan', 'Nippon', 'Japon'], // Mehrsprachige Eingaben
        flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg',
    },
    {
        country: ['France', 'Frankreich', 'Francia'], // Mehrsprachige Eingaben
        flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg',
    }
    // Weitere Länder und Flaggen hinzufügen
];

let correctAnswers = 0;
let incorrectAnswers = 0;

// Mische die Flaggen zufällig
function shuffleFlags() {
    for (let i = flagData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flagData[i], flagData[j]] = [flagData[j], flagData[i]]; // Tausche die Elemente
    }
}

// Diese Funktion sorgt dafür, dass immer die nächste Frage angezeigt wird
function displayQuestion() {
    const feedback = document.getElementById('feedback');
    const countryInput = document.getElementById('country-input');
    const flagImage = document.getElementById('flag-image');
    const submitBtn = document.getElementById('submit-btn');
    
    // Verhindere mehrfaches Antworten
    feedback.style.display = 'none'; // Verstecke Feedback

    countryInput.value = ''; // Leere das Textfeld
    countryInput.focus(); // Fokus auf das Eingabefeld setzen

    // Wähle eine zufällige Flagge und zeige sie an
    const randomIndex = Math.floor(Math.random() * flagData.length);
    const currentQuestion = flagData[randomIndex];
    flagImage.src = currentQuestion.flagUrl;

    submitBtn.onclick = () => checkAnswer(countryInput.value, currentQuestion.country);
    countryInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            checkAnswer(countryInput.value, currentQuestion.country);
        }
    });
}

// Überprüft die Antwort des Benutzers
function checkAnswer(input, correctCountry) {
    const feedback = document.getElementById('feedback');
    const countryInput = document.getElementById('country-input');
    const correctCount = document.getElementById('correct-count');
    const incorrectCount = document.getElementById('incorrect-count');

    const inputNormalized = input.trim().toLowerCase();
    const correctAnswer = correctCountry.some((name) => name.toLowerCase() === inputNormalized);

    // Wenn richtig
    if (correctAnswer) {
        correctAnswers++;
        correctCount.textContent = correctAnswers;
        feedback.textContent = 'Richtig! 😊';
        feedback.classList.remove('wrong-feedback');
        feedback.classList.add('correct-feedback');
        feedback.style.display = 'block';
    } else {
        incorrectAnswers++;
        incorrectCount.textContent = incorrectAnswers;
        feedback.textContent = `Falsch! Die richtige Antwort ist: ${correctCountry[0]} 😞`;
        feedback.classList.remove('correct-feedback');
        feedback.classList.add('wrong-feedback');
        feedback.style.display = 'block';
    }

    // Gehe zur nächsten Frage nach einer Verzögerung
    setTimeout(() => {
        displayQuestion(); // Zeige die nächste Flagge
    }, 2000); // Verzögerung von 2 Sekunden
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

window.onload = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    shuffleFlags(); // Mische die Flaggen beim Laden der Seite
    displayQuestion(); // Zeige die erste Frage, wenn die Seite geladen wird
};
