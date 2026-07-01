const PAGE_URL='https://simonelaraia-cmyk.github.io/sl-identity/';

async function loadProfile(){
  try{
    const r=await fetch('profile.json',{cache:'no-store'});
    const p=await r.json();
    document.getElementById('name').textContent=p.name;
    document.getElementById('departmentIt').textContent=p.department_it;
    document.getElementById('departmentEn').textContent=p.department_en;
    document.getElementById('roleIt').textContent=p.role_it;
    document.getElementById('roleEn').textContent=p.role_en;
    document.getElementById('phoneLink').href=`tel:${p.phone}`;
    document.getElementById('emailLink').href=`mailto:${p.email}`;
    document.getElementById('linkedinLink').href=p.linkedin;
    document.getElementById('footer').textContent=p.footer||'SL Identity';
  }catch(e){console.warn('Profile not loaded',e)}
}

const toast=document.querySelector('.toast');
const contactButton=document.querySelector('[data-contact]');
const qrButton=document.getElementById('qrButton');
const shareButton=document.getElementById('shareButton');
const qrModal=document.getElementById('qrModal');
const closeQr=document.getElementById('closeQr');

function pulse(ms=8){if(navigator.vibrate)navigator.vibrate(ms)}
function showToast(text){toast.textContent=text;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)}

contactButton.addEventListener('click',()=>{pulse(12);showToast('Contatto pronto per essere aggiunto')});
document.querySelectorAll('.button').forEach(b=>b.addEventListener('click',()=>pulse(8)));

qrButton.addEventListener('click',()=>{pulse(8);qrModal.classList.add('show');qrModal.setAttribute('aria-hidden','false')});
closeQr.addEventListener('click',()=>{qrModal.classList.remove('show');qrModal.setAttribute('aria-hidden','true')});
qrModal.addEventListener('click',(e)=>{if(e.target===qrModal){qrModal.classList.remove('show');qrModal.setAttribute('aria-hidden','true')}});

shareButton.addEventListener('click',async()=>{
  pulse(8);
  if(navigator.share){
    try{await navigator.share({title:'Simone Laraia - SL Identity',text:'Contatto professionale Simone Laraia',url:PAGE_URL})}
    catch(e){}
  }else{
    await navigator.clipboard.writeText(PAGE_URL);
    showToast('Link copiato')
  }
});

if('serviceWorker'in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}

loadProfile();
