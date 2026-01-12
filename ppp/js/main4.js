
    // 시간 표시(간단)
    function pad(n){ return String(n).padStart(2,'0'); }
    function setTime(){
      const el = document.getElementById('timeText');
      if(el){
        const d = new Date();
        let h = d.getHours();
        const m = d.getMinutes();
        const ampm = h < 12 ? '오전' : '오후';
        h = h % 12; if (h === 0) h = 12;
        el.textContent = `${h}:${pad(m)}`;
        document.getElementById('storeTime').textContent = `${ampm} ${pad(d.getHours())}:${pad(m)}`;
      }else{
        // status-bar를 주석 처리했으니 storeTime만 업데이트
        const d = new Date();
        const m = d.getMinutes();
        const ampm = d.getHours() < 12 ? '오전' : '오후';
        document.getElementById('storeTime').textContent = `${ampm} ${pad(d.getHours())}:${pad(m)}`;
      }
    }
    setTime();
    setInterval(setTime, 30000);

    // 하단 네비 active 토글
// 하단 네비: active + 페이지 이동
// 하단 네비: active + 페이지 이동
// 하단 네비: active + 페이지 이동 / 전체(☰)는 풀메뉴 오픈
const NAV_ROUTES = {
  home: 'index.html',
  menu: 'menu.html',
  order: 'order.html',
  family: 'mate.html',
  // more: 'more.html'  // ✅ '전체'는 오버레이 메뉴로 처리
};

// ✅ 전체(풀메뉴) 오픈/클로즈
const fullMenu = document.getElementById('fullMenu');
const closeMenuBtn = document.getElementById('closeMenuBtn');
let lastFocusedEl = null;

function openFullMenu() {
  if (!fullMenu) return;
  lastFocusedEl = document.activeElement;

  fullMenu.classList.add('is-open');
  fullMenu.setAttribute('aria-hidden', 'false');

  // 배경 스크롤 방지
  document.body.style.overflow = 'hidden';

  // 포커스 이동(접근성)
  if (closeMenuBtn) closeMenuBtn.focus();
}

function closeFullMenu() {
  if (!fullMenu) return;

  fullMenu.classList.remove('is-open');
  fullMenu.setAttribute('aria-hidden', 'true');

  document.body.style.overflow = '';

  if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
    lastFocusedEl.focus();
  }
}

// 닫기 버튼
if (closeMenuBtn) {
  closeMenuBtn.addEventListener('click', closeFullMenu);
}

// ESC로 닫기
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && fullMenu && fullMenu.classList.contains('is-open')) {
    closeFullMenu();
  }
});

// 메뉴 안의 링크 클릭 시 닫기(원하면 제거 가능)
if (fullMenu) {
  fullMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeFullMenu);
  });
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const tab = item.dataset.tab;

    // ✅ '전체' 버튼이면 오버레이 메뉴 열기
    if (tab === 'more' && fullMenu) {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      openFullMenu();
      return;
    }

    const target = NAV_ROUTES[tab];

    // active 토글
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // ✅ 페이지 이동
    if (target) window.location.href = `./${target}`;
  });
});


// 프로모션 배너: "스크롤 기반" 자동 넘김 + 스와이프시 dot 동기화
    const promoViewport = document.getElementById('promoViewport');
    const promoDotsWrap = document.getElementById('promoDots');
    const promoDots = promoDotsWrap ? Array.from(promoDotsWrap.querySelectorAll('.p-dot')) : [];
    const PROMO_TOTAL = 3;
    let promoIndex = 0;

    function promoSlideWidth(){
      return promoViewport ? promoViewport.clientWidth : 0;
    }

    function setPromoIndex(next){
      promoIndex = (next + PROMO_TOTAL) % PROMO_TOTAL;
      const x = promoSlideWidth() * promoIndex;
      promoViewport.scrollTo({ left: x, behavior: 'smooth' });
      promoDots.forEach((d,i)=>d.classList.toggle('active', i===promoIndex));
    }

    // 자동 넘김
    let promoTimer = setInterval(() => setPromoIndex(promoIndex + 1), 3500);

    // 사용자가 스와이프하면 인덱스 계산해서 dot 반영
    let scrollEndTimer = null;
    promoViewport.addEventListener('scroll', () => {
      // 자동 넘김 중 스와이프하면 잠시 멈춤
      clearInterval(promoTimer);
      promoTimer = setInterval(() => setPromoIndex(promoIndex + 1), 3500);

      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        const w = promoSlideWidth();
        if(!w) return;
        promoIndex = Math.round(promoViewport.scrollLeft / w);
        promoDots.forEach((d,i)=>d.classList.toggle('active', i===promoIndex));
      }, 80);
    }, { passive:true });

    // 점 클릭으로 이동(옵션)
    promoDots.forEach((dot, i) => {
      dot.addEventListener('click', () => setPromoIndex(i));
    });

    // 리사이즈 시 현재 인덱스로 위치 보정
    window.addEventListener('resize', () => {
      const x = promoSlideWidth() * promoIndex;
      promoViewport.scrollTo({ left: x, behavior: 'instant' });
    });

    // 매장 선택(데모)
    const storeRow = document.getElementById('storeRow');
    const storeName = document.getElementById('storeName');
    const storeTitle = document.getElementById('storeTitle');

    const stores = [
      { name: '강남중앙점', wait: '12분', crowd: '보통' },
      { name: '역삼점', wait: '6분', crowd: '여유' },
      { name: '선릉점', wait: '18분', crowd: '혼잡' },
    ];
    let storeIdx = 0;

    function applyStore(i){
      const s = stores[i];
      storeName.textContent = s.name;
      storeTitle.textContent = s.name;
      document.getElementById('waitTime').textContent = s.wait;
      document.getElementById('crowd').textContent = s.crowd;
    }

    function nextStore(){
      storeIdx = (storeIdx + 1) % stores.length;
      applyStore(storeIdx);
    }

    storeRow.addEventListener('click', nextStore);
    storeRow.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextStore(); }
    });

    // 바로 주문하기(데모)
    const orderNow = document.getElementById('orderNow');
    orderNow.addEventListener('click', ()=> alert('바로 주문하기(연결 예정)'));
    orderNow.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alert('바로 주문하기(연결 예정)'); }
    });

    // 초기 매장 적용
    applyStore(storeIdx);
    
document.querySelectorAll('.btn-group').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.location.href = './order.html';
  });
});


