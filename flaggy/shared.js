// ── Übersetzungen ────────────────────────────────────────────────────────────

const translations = {
  de: {
    title: "Flaggen Lernen (BETA)",
    subtitle: "Errate das Land anhand der Flagge!",
    darkModeToggle: "Dunkelmodus",
    langToggle: "EN",
    correctLabel: "Richtige Antworten",
    incorrectLabel: "Falsche Antworten",
    correct: "Richtig! 😊",
    wrong: "Falsch! Die richtige Antwort ist",
    submitBtn: "Antwort Überprüfen",
    placeholder: "Gib das Land ein…",
    flagAlt: "Flagge",
  },
  en: {
    title: "Flag Learning (BETA)",
    subtitle: "Guess the country from the flag!",
    darkModeToggle: "Dark Mode",
    langToggle: "DE",
    correctLabel: "Correct Answers",
    incorrectLabel: "Incorrect Answers",
    correct: "Correct! 😊",
    wrong: "Wrong! The correct answer is",
    submitBtn: "Check Answer",
    placeholder: "Enter the country…",
    flagAlt: "Flag",
  },
};

// ── Sprache ──────────────────────────────────────────────────────────────────

function detectDefaultLang() {
  const browserLang = (
    navigator.language ||
    navigator.userLanguage ||
    "en"
  ).toLowerCase();
  return browserLang.startsWith("de") ? "de" : "en";
}

function getLang() {
  return localStorage.getItem("lang") || detectDefaultLang();
}

// Gibt den Index im country-Array zurück: 0 = Deutsch, 1 = Englisch
function getLangIndex() {
  return getLang() === "de" ? 0 : 1;
}

// Übersetzungs-Kurzform
function t(key) {
  return translations[getLang()][key] || key;
}

function updatePageText() {
  const lang = getLang();
  document.documentElement.setAttribute("lang", lang);

  // Textelemente
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key] !== undefined) {
      el.textContent = translations[lang][key];
    }
  });

  // Placeholder-Attribute
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (translations[lang][key] !== undefined) {
      el.placeholder = translations[lang][key];
    }
  });

  // Alt-Attribute
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const key = el.getAttribute("data-i18n-alt");
    if (translations[lang][key] !== undefined) {
      el.alt = translations[lang][key];
    }
  });
}

function toggleLang() {
  const newLang = getLang() === "de" ? "en" : "de";
  localStorage.setItem("lang", newLang);
  updatePageText();
  // Aktuelle Frage neu anzeigen, damit Ländernamen in der richtigen Sprache erscheinen
  if (typeof displayQuestion === "function") displayQuestion();
}

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

function shuffleFlags() {
  for (let i = flagData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flagData[i], flagData[j]] = [flagData[j], flagData[i]];
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function toggleDarkMode() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}
