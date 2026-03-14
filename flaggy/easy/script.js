let correctAnswers = 0;
let incorrectAnswers = 0;

// Diese Funktion sorgt dafür, dass immer die nächste Frage angezeigt wird
function displayQuestion() {
  const feedback = document.getElementById("feedback");
  const answersContainer = document.getElementById("answers-container");

  feedback.style.display = "none"; // Verstecke Feedback

  // Wähle eine zufällige Flagge und zeige sie an
  const randomIndex = Math.floor(Math.random() * flagData.length);
  const currentQuestion = flagData[randomIndex];

  // Zeige die Flagge an
  const flagImage = document.getElementById("flag-image");
  flagImage.src = currentQuestion.flagUrl;

  // Mische die Länder und füge sie als Buttons hinzu
  const allCountries = [...flagData.map((f) => f.country[0])];
  const correctCountry = currentQuestion.country[0];
  const possibleAnswers = [
    correctCountry,
    ...getRandomCountries(correctCountry, allCountries),
  ];

  // Mische die Antworten zufällig
  shuffleArray(possibleAnswers);

  // Lösche vorherige Antworten
  answersContainer.innerHTML = "";

  // Erstelle die Antwort-Buttons
  possibleAnswers.forEach((country) => {
    const button = document.createElement("button");
    button.textContent = country;
    button.classList.add("answer-button");
    button.onclick = () => checkAnswer(country, currentQuestion.country);
    answersContainer.appendChild(button);
  });
}

// Holt zufällige Länder, die nicht die richtige Antwort sind
function getRandomCountries(correctCountry, allCountries) {
  const otherCountries = allCountries.filter(
    (country) => country !== correctCountry,
  );
  const randomCountries = [];

  while (randomCountries.length < 2) {
    const randomIndex = Math.floor(Math.random() * otherCountries.length);
    const randomCountry = otherCountries[randomIndex];
    if (!randomCountries.includes(randomCountry)) {
      randomCountries.push(randomCountry);
    }
  }

  return randomCountries;
}

// Überprüft die Antwort des Benutzers
function checkAnswer(selectedCountry, correctCountry) {
  const feedback = document.getElementById("feedback");
  const correctCount = document.getElementById("correct-count");
  const incorrectCount = document.getElementById("incorrect-count");

  if (correctCountry.includes(selectedCountry)) {
    correctAnswers++;
    correctCount.textContent = correctAnswers;
    feedback.textContent = "Richtig! 😊";
    feedback.classList.remove("wrong-feedback");
    feedback.classList.add("correct-feedback");
  } else {
    incorrectAnswers++;
    incorrectCount.textContent = incorrectAnswers;
    feedback.textContent = `Falsch! Die richtige Antwort ist: ${correctCountry[0]} 😞`;
    feedback.classList.remove("correct-feedback");
    feedback.classList.add("wrong-feedback");
  }

  feedback.style.display = "block";

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
