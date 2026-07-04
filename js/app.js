/**
 * SL Identity — Stable Multi Identity + QR Engine
 */

const FALLBACK_PROFILE = {
  identity: {
    name: "Simone Laraia",
    company: "AUNDE Italia",
    logo: "assets/logo/ultimo-logo.png",
    themeColor: "#233F91"
  },
  branding: {
    logo: "assets/logo/ultimo-logo.png",
    company: "AUNDE Italia",
    website: "https://aunde.com"
  },
  role: {
    departmentIt: "Ente Tecnico",
    departmentEn: "Technical Department",
    titleIt: "Tecnico di termoformatura",
    titleEn: "Fabric Thermoforming Specialist"
  },
  contacts: {
    phone: "+390119458087",
    email: "simone.laraia@aunde.com",
    linkedin: "https://www.linkedin.com/in/simone-laraia-b261567b/",
    vcard: "contact.vcf"
  },
  labels: {
    addContact: "Aggiungi ai contatti",
    call: "Chiama",
    email: "Email",
    linkedin: "LinkedIn",
    footer: "SL Identity",
    toast: "Contatto pronto per essere aggiunto"
  }
};

const $ = (id) => document.getElementById(id);

function mergeProfile(profile = {}) {
  return {
    identity: { ...FALLBACK_PROFILE.identity, ...(profile.identity || {}) },
    branding: { ...FALLBACK_PROFILE.branding, ...(profile.branding || {}) },
    role: { ...FALLBACK_PROFILE.role, ...(profile.role || {}) },
    contacts: { ...FALLBACK_PROFILE.contacts, ...(profile.contacts || {}) },
    labels: { ...FALLBACK_PROFILE.labels, ...(profile.labels || {}) }
  };
}

function getProfileId() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "simone";
  return id.trim().toLowerCase();
}

function getProfileUrl() {
  const id = getProfileId();
  return `${window.location.origin}${window.location.pathname}?id=${encodeURIComponent(id)}`;
}

async function fetchJson(file) {
  const url = `${file}?cacheBust=${Date.now()}`;
  const response = await fetch(url, { method: "GET", cache: "no-store" });

  if (!response.ok) {
    throw new Error(`${file} non disponibile`);
  }

  return await response.json();
}

async function loadProfile() {
  const profileId = getProfileId();
  const profileFile = `profiles/${profileId}.json`;

  try {
    const profile = await fetchJson(profileFile);
    console.info(`SL Identity: profilo caricato da ${profileFile}`);
    return mergeProfile(profile);
  } catch (profileError) {
    console.warn(`SL Identity: profilo non caricato: ${profileFile}`, profileError);

    try {
      const fallbackProfile = await fetchJson("profile.json");
      console.info("SL Identity: uso profile.json come fallback");
      return mergeProfile(fallbackProfile);
    } catch (fallbackError) {
      console.warn("SL Identity: uso fallback interno", fallbackError);
      return FALLBACK_PROFILE;
    }
  }
}

function setText(id, value) {
  const element = $(id);
  if (element) element.textContent = value || "";
}

function setHref(id, value) {
  const element = $(id);
  if (element && value) element.href = value;
}

function applyProfile(profile) {
  document.title = profile.identity.name || "SL Identity";

  const color = profile.identity.themeColor || "#233F91";
  document.documentElement.style.setProperty("--blue", color);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute("content", color);

  const logo = $("logo");
  if (logo) {
    logo.src = profile.branding.logo || profile.identity.logo || FALLBACK_PROFILE.identity.logo;
    logo.alt = profile.branding.company || profile.identity.company || "Logo";
  }

  setText("name", profile.identity.name);
  setText("departmentIt", profile.role.departmentIt);
  setText("departmentEn", profile.role.departmentEn);
  setText("roleIt", profile.role.titleIt);
  setText("roleEn", profile.role.titleEn);

  setHref("contactLink", profile.contacts.vcard);
  setHref("phoneLink", `tel:${profile.contacts.phone}`);
  setHref("emailLink", `mailto:${profile.contacts.email}`);
  setHref("linkedinLink", profile.contacts.linkedin);

  setText("addContactLabel", profile.labels.addContact);
  setText("callLabel", profile.labels.call);
  setText("emailLabel", profile.labels.email);
  setText("linkedinLabel", profile.labels.linkedin);
  setText("footer", profile.labels.footer);
  setText("toast", profile.labels.toast);

  window.SL_IDENTITY_PROFILE = profile;
}

function vibrate(ms = 8) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

function showToast(text) {
  const toast = $("toast");
  if (!toast) return;

  toast.textContent = text || "Operazione completata";
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

async function showQrModal() {
  const modal = $("qrModal");
  const qrCanvas = $("qrCanvas");
  const qrDownload = $("qrDownload");

  if (!modal || !qrCanvas || !qrDownload) {
    showToast("QR non configurato");
    return;
  }

  if (!window.QRCode) {
    showToast("QR non disponibile");
    return;
  }

  qrCanvas.innerHTML = "";

 new QRCode(qrCanvas, {
  text: getProfileUrl(),
  width: 230,
  height: 230,
  correctLevel: QRCode.CorrectLevel.H
 });
 
 const img = qrCanvas.querySelector("img");
 if (img) {
   qrDownload.href = img.src;
 }
  modal.hidden = false;
}

function hideQrModal() {
  const modal = $("qrModal");
  if (modal) modal.hidden = true;
}

function bindInteractions(profile) {
  document.querySelectorAll(".button").forEach((button) => {
    button.addEventListener("click", () => vibrate(8));
  });

  const contactButton = document.querySelector("[data-contact]");
  if (contactButton) {
    contactButton.addEventListener("click", () => {
      vibrate(12);
      showToast(profile.labels.toast);
    });
  }

  const qrButton = $("qrButton");
  if (qrButton) qrButton.addEventListener("click", showQrModal);

  const qrClose = $("qrClose");
  if (qrClose) qrClose.addEventListener("click", hideQrModal);

  const qrModal = $("qrModal");
  if (qrModal) {
    qrModal.addEventListener("click", (event) => {
      if (event.target === qrModal) hideQrModal();
    });
  }
}

async function init() {
  const profile = await loadProfile();
  applyProfile(profile);
  bindInteractions(profile);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", init);
