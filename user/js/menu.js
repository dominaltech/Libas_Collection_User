/* ═══════════════════════════════════════════════════════════════════
   Libas Collection — Shared Menu + Search Module
   Include AFTER supabase and auth.js on every storefront page.
   ═══════════════════════════════════════════════════════════════════ */

// ── Inject glassmorphism menu HTML + CSS once ──────────────────────
(function injectMenu() {
  if (document.getElementById('glassMenu')) return; // already injected

  /* ── CSS ── */
  const style = document.createElement('style');
  style.textContent = `
/* ── Page transition ── */
@keyframes _pageIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.page-enter{animation:_pageIn .32s cubic-bezier(.22,.61,.36,1) both}

/* ── Hamburger morphing icon (spring) ── */
.ham-icon{width:22px;height:16px;display:flex;flex-direction:column;justify-content:space-between;cursor:pointer}
.ham-icon span{display:block;height:2px;background:#E8CC6A;border-radius:2px;transition:transform .38s cubic-bezier(.68,-.6,.32,1.6),opacity .22s ease,width .3s ease;will-change:transform}
.ham-icon.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.ham-icon.open span:nth-child(2){opacity:0;transform:scaleX(0)}
.ham-icon.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
/* ── Header scroll hide/show ── */
#mainHeader{transition:transform .3s cubic-bezier(.4,0,.2,1);will-change:transform}
#mainHeader.header-hidden{transform:translateY(-100%)}

/* ── Glass menu overlay ── */
@keyframes _goldPulse{0%,100%{opacity:.3}50%{opacity:.7}}
#glassMenu{
  position:fixed;inset:0;z-index:9998;
  display:flex;align-items:stretch;
  pointer-events:none;opacity:0;
  transition:opacity .35s ease;
}
#glassMenu.open{pointer-events:auto;opacity:1}
#glassMenuBackdrop{
  position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(24,6,38,.93) 0%,rgba(59,7,100,.89) 60%,rgba(76,29,149,.86) 100%);
  backdrop-filter:blur(22px) saturate(1.6);
  -webkit-backdrop-filter:blur(22px) saturate(1.6);
}
#glassMenuPanel{
  position:relative;z-index:1;margin-left:auto;
  width:min(380px,100vw);height:100%;
  display:flex;flex-direction:column;overflow:hidden;
  border-left:1px solid rgba(212,175,55,.18);
  transform:translateX(100%);
  transition:transform .4s cubic-bezier(.22,.61,.36,1);
}
#glassMenu.open #glassMenuPanel{transform:translateX(0)}
.glass-panel-inner{flex:1;display:flex;flex-direction:column;padding:28px 32px 32px;overflow-y:auto}
.glass-nav-link{
  display:flex;align-items:center;gap:14px;
  background:none;border:none;cursor:pointer;width:100%;text-align:left;
  padding:14px 0;border-bottom:1px solid rgba(212,175,55,.08);
  opacity:0;transform:translateX(40px);
  transition:opacity .35s,transform .35s;
  position:relative;overflow:hidden;
}
.glass-nav-link::before{
  content:'';position:absolute;left:-100%;top:0;bottom:0;width:100%;
  background:linear-gradient(90deg,transparent,rgba(212,175,55,.06),transparent);
  transition:left .4s ease;
}
.glass-nav-link:hover::before{left:100%}
.glass-nav-link:hover .gnl-text{color:#fff}
.glass-nav-link:hover .gnl-icon{background:rgba(212,175,55,.22);transform:scale(1.08)}
.glass-nav-link:last-child{border-bottom:none}
.gnl-icon{
  width:42px;height:42px;border-radius:11px;
  background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.2);
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;transition:all .2s;font-size:18px;
}
.gnl-text{font-family:'Cinzel',serif;font-size:15px;font-weight:600;color:#E8CC6A;letter-spacing:.5px;transition:color .2s}
.gnl-sub{font-size:10px;color:rgba(255,255,255,.35);font-family:'Lato',sans-serif;margin-top:2px}
#glassMenu.open .glass-nav-link{opacity:1;transform:translateX(0)}
#glassMenu.open .glass-nav-link:nth-child(1){transition-delay:.04s}
#glassMenu.open .glass-nav-link:nth-child(2){transition-delay:.09s}
#glassMenu.open .glass-nav-link:nth-child(3){transition-delay:.14s}
#glassMenu.open .glass-nav-link:nth-child(4){transition-delay:.19s}
#glassMenu.open .glass-nav-link:nth-child(5){transition-delay:.24s}
#glassMenu.open .glass-nav-link:nth-child(6){transition-delay:.29s}
#glassMenu.open .glass-nav-link:nth-child(7){transition-delay:.34s}
.glass-ornaline{display:flex;align-items:center;gap:10px;margin:18px 0 14px}
.glass-ornaline::before,.glass-ornaline::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,.4),transparent)}
.glass-ornaline span{color:#C9A020;font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;white-space:nowrap;animation:_goldPulse 2.5s ease infinite}
.menu-orb{position:absolute;border-radius:50%;pointer-events:none;animation:_goldPulse 3s ease infinite}

/* ── Smart Search ── */
.search-wrap{position:relative;flex:1;max-width:520px}
.search-wrap input{width:100%;padding:10px 40px 10px 16px;border:1px solid rgba(212,175,55,.5);border-radius:24px;background:rgba(255,255,255,.12);color:#fff;font-size:14px;outline:none;transition:background .2s,border-color .2s;font-family:'Lato',sans-serif}
.search-wrap input::placeholder{color:rgba(255,255,255,.45)}
.search-wrap input:focus{background:rgba(255,255,255,.18);border-color:#D4AF37}
.search-wrap .srch-icon{position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;opacity:.7}
.search-dropdown{position:absolute;top:calc(100% + 6px);left:0;right:0;background:#1a0535;border:1px solid rgba(212,175,55,.3);border-radius:12px;padding:6px;z-index:9999;box-shadow:0 16px 48px rgba(0,0,0,.6);max-height:340px;overflow-y:auto;display:none}
.search-dropdown.open{display:block;animation:floatIn .15s ease}
.sg-group-label{font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;color:#C9A020;padding:10px 10px 6px;opacity:.8}
.sg-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 6px 10px}
.sg-chip{background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.3);color:#E8CC6A;border-radius:20px;padding:5px 13px;font-size:12px;font-family:'Lato',sans-serif;cursor:pointer;transition:all .18s;white-space:nowrap}
.sg-chip:hover{background:rgba(212,175,55,.25);border-color:#D4AF37;transform:translateY(-1px);box-shadow:0 4px 12px rgba(212,175,55,.2)}
.sg-chip-new{background:linear-gradient(135deg,rgba(201,160,32,.2),rgba(232,204,106,.15));border-color:#C9A020}
.search-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;transition:background .12s}
.search-item:hover{background:rgba(212,175,55,.1)}
.search-item-img{width:38px;height:38px;border-radius:6px;object-fit:cover;flex-shrink:0;background:rgba(255,255,255,.08)}
.search-item-name{font-size:13px;color:#E8CC6A;font-weight:600;line-height:1.3}
.search-item-meta{font-size:11px;color:rgba(255,255,255,.45);margin-top:2px}
.search-no-results{text-align:center;padding:18px;color:rgba(255,255,255,.4);font-size:13px}
`;
  document.head.appendChild(style);

  /* ── HTML overlay ── */
  const el = document.createElement('div');
  el.id = 'glassMenu';
  el.onclick = (e) => {
    if (e.target === el || e.target.id === 'glassMenuBackdrop') toggleMobileMenu();
  };
  el.innerHTML = `
  <div id="glassMenuBackdrop"></div>
  <div class="menu-orb" style="width:280px;height:280px;top:-70px;right:-70px;background:radial-gradient(circle,rgba(212,175,55,.08),transparent 70%)"></div>
  <div class="menu-orb" style="width:180px;height:180px;bottom:60px;right:30px;background:radial-gradient(circle,rgba(139,92,246,.1),transparent 70%);animation-delay:1.2s"></div>
  <div id="glassMenuPanel">
    <div style="padding:18px 26px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(212,175,55,.12)">
      <div>
        <div style="font-family:'Cinzel',serif;font-size:20px;font-weight:700;letter-spacing:2px;background:linear-gradient(90deg,#C9A020,#E8CC6A,#C9A020);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">Libas</div>
        <div style="font-family:'Cinzel',serif;font-size:7px;letter-spacing:5px;color:rgba(232,204,106,.5);margin-top:1px">COLLECTION</div>
      </div>
      <button onclick="toggleMobileMenu()" style="background:rgba(255,255,255,.06);border:1px solid rgba(212,175,55,.2);width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s" onmouseover="this.style.background='rgba(212,175,55,.15)'" onmouseout="this.style.background='rgba(255,255,255,.06)'">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#E8CC6A" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="glass-panel-inner">
      <nav>
        <button class="glass-nav-link" onclick="if(typeof showPage!=='undefined')showPage('home');else window.location.href='index.html';toggleMobileMenu()">
          <div class="gnl-icon"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#E8CC6A" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg></div><div><div class="gnl-text">Home</div><div class="gnl-sub">Back to homepage</div></div>
        </button>
        <button class="glass-nav-link" onclick="if(typeof showProducts!=='undefined')showProducts('Shirting');else window.location.href='Shirting.html';toggleMobileMenu()">
          <div class="gnl-icon"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#E8CC6A" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.5 3L3 7l3.5 1.5V20h11V8.5L21 7l-3.5-4-2 1.5a3 3 0 01-5 0L6.5 3z"/></svg></div><div><div class="gnl-text">Shirting</div><div class="gnl-sub">Linen, Cotton, Khadi & more</div></div>
        </button>
        <button class="glass-nav-link" onclick="if(typeof showProducts!=='undefined')showProducts('Suiting');else window.location.href='Suiting.html';toggleMobileMenu()">
          <div class="gnl-icon"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#E8CC6A" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3L7 6v15h10V6L12 3zM9 6l3 5 3-5M12 11v10"/></svg></div><div><div class="gnl-text">Suiting</div><div class="gnl-sub">Premium suiting fabrics</div></div>
        </button>
        <button class="glass-nav-link" onclick="if(typeof openThaan!=='undefined')openThaan();else window.location.href='Wholesale.html';toggleMobileMenu()">
          <div class="gnl-icon"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#E8CC6A" stroke-width="1.5"><rect x="5" y="11" width="14" height="10" rx="2"/><path stroke-linecap="round" d="M8 11V7a4 4 0 018 0v4"/></svg></div><div><div class="gnl-text">Wholesale</div><div class="gnl-sub">Restricted · Enter password</div></div>
        </button>
        <button class="glass-nav-link" onclick="if(typeof showProducts!=='undefined')showProducts();else window.location.href='viewallproducts.html';toggleMobileMenu()">
          <div class="gnl-icon"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#E8CC6A" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></div><div><div class="gnl-text">All Products</div><div class="gnl-sub">Browse entire collection</div></div>
        </button>
        <button class="glass-nav-link" onclick="if(typeof showPage!=='undefined')showPage('cart');else window.location.href='cart.html';toggleMobileMenu()">
          <div class="gnl-icon"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#E8CC6A" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg></div><div><div class="gnl-text">My Cart</div><div class="gnl-sub">View items & checkout</div></div>
        </button>
        <button class="glass-nav-link" onclick="window.location.href='profile.html';toggleMobileMenu()">
          <div class="gnl-icon"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#E8CC6A" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div><div><div class="gnl-text">My Profile</div><div class="gnl-sub">Orders, address & account</div></div>
        </button>
      </nav>
      <div class="glass-ornaline"><span>✦ EST 1993 ✦</span></div>
      <div style="margin-top:auto;padding-top:12px">
        <p style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;color:#C9A020;margin-bottom:12px">CONTACT US</p>
        <div style="display:flex;flex-direction:column;gap:9px">
          <a href="tel:9270704810" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:rgba(255,255,255,.6);font-size:13px;transition:color .2s" onmouseover="this.style.color='#E8CC6A'" onmouseout="this.style.color='rgba(255,255,255,.6)'"><svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(201,160,32,.7)" stroke-width="1.5" style="flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> 9270704810</a>
          <a href="mailto:libasecom@gmail.com" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:rgba(255,255,255,.6);font-size:13px;transition:color .2s" onmouseover="this.style.color='#E8CC6A'" onmouseout="this.style.color='rgba(255,255,255,.6)'"><svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(201,160,32,.7)" stroke-width="1.5" style="flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> libasecom@gmail.com</a>
          <span style="display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.6);font-size:13px"><svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="rgba(201,160,32,.7)" stroke-width="1.5" style="flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> Solapur, Maharashtra</span>
        </div>
      </div>
      <div style="margin-top:18px;text-align:center">
        <p style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;color:rgba(212,175,55,.3)">© 2025 LIBAS COLLECTION</p>
        <p style="font-family:'Cormorant Garamond',serif;font-size:12px;color:rgba(255,255,255,.18);margin-top:3px;font-style:italic">Threads of Trust Since 1993</p>
      </div>
    </div>
  </div>`;
  document.body.appendChild(el);

  /* ── Upgrade hamburger button in-place ── */
  document.querySelectorAll('.mobile-btn').forEach(btn => {
    btn.id = btn.id || 'hamburgerBtn';
    btn.innerHTML = '<div class="ham-icon" id="hamIcon"><span></span><span></span><span></span></div>';
  });
})();

