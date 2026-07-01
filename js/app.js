async function loadProfile(){
  try{
    const response = await fetch('profile.json', { cache: 'no-store' });
    const profile = await response.json();

    document.title = profile.identity.name;

    const logo = document.getElementById('logo');
    logo.src = profile.identity.logo;
    logo.alt = profile.identity.company || 'Logo';

    document.documentElement.style.setProperty('--blue', profile.identity.themeColor || '#233F91');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', profile.identity.themeColor || '#233F91');

    document.getElementById('name').textContent = profile.identity.name;

    document.getElementById('departmentIt').textContent = profile.role.department_it;
    document.getElementById('departmentEn').textContent = profile.role.department_en;
    document.getElementById('roleIt').textContent = profile.role.role_it;
    document.getElementById('roleEn').textContent = profile.role.role_en;

    document.getElementById('contactLink').href = profile.contacts.vcard || 'contact.vcf';
    document.getElementById('phoneLink').href = `tel:${profile.contacts.phone}`;
    document.getElementById('emailLink').href = `mailto:${profile.contacts.email}`;
    document.getElementById('linkedinLink').href = profile.contacts.linkedin;

    document.getElementById('contactLabel').textContent = profile.labels.add_contact;
    document.getElementById('phoneLabel').textContent = profile.labels.phone;
    document.getElementById('emailLabel').textContent = profile.labels.email;
    document.getElementById('linkedinLabel').textContent = profile.labels.linkedin;
    document.getElementById('footer').textContent = profile.labels.footer;

    window.SL_IDENTITY = profile;
  }catch(error){
    console.error('Errore caricamento profile.json', error);
  }
}

function vibrate(ms = 8){
  if(navigator.vibrate) navigator.vibrate(ms);
}

function showToast(text){
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

document.addEventListener('click', event => {
  const button = event.target.closest('.button');
  if(button) vibrate(8);
});

document.addEventListener('DOMContentLoaded', async () => {
  await loadProfile();

  const contactButton = document.querySelector('[data-contact]');
  contactButton.addEventListener('click', () => {
    vibrate(12);
    const text = window.SL_IDENTITY?.labels?.toast_contact || 'Contatto pronto';
    showToast(text);
  });

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
