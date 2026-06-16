/* ═══════════════════════════════════════
   KJM.DEV — main.js
═══════════════════════════════════════ */
'use strict';

const GITHUB_USERNAME = 'duwjd25'; // ← 변경!

/* ─── 헤더 스크롤 ─── */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ─── 햄버거 & 오버레이 ─── */
const hamburger   = document.getElementById('hamburger');
const navOverlay  = document.getElementById('navOverlay');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navOverlay.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.getElementById('overlayClose').addEventListener('click', () => {
  hamburger.classList.remove('open');
  navOverlay.classList.remove('open');
  document.body.style.overflow = '';
});

document.querySelectorAll('[data-close]').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navOverlay.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ─── LP 디스크 스크롤 패럴랙스 ─── */
const lpDisc     = document.getElementById('lpDisc');
const aboutSec   = document.getElementById('about');
let lpAnimated   = false;
let lpProgress   = 0; // 0 ~ 1

function updateLP() {
  if (!aboutSec || !lpDisc) return;
  const rect = aboutSec.getBoundingClientRect();
  const winH  = window.innerHeight;
  // 섹션이 화면에 들어오기 시작할 때 ~ 중앙에 올 때까지 0→1
  const start  = winH * 0.9;
  const end    = winH * 0.0;
  const raw    = (start - rect.top) / (start - end);
  lpProgress   = Math.min(1, Math.max(0, raw));

  
lpDisc.style.clipPath = `none`;

const deg = lpProgress * 180;
const tx  = lpProgress * 350;
lpDisc.style.transform = `translate(calc(-50% + ${tx}px), -50%) rotate(${deg}deg)`;
}

/* ─── 믹서 Fader 애니메이션 (IntersectionObserver) ─── */
const mixerConsole = document.getElementById('mixerConsole');
let mixerFired     = false;

function animateFaders() {
  if (mixerFired) return;
  mixerFired = true;
  const channels = document.querySelectorAll('.mixer-channel');
  channels.forEach((ch, i) => {
    const level   = parseInt(ch.dataset.level, 10); // 65~85
    const fill    = ch.querySelector('.fader-fill');
    const knob    = ch.querySelector('.fader-knob');
    const trackH  = 160; // fader-track height px
    setTimeout(() => {
      fill.style.height  = `${level}%`;
      knob.style.bottom  = `calc(${level}% - 5px)`;
    }, i * 120); // 채널별 순차 딜레이
  });
}

const mixerObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) animateFaders();
}, { threshold: 0.3 });
if (mixerConsole) mixerObserver.observe(mixerConsole);

/* ─── 스크롤 Reveal ─── */
function revealOnScroll() {
  document.querySelectorAll('.reveal').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.88)
      el.classList.add('visible');
  });
  document.querySelectorAll('.gh-card:not(.revealed)').forEach((c, i) => {
    if (c.getBoundingClientRect().top < window.innerHeight * 0.92)
      setTimeout(() => c.classList.add('revealed'), i * 70);
  });
}

/* ─── 통합 스크롤 핸들러 ─── */
window.addEventListener('scroll', () => {
  updateLP();
  revealOnScroll();
}, { passive: true });

/* ─── Vinyl Rack 아코디언 ─── */
document.querySelectorAll('.rack-item').forEach(item => {
  item.querySelector('.rack-header').addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.rack-item').forEach(i => i.classList.remove('active'));
    if (!isActive) item.classList.add('active');
  });
});

/* ─── 캐러셀 슬라이더 ─── */
const carTrack  = document.getElementById('carouselTrack');
const carDots   = document.getElementById('carouselDots');
const tdMsg     = document.getElementById('tdMsg');
const carItems  = document.querySelectorAll('.car-item');
const CAR_TOTAL = carItems.length;
let carCur      = 0;
let carTimer    = null;

// 도트 생성
carItems.forEach((_, i) => {
  const dot = document.createElement('span');
  dot.className = 'car-dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => carGoTo(i));
  carDots.appendChild(dot);
});

function carGoTo(idx) {
  carCur = (idx + CAR_TOTAL) % CAR_TOTAL;
  carItems.forEach((item, i) => item.classList.toggle('active', i === carCur));
  document.querySelectorAll('.car-dot').forEach((d, i) => d.classList.toggle('active', i === carCur));

  // 중앙 정렬: 활성 카드를 캐러셀 중앙으로
  const itemW   = carItems[0].offsetWidth + 24; // gap 포함
  const wrapW   = carTrack.parentElement.offsetWidth;
  const offset  = (wrapW / 2) - (carCur * itemW) - (itemW / 2);
  carTrack.style.transform = `translateX(${offset}px)`;
  carTrack.style.transition = 'transform .6s cubic-bezier(.4,0,.2,1)';

  // 메시지 전환
  tdMsg.classList.add('fade');
  setTimeout(() => {
    tdMsg.textContent = carItems[carCur].dataset.msg;
    tdMsg.classList.remove('fade');
  }, 360);
}

