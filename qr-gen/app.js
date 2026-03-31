let currentQR = null;
let currentText = "";
let qrInstance = null;

function generateQR() {
  const input = document.getElementById("qrInput").value.trim();
  const size = parseInt(document.getElementById("qrSize").value);
  const errorCorrection = document.getElementById("qrErrorCorrection").value;
  const padding = parseInt(document.getElementById("qrPadding").value);

  if (!input) {
    showError("Please enter a text or URL!");
    return;
  }

  currentText = input;
  const canvas = document.getElementById("qrCanvas");

  const canvasSize = size + padding * 2;

  // Clear canvas
  const ctx = canvas.getContext("2d");
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Create temporary container for QRCode library
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  tempContainer.style.width = size + "px";
  tempContainer.style.height = size + "px";
  document.body.appendChild(tempContainer);

  try {
    // Generate QR code in temp container
    qrInstance = new QRCode(tempContainer, {
      text: input,
      width: size,
      height: size,
      colorDark: "#000000",
      colorLight: "#FFFFFF",
      correctLevel: QRCode.CorrectLevel[errorCorrection],
    });

    // Wait for canvas to be created
    setTimeout(() => {
      const sourceCanvas = tempContainer.querySelector("canvas");
      if (sourceCanvas) {
        ctx.drawImage(sourceCanvas, padding, padding, size, size);
        currentQR = canvas.toDataURL("image/png");
        document.getElementById("previewSection").style.display = "block";
      }
      document.body.removeChild(tempContainer);
    }, 300);
  } catch (error) {
    console.error("Error:", error);
    showError("Error generating QR code!");
    document.body.removeChild(tempContainer);
  }
}

function downloadPNG() {
  if (!currentQR) return;
  const link = document.createElement("a");
  link.href = currentQR;
  link.download = `qr-code-${Date.now()}.png`;
  link.click();
}

function downloadJPG() {
  if (!currentQR) return;
  const canvas = document.getElementById("qrCanvas");

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.fillStyle = "#FFFFFF";
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  tempCtx.drawImage(canvas, 0, 0);

  const link = document.createElement("a");
  link.href = tempCanvas.toDataURL("image/jpeg", 0.95);
  link.download = `qr-code-${Date.now()}.jpg`;
  link.click();
}

function downloadSVG() {
  if (!currentText) return;
  const size = parseInt(document.getElementById("qrSize").value);
  const padding = parseInt(document.getElementById("qrPadding").value);
  const errorCorrection = document.getElementById("qrErrorCorrection").value;
  const canvasSize = size + padding * 2;

  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  tempContainer.style.width = size + "px";
  tempContainer.style.height = size + "px";
  document.body.appendChild(tempContainer);

  new QRCode(tempContainer, {
    text: currentText,
    width: size,
    height: size,
    correctLevel: QRCode.CorrectLevel[errorCorrection],
  });

  setTimeout(() => {
    const sourceCanvas = tempContainer.querySelector("canvas");
    if (sourceCanvas) {
      const imgData = sourceCanvas
        .getContext("2d")
        .getImageData(0, 0, size, size);
      const data = imgData.data;
      let svg = `<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg">`;
      svg += `<rect width="${canvasSize}" height="${canvasSize}" fill="white"/>`;

      const gridSize = Math.sqrt(data.length / 4);
      const pixelSize = size / gridSize;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 128 && data[i] < 128) {
          const pixelIndex = i / 4;
          const x = (pixelIndex % gridSize) * pixelSize + padding;
          const y = Math.floor(pixelIndex / gridSize) * pixelSize + padding;
          svg += `<rect x="${x}" y="${y}" width="${pixelSize}" height="${pixelSize}" fill="black"/>`;
        }
      }
      svg += "</svg>";

      const link = document.createElement("a");
      link.href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      link.download = `qr-code-${Date.now()}.svg`;
      link.click();
    }
    document.body.removeChild(tempContainer);
  }, 300);
}

function downloadWEBP() {
  if (!currentQR) return;
  const canvas = document.getElementById("qrCanvas");
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/webp");
  link.download = `qr-code-${Date.now()}.webp`;
  link.click();
}

function showError(message) {
  alert(message);
}

// Auto-generate on Enter key
document.getElementById("qrInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    generateQR();
  }
});

document.getElementById("qrSize").addEventListener("change", generateQR);
document.getElementById("qrPadding").addEventListener("change", generateQR);

// Initial QR generation
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(generateQR, 300);
});
