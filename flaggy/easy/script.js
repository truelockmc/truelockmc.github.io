let correctAnswers = 0;
let incorrectAnswers = 0;

function displayQuestion() {
  const feedback = document.getElementById("feedback");
  const answersContainer = document.getElementById("answers-container");

  feedback.style.display = "none";

  const randomIndex = Math.floor(Math.random() * flagData.length);
  const currentQuestion = flagData[randomIndex];

  document.getElementById("flag-image").src = currentQuestion.flagUrl;

  const li = getLangIndex();
  const allCountries = flagData.map((f) => f.country[li]);
  const correctCountry = currentQuestion.country[li];
  const possibleAnswers = [
    correctCountry,
    ...getRandomCountries(correctCountry, allCountries),
  ];

  shuffleArray(possibleAnswers);

  answersContainer.innerHTML = "";
  possibleAnswers.forEach((country) => {
    const button = document.createElement("button");
    button.textContent = country;
    button.classList.add("answer-button");
    button.onclick = () => checkAnswer(country, currentQuestion.country);
    answersContainer.appendChild(button);
  });
}

function getRandomCountries(correctCountry, allCountries) {
  const otherCountries = allCountries.filter((c) => c !== correctCountry);
  const result = [];
  while (result.length < 2) {
    const pick =
      otherCountries[Math.floor(Math.random() * otherCountries.length)];
    if (!result.includes(pick)) result.push(pick);
  }
  return result;
}

function checkAnswer(selectedCountry, correctCountry) {
  const feedback = document.getElementById("feedback");
  const li = getLangIndex();

  if (correctCountry.includes(selectedCountry)) {
    correctAnswers++;
    document.getElementById("correct-count").textContent = correctAnswers;
    feedback.textContent = t("correct");
    feedback.classList.remove("wrong-feedback");
    feedback.classList.add("correct-feedback");
  } else {
    incorrectAnswers++;
    document.getElementById("incorrect-count").textContent = incorrectAnswers;
    feedback.textContent = `${t("wrong")}: ${correctCountry[li]} 😞`;
    feedback.classList.remove("correct-feedback");
    feedback.classList.add("wrong-feedback");
  }

  feedback.style.display = "block";
  setTimeout(displayQuestion, 1500);
}

window.onload = () => {
  document.documentElement.setAttribute(
    "data-theme",
    localStorage.getItem("theme") || "light",
  );
  updatePageText();
  shuffleFlags();
  displayQuestion();
};
