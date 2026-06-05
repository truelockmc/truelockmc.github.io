/* ============================================================
   NEWS ARTICLE GENERATOR - script.js
   ============================================================ */

(function () {
  "use strict";

  // ── DOM refs ──────────────────────────────────────────────
  const headlineInput = document.getElementById("headline");
  const subheadlineInput = document.getElementById("subheadline");
  const authorNameInput = document.getElementById("author-name");
  const captionInput = document.getElementById("image-caption");
  const bodyInput = document.getElementById("article-text");
  const brandInput = document.getElementById("brand-name");
  const editionInput = document.getElementById("edition-text");

  const imageInput = document.getElementById("image-input");
  const authorImageInput = document.getElementById("author-image-input");
  const uploadZone = document.getElementById("upload-zone");
  const authorUploadZone = document.getElementById("author-upload-zone");
  const uploadPreview = document.getElementById("upload-preview");
  const previewImg = document.getElementById("preview-img");
  const removeImageBtn = document.getElementById("remove-image");
  const authorPreview = document.getElementById("author-upload-preview");
  const authorPreviewImg = document.getElementById("author-preview-img");
  const removeAuthorBtn = document.getElementById("remove-author-image");
  const downloadBtn = document.getElementById("download-btn");
  const topbarToggle = document.getElementById("topbar-toggle");
  const topbarFields = document.getElementById("topbar-fields");

  // Preview elements
  const npHeadline = document.getElementById("np-headline");
  const npSubheadline = document.getElementById("np-subheadline");
  const npAuthorName = document.getElementById("np-author-name");
  const npCaption = document.getElementById("np-image-caption");
  const npBody = document.getElementById("np-body");
  const npImage = document.getElementById("np-image");
  const npImagePlaceholder = document.getElementById("np-image-placeholder");
  const npAuthorImg = document.getElementById("np-author-img");
  const npAuthorInitial = document.getElementById("np-author-initial");
  const npAuthorRow = document.getElementById("np-author-row");
  const npDate = document.getElementById("np-date");
  const npTopbar = document.getElementById("np-topbar");
  const npBrand = document.getElementById("np-brand");
  const npEdition = document.getElementById("np-edition");

  // ── Set current date ──────────────────────────────────────
  (function setDate() {
    const now = new Date();
    npDate.textContent = now.toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  })();

  // ── Topbar toggle (localStorage) ─────────────────────────
  const TOPBAR_KEY = "np_topbar_visible";

  function applyTopbarState(visible) {
    topbarToggle.setAttribute("aria-pressed", visible ? "true" : "false");
    topbarToggle.classList.toggle("active", visible);
    topbarFields.classList.toggle("hidden", !visible);
    npTopbar.classList.toggle("hidden", !visible);
    localStorage.setItem(TOPBAR_KEY, visible ? "1" : "0");
  }

  // Restore from storage (default: visible)
  const savedTopbar = localStorage.getItem(TOPBAR_KEY);
  applyTopbarState(savedTopbar === null ? true : savedTopbar === "1");

  topbarToggle.addEventListener("click", function () {
    const current = this.getAttribute("aria-pressed") === "true";
    applyTopbarState(!current);
  });

  // ── Helper: show element only when it has content ─────────
  function showIfContent(el, condition) {
    el.classList.toggle("np-hidden", !condition);
  }

  // ── Live bind: text + hide-if-empty ──────────────────────
  function bindText(input, target, opts) {
    // opts: { fallback, hideEmpty, hideTarget }
    opts = opts || {};

    function update() {
      const val = input.value.trim();
      target.textContent = val || opts.fallback || "";
      if (opts.hideEmpty) {
        const hideEl = opts.hideTarget || target;
        showIfContent(hideEl, !!val);
      }
    }

    input.addEventListener("input", update);
    update(); // run once on init in case inputs are pre-filled
  }

  // Headline
  headlineInput.addEventListener("input", function () {
    npHeadline.textContent = this.value.trim() || "Überschrift erscheint hier";
  });

  // Subheadline
  bindText(subheadlineInput, npSubheadline, { hideEmpty: true });

  // Author name
  authorNameInput.addEventListener("input", function () {
    const val = this.value.trim();
    npAuthorName.textContent = val || "";
    npAuthorInitial.textContent = val ? val.charAt(0).toUpperCase() : "?";
    updateAuthorRowVisibility();
  });

  function updateAuthorRowVisibility() {
    const hasName = !!authorNameInput.value.trim();
    const hasImage = npAuthorImg.style.display !== "none";
    showIfContent(npAuthorRow, hasName || hasImage);
  }

  // Caption
  bindText(captionInput, npCaption, { hideEmpty: true });

  // Body
  bodyInput.addEventListener("input", function () {
    const val = this.value.trim();
    npBody.textContent = val || "";
    showIfContent(npBody, !!val);
  });

  // Brand name
  brandInput.addEventListener("input", function () {
    npBrand.textContent = this.value.trim() || "DIE TAGESPOST";
  });

  // Edition
  editionInput.addEventListener("input", function () {
    const val = this.value.trim();
    npEdition.textContent = val;
    showIfContent(npEdition, !!val);
  });

  // ── Image upload helpers ──────────────────────────────────
  function loadArticleImage(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImg.src = e.target.result;
      uploadPreview.style.display = "flex";
      npImage.src = e.target.result;
      npImage.style.display = "block";
      npImagePlaceholder.style.display = "none";
    };
    reader.readAsDataURL(file);
  }

  // ── Article image ─────────────────────────────────────────
  uploadZone.addEventListener("click", () => imageInput.click());
  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("dragover");
  });
  uploadZone.addEventListener("dragleave", () =>
    uploadZone.classList.remove("dragover"),
  );
  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("dragover");
    loadArticleImage(e.dataTransfer.files[0]);
  });
  imageInput.addEventListener("change", function () {
    if (this.files[0]) loadArticleImage(this.files[0]);
  });
  removeImageBtn.addEventListener("click", function () {
    npImage.src = "";
    npImage.style.display = "none";
    npImagePlaceholder.style.display = "flex";
    uploadPreview.style.display = "none";
    previewImg.src = "";
    imageInput.value = "";
  });

  // ── Author image ──────────────────────────────────────────
  authorUploadZone.addEventListener("click", () => authorImageInput.click());
  authorImageInput.addEventListener("change", function () {
    if (!this.files[0]) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      authorPreviewImg.src = e.target.result;
      authorPreview.style.display = "flex";
      npAuthorImg.src = e.target.result;
      npAuthorImg.style.display = "block";
      npAuthorInitial.style.display = "none";
      updateAuthorRowVisibility();
    };
    reader.readAsDataURL(this.files[0]);
  });
  removeAuthorBtn.addEventListener("click", function () {
    npAuthorImg.src = "";
    npAuthorImg.style.display = "none";
    npAuthorInitial.style.display = "flex";
    authorPreview.style.display = "none";
    authorPreviewImg.src = "";
    authorImageInput.value = "";
    updateAuthorRowVisibility();
  });

  // ── Download as image ─────────────────────────────────────
  downloadBtn.addEventListener("click", async function () {
    const frame = document.getElementById("newspaper-inner");
    if (!window.html2canvas) await loadHtml2Canvas();

    downloadBtn.disabled = true;
    const spanEl = downloadBtn.querySelector("span");
    const originalText = spanEl.textContent;
    spanEl.textContent = "Wird generiert…";

    try {
      const canvas = await html2canvas(frame, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#faf8f3",
        logging: false,
        onclone: function (clonedDoc) {
          clonedDoc
            .querySelectorAll(".np-headline, .np-subheadline")
            .forEach(function (el) {
              el.style.fontFamily = "'Playfair Display', Georgia, serif";
            });
          // Remove hidden elements from cloned doc so they don't appear
          clonedDoc.querySelectorAll(".np-hidden").forEach(function (el) {
            el.style.display = "none";
          });
        },
      });

      const link = document.createElement("a");
      link.download = "artikel.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download-Fehler:", err);
      alert("Fehler beim Generieren. Bitte erneut versuchen.");
    } finally {
      downloadBtn.disabled = false;
      spanEl.textContent = originalText;
    }
  });

  function loadHtml2Canvas() {
    return new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // ── Initial state: hide empty preview elements ────────────
  showIfContent(npSubheadline, !!subheadlineInput.value.trim());
  showIfContent(npCaption, !!captionInput.value.trim());
  showIfContent(npBody, !!bodyInput.value.trim());
  updateAuthorRowVisibility();
})();