// ── Toggle Menu ────────────────────────────────────────────────────
function toggleMobileMenu() {
  const m = document.getElementById('glassMenu');
  const h = document.getElementById('hamIcon');
  if (!m) return;
  const isOpen = m.classList.contains('open');
  if (isOpen) {
    m.classList.remove('open');
    h?.classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', _libas_escHandler);
  } else {
    m.classList.add('open');
    h?.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', _libas_escHandler);
  }
}
function _libas_escHandler(e) { if (e.key === 'Escape') toggleMobileMenu(); }

// ── Header Scroll Hide/Show ──────────────────────────────────────
(function initHeaderScroll() {
  let lastY = 0, ticking = false;
  const THRESHOLD = 60;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const h = document.getElementById('mainHeader');
      if (h) {
        const y = window.scrollY;
        if (y > THRESHOLD) {
          h.classList.toggle('header-hidden', y > lastY);
        } else {
          h.classList.remove('header-hidden');
        }
        lastY = y;
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive: true});
})();

// ── Toggle Search ──────────────────────────────────────────────────
function toggleSearch() {
  const s = document.getElementById('searchBar');
  if (!s) return;
  const isOpen = s.style.display === 'block';
  if (isOpen) {
    s.style.display = 'none';
    closeSearchDropdown();
  } else {
    s.style.display = 'block';
    setTimeout(() => {
      const inp = document.getElementById('searchInput');
      if (inp) { inp.focus(); showAllSuggestions(); }
    }, 50);
  }
}

