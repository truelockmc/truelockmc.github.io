// Mische die Flaggen zufällig
function shuffleFlags() {
  for (let i = flagData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flagData[i], flagData[j]] = [flagData[j], flagData[i]];
  }
}

// Hilfsfunktion zum zufälligen Mischen eines Arrays
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
