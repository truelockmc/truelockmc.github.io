let correctAnswers = 0;
let incorrectAnswers = 0;

// Diese Funktion sorgt dafür, dass immer die nächste Frage angezeigt wird
function displayQuestion() {
  const feedback = document.getElementById("feedback");
  const countryInput = document.getElementById("country-input");
  const flagImage = document.getElementById("flag-image");
  const submitBtn = document.getElementById("submit-btn");

  feedback.style.display = "none"; // Verstecke Feedback

  countryInput.value = ""; // Leere das Textfeld
  countryInput.focus(); // Fokus auf das Eingabefeld setzen

  // Wähle eine zufällige Flagge und zeige sie an
  const randomIndex = Math.floor(Math.random() * flagData.length);
  const currentQuestion = flagData[randomIndex];
  flagImage.src = currentQuestion.flagUrl;

  submitBtn.onclick = () =>
    checkAnswer(countryInput.value, currentQuestion.country);
  countryInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      checkAnswer(countryInput.value, currentQuestion.country);
    }
  });
}

// Überprüft die Antwort des Benutzers
function checkAnswer(input, correctCountry) {
  const feedback = document.getElementById("feedback");
  const correctCount = document.getElementById("correct-count");
  const incorrectCount = document.getElementById("incorrect-count");

  const inputNormalized = input.trim().toLowerCase();
  const correctAnswer = correctCountry.some(
    (name) => name.toLowerCase() === inputNormalized,
  );

  if (correctAnswer) {
    correctAnswers++;
    correctCount.textContent = correctAnswers;
    feedback.textContent = "Richtig! 😊";
    feedback.classList.remove("wrong-feedback");
    feedback.classList.add("correct-feedback");
    feedback.style.display = "block";
  } else {
    incorrectAnswers++;
    incorrectCount.textContent = incorrectAnswers;
    feedback.textContent = `Falsch! Die richtige Antwort ist: ${correctCountry[0]} 😞`;
    feedback.classList.remove("correct-feedback");
    feedback.classList.add("wrong-feedback");
    feedback.style.display = "block";
  }

  // Gehe zur nächsten Frage nach einer Verzögerung
  setTimeout(() => {
    displayQuestion();
  }, 1500);
}

window.onload = () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  shuffleFlags();
  displayQuestion();
};
