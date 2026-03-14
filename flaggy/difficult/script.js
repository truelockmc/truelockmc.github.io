let correctAnswers = 0;
let incorrectAnswers = 0;

function displayQuestion() {
  const feedback = document.getElementById("feedback");
  const countryInput = document.getElementById("country-input");
  const flagImage = document.getElementById("flag-image");
  const submitBtn = document.getElementById("submit-btn");

  feedback.style.display = "none";
  countryInput.value = "";
  countryInput.focus();

  const randomIndex = Math.floor(Math.random() * flagData.length);
  const currentQuestion = flagData[randomIndex];
  flagImage.src = currentQuestion.flagUrl;

  // Neue Event-Handler setzen (alte klonen weg)
  const newSubmit = submitBtn.cloneNode(true);
  newSubmit.disabled = false;
  submitBtn.parentNode.replaceChild(newSubmit, submitBtn);
  const newInput = countryInput.cloneNode(true);
  newInput.disabled = false;
  countryInput.parentNode.replaceChild(newInput, countryInput);

  newSubmit.onclick = () =>
    checkAnswer(newInput.value, currentQuestion.country);
  newInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkAnswer(newInput.value, currentQuestion.country);
  });
  newInput.focus();
}

function checkAnswer(input, correctCountry) {
  const feedback = document.getElementById("feedback");
  const li = getLangIndex();
  const inputNormalized = input.trim().toLowerCase();

  const countryInput = document.getElementById("country-input");
  const submitBtn = document.getElementById("submit-btn");
  if (countryInput) countryInput.disabled = true;
  if (submitBtn) submitBtn.disabled = true;

  // Akzeptiert beide Sprachen als korrekte Antwort
  const isCorrect = correctCountry.some(
    (name) => name.toLowerCase() === inputNormalized,
  );

  if (isCorrect) {
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
