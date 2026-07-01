const DEFAULT_PROFILE = {
  identity: {
    name: "Simone Laraia",
    company: "AUNDE Italia",
    logo: "assets/logo/ultimo-logo.png",
    themeColor: "#233F91"
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

function setText(id, value){
  const element = document.getElementById(id);
  if(element && value) element.textContent = value;
}

function setHref(id, value){
  const element = document.getElementById(id);
  if(element && value) element.href = value;
}

async function getProfile(){
  try{
    const response = await fetch("profile.json", { cache: "no-store" });
    if(!response.ok) throw new Error("profile.json non caricato");
    const profile = await response.json();
    return {
      identity: { ...DEFAULT_PROFILE.identity, ...(profile.identity || {}) },
      role: { ...DEFAULT_PROFILE.role, ...(profile.role || {}) },
      contacts: { ...DEFAULT_PROFILE.contacts, ...(profile.contacts || {}) },
      labels: { ...DEFAULT_PROFILE.labels, ...(profile.labels || {}) }
    };
  }catch(error){
    console.warn("Uso profilo di fallback:", error);
    return DEFAULT_PROFILE;
  }
}

function applyProfile(profile){
  document.title = profile.identity.name || "SL Identity";

  const themeColor = profile.identity.themeColor || "#233F91";
  document.documentElement.style.setProperty("--blue", themeColor);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if(metaTheme) metaTheme.setAttribute("content", themeColor);

  const logo = document.getElementById("logo");
  if(logo){
    logo.src = profile.identity.logo;
    logo.alt = profile.identity.company || "Logo";
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

function showToast(){
  const toast = document.getElementById("toast");
  if(!toast) return;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function vibrate(ms = 8){
  if(navigator.vibrate) navigator.vibrate(ms);
}

document.addEventListener("DOMContentLoaded", async () => {
  const profile = await getProfile();
  applyProfile(profile);

  document.querySelectorAll(".button").forEach(button => {
    button.addEventListener("click", () => vibrate(8));
  });

  const contactButton = document.querySelector("[data-contact]");
  if(contactButton){
    contactButton.addEventListener("click", () => {
      vibrate(12);
      showToast();
    });
  }

  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
});