function carNext() { carGoTo(carCur + 1); }
carGoTo(0);
carTimer = setInterval(carNext, 4000);

document.getElementById('carBtnPrev').addEventListener('click', () => { carGoTo(carCur - 1); resetCarTimer(); });
document.getElementById('carBtnNext').addEventListener('click', () => { carGoTo(carCur + 1); resetCarTimer(); });

// 드래그/터치로도 제어
let dragStartX = 0;
carTrack.addEventListener('mousedown', e => { dragStartX = e.clientX; });
carTrack.addEventListener('mouseup',   e => {
  const delta = e.clientX - dragStartX;
  if (Math.abs(delta) > 50) { carGoTo(carCur + (delta < 0 ? 1 : -1)); resetCarTimer(); }
});
carTrack.addEventListener('touchstart', e => { dragStartX = e.touches[0].clientX; }, { passive: true });
carTrack.addEventListener('touchend',   e => {
  const delta = e.changedTouches[0].clientX - dragStartX;
  if (Math.abs(delta) > 40) { carGoTo(carCur + (delta < 0 ? 1 : -1)); resetCarTimer(); }
});
function resetCarTimer() { clearInterval(carTimer); carTimer = setInterval(carNext, 4000); }

/* ─── GitHub API ─── */
async function loadGitHub() {
  const grid  = document.getElementById('ghGrid');
  const badge = document.getElementById('ghBadge');
  try {
    const res  = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`);
    if (!res.ok) throw new Error(res.status);
    const repos  = await res.json();
    const list   = repos.filter(r => !r.fork).slice(0, 12);

    if (!list.length) {
      grid.innerHTML = '<p style="color:var(--text-muted);padding:40px 0;">공개된 저장소가 없습니다.</p>';
      return;
    }

    // README 병렬 fetch
    const readmes = await Promise.all(list.map(async r => {
      try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${r.name}/readme`, {
          headers: { 'Accept': 'application/vnd.github.raw' }
        });
        if (!res.ok) return '';
        const text = await res.text();
        // 첫 200자만
        return text.replace(/#{1,6}\s/g, '').replace(/[*_`]/g, '').trim().slice(0, 200);
      } catch { return ''; }
    }));

    grid.innerHTML = list.map((r, i) => `
      <div class="gh-card">
        <div class="gh-card-top">
          <span class="gh-name">${esc(r.name)}</span>
          <a class="gh-link" href="${r.html_url}" target="_blank" rel="noopener" aria-label="${esc(r.name)}">↗</a>
        </div>
        <p class="gh-desc">${r.description ? esc(r.description) : '설명이 없습니다.'}</p>
        ${readmes[i] ? `<p class="gh-readme">${esc(readmes[i])}${readmes[i].length >= 200 ? '...' : ''}</p>` : ''}
        <div class="gh-meta">
          ${r.language ? `<span class="gh-lang"><span class="gh-ldot" style="background:${langColor(r.language)}"></span>${esc(r.language)}</span>` : ''}
          ${r.stargazers_count > 0 ? `<span class="gh-stars">★ ${r.stargazers_count}</span>` : ''}
          ${(r.topics || []).slice(0, 2).map(t => `<span class="gh-topic">${esc(t)}</span>`).join('')}
        </div>
      </div>`).join('');

    badge.textContent = `● LIVE — ${list.length} REPOS`;
    badge.classList.add('live');
    revealOnScroll();
  } catch(e) {
    grid.innerHTML = `<p style="color:var(--text-muted);padding:40px 0;font-size:14px;">GITHUB_USERNAME을 main.js에서 설정해주세요.<br><code style="color:var(--purple);">const GITHUB_USERNAME = '본인아이디'</code></p>`;
    console.warn('GitHub API:', e);
  }
}


function langColor(l) {
  return ({ JavaScript:'#f1e05a', TypeScript:'#3178c6', Python:'#3572A5',
            Java:'#b07219', C:'#555555', 'C++':'#f34b7d',
            HTML:'#e34c26', CSS:'#563d7c', Shell:'#89e051' })[l] || '#8B5CF6';
}
function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ─── 초기화 ─── */
document.addEventListener('DOMContentLoaded', () => {
  revealOnScroll();
  updateLP();
  loadGitHub();
  // 첫 도트 메시지
  if (carItems[0]) tdMsg.textContent = carItems[0].dataset.msg;

});
// 리사이즈 시 캐러셀 재정렬
window.addEventListener('resize', () => carGoTo(carCur));



window.addEventListener('scroll', () => {
  updateLP();
  revealOnScroll();
}, { passive: true });