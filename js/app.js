/**
 * SL Identity — Multi Identity Engine
 * Carica il profilo corretto da:
 *   ?id=simone  -> profiles/simone.json
 * Se il profilo non esiste, usa profile.json come fallback.
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
    identity: {
      ...FALLBACK_PROFILE.identity,
      ...(profile.identity || {})
    },
    branding: {
      ...FALLBACK_PROFILE.branding,
      ...(profile.branding || {})
    },
    role: {
      ...FALLBACK_PROFILE.role,
      ...(profile.role || {})
    },
    contacts: {
      ...FALLBACK_PROFILE.contacts,
      ...(profile.contacts || {})
    },
    labels: {
      ...FALLBACK_PROFILE.labels,
      ...(profile.labels || {})
    }
  };
}

function getProfileId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || "simone";
}

async function fetchJson(file) {
  const response = await fetch(file, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${file} non disponibile`);
  }
  return response.json();
}

async function loadProfile() {
  const profileId = getProfileId();
  alert("Profilo richiesto: " + profileId);
  const profileFile = `profiles/${profileId}.json`;

  try {
    const profile = await fetchJson(profileFile);
    console.info(`SL Identity: profilo caricato da ${profileFile}`);
    return mergeProfile(profile);
  } catch (profileError) {
    console.warn(`SL Identity: profilo non trovato: ${profileFile}`, profileError);

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
  if (element) {
    element.textContent = value || "";
  }
}

function setHref(id, value) {
  const element = $(id);
  if (element && value) {
    element.href = value;
  }
}

function applyTheme(profile) {
  const color = profile.identity.themeColor || "#233F91";
  document.documentElement.style.setProperty("--blue", color);

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", color);
  }
}

function applyLogo(profile) {
  const logo = $("logo");
  if (!logo) return;

  const logoPath =
    profile.branding.logo ||
    profile.identity.logo ||
    FALLBACK_PROFILE.identity.logo;

  logo.src = logoPath;
  logo.alt = profile.branding.company || profile.identity.company || "Logo";
}

function applyProfile(profile) {
  document.title = profile.identity.name || "SL Identity";

  applyTheme(profile);
  applyLogo(profile);

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
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

function showToast(text) {
  const toast = $("toast");
  if (!toast) return;

  toast.textContent = text || "Operazione completata";
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
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