// ── Smart Search ───────────────────────────────────────────────────
let _srchTimer = null;

function handleSearchInput(val) {
  clearTimeout(_srchTimer);
  _srchTimer = setTimeout(() => {
    if (!val || !val.trim()) showAllSuggestions();
    else showFilteredSuggestions(val.trim());
    if (typeof filterProducts === 'function') filterProducts();
  }, 100);
}

function showAllSuggestions() {
  const dd = document.getElementById('searchDropdown');
  if (!dd) return;
  const prods = (typeof allProducts !== 'undefined') ? allProducts : [];

  const cats   = [...new Set(prods.map(p => p.category).filter(Boolean))];
  const types  = [...new Set(prods.map(p => p.subcategory).filter(Boolean))].sort();
  const brands = [...new Set(prods.map(p => p.brand).filter(Boolean))].sort();
  const hasNew = prods.some(p => p.is_new);

  let html = '';
  if (cats.length) {
    html += `<div class="sg-group-label">CATEGORY</div><div class="sg-chips">`;
    html += cats.map(c => `<button class="sg-chip" onclick="applySearchFilter('cat','${c}')">${c==='Shirting'?'<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:3px"><path d="M6.5 3L3 7l3.5 1.5V20h11V8.5L21 7l-3.5-4-2 1.5a3 3 0 01-5 0L6.5 3z"/></svg>':c==='Suiting'?'<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:3px"><path d="M12 3L7 6v15h10V6L12 3zM9 6l3 5 3-5M12 11v10"/></svg>':'<svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:3px"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'}${c}</button>`).join('');
    html += `</div>`;
  }
  if (types.length) {
    html += `<div class="sg-group-label">FABRIC TYPE</div><div class="sg-chips">`;
    html += types.map(t => `<button class="sg-chip" onclick="applySearchFilter('type','${t}')">${t}</button>`).join('');
    html += `</div>`;
  }
  if (brands.length) {
    html += `<div class="sg-group-label">BRAND</div><div class="sg-chips">`;
    html += brands.map(b => `<button class="sg-chip" onclick="applySearchFilter('brand','${b}')">${b}</button>`).join('');
    html += `</div>`;
  }
  if (hasNew) {
    html += `<div class="sg-group-label">ARRIVALS</div><div class="sg-chips"><button class="sg-chip sg-chip-new" onclick="applySearchFilter('new','')">&#10024; New Arrivals Only</button></div>`;
  }
  if (!html) html = '<div class="search-no-results">Browse categories above to explore</div>';

  dd.innerHTML = html;
  dd.classList.add('open');
}

