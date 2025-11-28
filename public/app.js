(function(){
  const root = document.documentElement;
  const setTheme = (t)=>{
    if(t==='light'){ root.classList.add('light'); localStorage.setItem('theme','light'); }
    else { root.classList.remove('light'); localStorage.setItem('theme','dark'); }
  };
  setTheme(localStorage.getItem('theme')||'light');

  document.addEventListener('click', (e)=>{
    if(e.target && e.target.id === 'theme-toggle'){
      const isLight = document.documentElement.classList.contains('light');
      setTheme(isLight ? 'dark' : 'light');
      if(document.body.classList.contains('dashboard') && window.buildCharts) window.buildCharts();
    }
  });

  const isAuthPage = /\/(login|signup)\.html$/.test(location.pathname);
  const isAuthed = () => localStorage.getItem('auth') === '1' || sessionStorage.getItem('auth') === '1';
  const authed = isAuthed();
  if(!isAuthPage && !authed){
    try { location.replace('/login.html'); } catch { window.location.href = '/login.html'; }
  }
  if(isAuthPage && authed){
    const last = localStorage.getItem('lastVisit') || '/';
    try { location.replace(last); } catch { window.location.href = last; }
  }

  const form = document.getElementById('login-form');
  if(form){
    form.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const email = form.elements.email.value.trim();
      const password = form.elements.password.value;
      const remember = !!form.elements.remember?.checked;
      const users = JSON.parse(localStorage.getItem('users')||'[]');
      const match = users.find(u=>u.email===email && u.password===password);
      if(!match){ alert('Invalid credentials (demo: sign up first)'); return; }
      if(remember){ localStorage.setItem('auth','1'); localStorage.setItem('remember','1'); }
      else { sessionStorage.setItem('auth','1'); localStorage.removeItem('remember'); }
      localStorage.setItem('user', JSON.stringify({ email: match.email, name: match.name||'User' }));
      try { location.replace('/'); } catch { window.location.href = '/'; }
    });
    const toggle = document.getElementById('toggle-pass');
    const pass = document.getElementById('password');
    if(toggle && pass){
      toggle.addEventListener('click', ()=>{
        pass.type = pass.type === 'password' ? 'text' : 'password';
      });
    }
  }

  const sForm = document.getElementById('signup-form');
  if(sForm){
    sForm.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const name = sForm.elements.name.value.trim();
      const email = sForm.elements.email.value.trim();
      const password = sForm.elements.password.value;
      const users = JSON.parse(localStorage.getItem('users')||'[]');
      if(users.some(u=>u.email===email)){ alert('Email already registered'); return; }
      users.push({ name, email, password });
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('auth','1');
      localStorage.setItem('user', JSON.stringify({ name, email }));
      try { location.replace('/'); } catch { window.location.href = '/'; }
    });
    const sToggle = document.getElementById('s-toggle');
    const sPass = document.getElementById('s-password');
    if(sToggle && sPass){
      sToggle.addEventListener('click', ()=>{
        sPass.type = sPass.type === 'password' ? 'text' : 'password';
      });
    }
  }

  function doLogout(){
    localStorage.removeItem('auth');
    sessionStorage.removeItem('auth');
    localStorage.removeItem('remember');
    localStorage.removeItem('user');
    try { location.replace('/login.html'); } catch { window.location.href = '/login.html'; }
  }
  const logout = document.getElementById('logout-btn');
  if(logout){ logout.addEventListener('click', doLogout); }

  function updateGauges(){
    document.querySelectorAll('.gauge').forEach(el=>{
      const v = parseFloat(el.getAttribute('data-value')||'0');
      const clamped = Math.max(0, Math.min(100, v));
      el.style.setProperty('--p', (clamped/100).toString());
      const n = el.querySelector('.gauge-num');
      if(n) n.textContent = `${clamped}%`;
    });
  }
  updateGauges();

  let charts = {};
  function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function buildCharts(){
    Object.values(charts).forEach(c=>{ try{ c.destroy(); }catch(e){} });
    charts = {};
    if(!window.Chart) return;

    const ds = document.getElementById('dailySalesChart');
    if(ds){
      const ctx = ds.getContext('2d');
      const grad = ctx.createLinearGradient(0,0,0,160);
      grad.addColorStop(0, cssVar('--success') + '80');
      grad.addColorStop(1, 'transparent');
      charts.daily = new Chart(ctx, {
        type:'line',
        data:{ labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets:[{ data:[12,18,14,22,19,27,24], borderColor: cssVar('--success'), backgroundColor: grad, fill:true, tension:.35, pointRadius:0 }] },
        options:{ plugins:{ legend:{ display:false } }, elements:{ line:{ borderWidth:3 } }, scales:{ x:{ grid:{ display:false }, ticks:{ color: cssVar('--muted') } }, y:{ grid:{ color: cssVar('--border') }, ticks:{ color: cssVar('--muted') } } } }
      });
    }

    const re = document.getElementById('revExpChart');
    if(re){
      const ctx = re.getContext('2d');
      charts.revExp = new Chart(ctx, { type:'bar', data:{ labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'], datasets:[ { label:'Revenue', data:[12,14,16,18,22,19,24,26,28], backgroundColor: cssVar('--primary-600') }, { label:'Expense', data:[7,8,9,10,12,11,13,12,15], backgroundColor: cssVar('--teal') } ] }, options:{ elements:{ bar:{ borderRadius:8 } }, plugins:{ legend:{ labels:{ color: cssVar('--muted') } } }, scales:{ x:{ ticks:{ color: cssVar('--muted') }, grid:{ display:false } }, y:{ ticks:{ color: cssVar('--muted') }, grid:{ color: cssVar('--border') } } } });
    }

    const ch = document.getElementById('channelChart');
    if(ch){ const ctx = ch.getContext('2d'); charts.channels = new Chart(ctx, { type:'doughnut', data:{ labels:['Organic','Paid','Referral','Email'], datasets:[{ data:[42,26,18,14], backgroundColor:[ cssVar('--primary-600'), cssVar('--teal'), cssVar('--orange'), '#64748b' ], borderWidth:0 }] }, options:{ plugins:{ legend:{ position:'bottom', labels:{ color: cssVar('--muted') } } } } }); }
  }
  window.buildCharts = buildCharts;
  if(document.body.classList.contains('dashboard')){
    try{ localStorage.setItem('lastVisit', location.pathname); }catch{}
    buildCharts();
  }

  const avatarBtn = document.getElementById('avatar-btn');
  const menu = document.getElementById('profile-menu');
  function setUserInfo(){
    try{
      const u = JSON.parse(localStorage.getItem('user')||'{}');
      if(u.name) document.getElementById('menu-name').textContent = u.name;
      if(u.email) document.getElementById('menu-email').textContent = u.email;
    }catch{}
  }
  setUserInfo();
  function closeMenu(){ if(menu) menu.classList.add('hidden'); }
  function toggleMenu(){ if(menu) menu.classList.toggle('hidden'); }
  if(avatarBtn){ avatarBtn.addEventListener('click', (e)=>{ e.stopPropagation(); toggleMenu(); }); }
  document.addEventListener('click', (e)=>{ if(menu && !menu.contains(e.target)) closeMenu(); });
  const menuTheme = document.getElementById('menu-theme');
  if(menuTheme){ menuTheme.addEventListener('click', ()=>{ document.getElementById('theme-toggle')?.click(); }); }
  const menuLogout = document.getElementById('menu-logout');
  if(menuLogout){ menuLogout.addEventListener('click', doLogout); }
})();