function showFilteredSuggestions(q) {
  const dd = document.getElementById('searchDropdown');
  if (!dd) return;
  const prods = (typeof allProducts !== 'undefined') ? allProducts : [];
  const lq = q.toLowerCase();

  const cats   = [...new Set(prods.map(p=>p.category).filter(Boolean))].filter(c=>c.toLowerCase().includes(lq));
  const types  = [...new Set(prods.map(p=>p.subcategory).filter(Boolean))].filter(t=>t.toLowerCase().includes(lq)).sort();
  const brands = [...new Set(prods.map(p=>p.brand).filter(Boolean))].filter(b=>b.toLowerCase().includes(lq)).sort();
  const items  = prods.filter(p=>p.name.toLowerCase().includes(lq)||(p.product_no||'').toLowerCase().includes(lq)).slice(0,5);

  const FABRIC_BGS=['linear-gradient(135deg,#2d0a52,#4c1d95)','linear-gradient(135deg,#1e3a5f,#1d4ed8)','linear-gradient(135deg,#1a2e1a,#166534)','linear-gradient(135deg,#3d0c11,#991b1b)'];
  const fabBgFn = id => FABRIC_BGS[String(id||'').charCodeAt(String(id||'').length-1)%FABRIC_BGS.length]||FABRIC_BGS[0];

  let html = '';
  if (cats.length) { html+=`<div class="sg-group-label">CATEGORY</div><div class="sg-chips">`+cats.map(c=>`<button class="sg-chip" onclick="applySearchFilter('cat','${c}')">${c}</button>`).join('')+`</div>`; }
  if (types.length) { html+=`<div class="sg-group-label">FABRIC TYPE</div><div class="sg-chips">`+types.map(t=>`<button class="sg-chip" onclick="applySearchFilter('type','${t}')">🧵 ${t}</button>`).join('')+`</div>`; }
  if (brands.length) { html+=`<div class="sg-group-label">BRAND</div><div class="sg-chips">`+brands.map(b=>`<button class="sg-chip" onclick="applySearchFilter('brand','${b}')">${b}</button>`).join('')+`</div>`; }
  if (items.length) {
    html+=`<div class="sg-group-label">PRODUCTS</div>`;
    html+=items.map(p=>`<div class="search-item" onclick="applySearchFilter('product','${p.id}')"><div class="search-item-img" style="background:${fabBgFn(p.id)}">${p.image_url?`<img src="${p.image_url}" style="width:100%;height:100%;object-fit:cover;border-radius:6px" loading="lazy">`:'<span style="font-size:16px;display:flex;align-items:center;justify-content:center;height:100%">🧵</span>'}</div><div><div class="search-item-name">${p.name}${p.is_new?'<span style="margin-left:5px;font-size:9px;background:#C9A020;color:#180626;padding:1px 5px;border-radius:3px">NEW</span>':''}</div><div class="search-item-meta">${[p.brand,p.subcategory].filter(Boolean).join(' · ')} · ₹${Number(p.price).toFixed(0)}/m</div></div></div>`).join('');
  }
  if (!html) html=`<div class="search-no-results">🔍 No results for "${q}"</div>`;

  dd.innerHTML = html;
  dd.classList.add('open');
}

function applySearchFilter(type, value) {
  closeSearchDropdown();
  if (document.getElementById('searchBar')) {
    document.getElementById('searchBar').style.display = 'none';
  }
  const inp = document.getElementById('searchInput');
  if (inp) inp.value = '';

  if (type === 'cat')     { if(typeof currentCat!=='undefined'){currentCat=value;currentSub='';currentBrand='';} else {window.location.href=`viewallproducts.html?cat=${encodeURIComponent(value)}`;return;} }
  else if (type === 'type')  { if(typeof currentSub!=='undefined'){currentSub=value;currentBrand='';} else {window.location.href=`viewallproducts.html?sub=${encodeURIComponent(value)}`;return;} }
  else if (type === 'brand') { if(typeof currentBrand!=='undefined'){currentBrand=value;currentSub='';} else {window.location.href=`viewallproducts.html?brand=${encodeURIComponent(value)}`;return;} }
  else if (type === 'new') { const chk=document.getElementById('filterNewCheck'); if(chk){chk.checked=true;if(typeof filterProducts==='function')filterProducts();return;} }
  else if (type === 'product') {
    if (typeof openProduct==='function') { openProduct(value); return; }
    else { window.location.href=`viewallproducts.html?product=${encodeURIComponent(value)}`; return; }
  }
  if (typeof _applyNav==='function') _applyNav({page:'products',cat:currentCat,sub:currentSub,brand:currentBrand},true);
}

function openSearchDropdown() { const dd=document.getElementById('searchDropdown'); if(dd&&dd.innerHTML)dd.classList.add('open'); }
function closeSearchDropdown() { const dd=document.getElementById('searchDropdown'); if(dd)dd.classList.remove('open'); }
function filterProducts() { if(document.getElementById('productGrid')&&typeof renderProductGrid==='function')renderProductGrid(); }

// Close dropdown on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap') && !e.target.closest('#searchBar')) closeSearchDropdown();
});
