/**********************
 * 1) 설정
 **********************/
const API_BASE = "https://apis.data.go.kr/6260000/FoodService";
const SERVICE_KEY = "1e6ef0543aaf7d4b206257b3ddefaeda53c8430d5ab4b8c224af6db8cc6ba353";

// 공공데이터 API는 출력 포맷/파라미터 이름이 종종 바뀝니다.
// 이 프로젝트는 안전하게 XML/JSON 둘 다 대응 가능한 파서를 넣었습니다.
// (실서비스 적용 시, 실제 응답 스키마를 확인해 아래 FIELD_MAP을 조정하세요.)
const FIELD_MAP = {
  title: ["MAIN_TITLE", "title", "name", "restaurantName"],
  addr: ["ADDR1", "address", "addr", "ROAD_ADDR"],
  tel: ["CNTCT_TEL", "tel", "phone"],
  usageTime: ["USAGE_DAY_WEEK_AND_TIME", "usageTime", "openHours"],
  menu: ["RPRSNTV_MENU", "menu", "representativeMenu"],
  desc: ["ITEMCNTNTS", "description", "desc", "content"],
  lat: ["LAT", "lat", "WGS84_LAT"],
  lng: ["LNG", "lon", "lng", "WGS84_LON"],
  img: ["MAIN_IMG_NORMAL", "img", "image", "imageUrl"],
  homepage: ["HOMEPAGE_URL", "homepage", "url"],
};

// 기본 대체 이미지 (운영 시에는 로컬/자체 CDN 권장)
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1600&q=70";

/**********************
 * 2) 상태
 **********************/
const state = {
  items: [],
  filtered: [],
  selected: null,
  favorites: new Set(JSON.parse(localStorage.getItem("busan_food_favs") || "[]")),
  map: null,
  marker: null,
};

/**********************
 * 3) 유틸
 **********************/
const $ = (sel) => document.querySelector(sel);

function pick(obj, candidates) {
  for (const key of candidates) {
    if (obj && obj[key] != null && String(obj[key]).trim() !== "") return obj[key];
  }
  return "";
}

function normalizeMenu(menuStr) {
  if (!menuStr) return [];
  return String(menuStr)
    .split(/[,/\n]/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function safeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toItem(raw, idx) {
  return {
    id: raw?.UC_SEQ ?? raw?.id ?? String(idx),
    title: pick(raw, FIELD_MAP.title) || "(이름 없음)",
    addr: pick(raw, FIELD_MAP.addr) || "(주소 정보 없음)",
    tel: pick(raw, FIELD_MAP.tel) || "(전화 정보 없음)",
    usageTime: pick(raw, FIELD_MAP.usageTime) || "(운영시간 정보 없음)",
    menuRaw: pick(raw, FIELD_MAP.menu) || "",
    menus: normalizeMenu(pick(raw, FIELD_MAP.menu)),
    desc: pick(raw, FIELD_MAP.desc) || "(소개 정보 없음)",
    lat: safeNumber(pick(raw, FIELD_MAP.lat)),
    lng: safeNumber(pick(raw, FIELD_MAP.lng)),
    img: pick(raw, FIELD_MAP.img) || "",
    homepage: pick(raw, FIELD_MAP.homepage) || "",
    _raw: raw,
  };
}

function saveFavorites() {
  localStorage.setItem("busan_food_favs", JSON.stringify(Array.from(state.favorites)));
}

function isFav(id) {
  return state.favorites.has(String(id));
}

function toggleFav(id) {
  const key = String(id);
  if (state.favorites.has(key)) state.favorites.delete(key);
  else state.favorites.add(key);
  saveFavorites();
  renderList();
  renderDetail();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**********************
 * 4) API 호출
 **********************/
async function fetchFoodList() {
  // FoodService는 여러 엔드포인트가 존재할 수 있습니다.
  // 아래는 후보를 돌려보고 성공하는 것을 쓰는 방식입니다.
  const endpointCandidates = ["getFoodKr", "getFood", "getFoodService"];

  const commonParams = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    pageNo: "1",
    numOfRows: "50",
    resultType: "json",
  });

  let lastError = null;

  for (const ep of endpointCandidates) {
    const url = `${API_BASE}/${ep}?${commonParams.toString()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const text = await res.text();
      const data = tryParseJson(text) ?? tryParseXmlToJson(text);
      if (!data) throw new Error("응답 파싱 실패(지원되지 않는 포맷)");

      const items = extractItems(data);
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("아이템 배열을 찾지 못했습니다(스키마 확인 필요)");
      }
      return items;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error("API 호출 실패");
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function tryParseXmlToJson(xmlText) {
  try {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "text/xml");
    if (xml.querySelector("parsererror")) return null;

    const obj = {};
    xmlToJson(xml.documentElement, obj);
    return obj;
  } catch {
    return null;
  }
}

function xmlToJson(node, out) {
  const children = Array.from(node.children || []);
  if (children.length === 0) {
    out[node.nodeName] = node.textContent;
    return;
  }

  const map = {};
  for (const child of children) {
    map[child.nodeName] = map[child.nodeName] || [];
    const childObj = {};
    xmlToJson(child, childObj);
    map[child.nodeName].push(childObj[child.nodeName] ?? childObj);
  }

  out[node.nodeName] = map;
}

function extractItems(data) {
  const candidates = [
    data?.getFoodKr?.item,
    data?.getFood?.item,
    data?.response?.body?.items?.item,
    data?.items?.item,
    data?.item,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }

  const flat = deepFindArray(data, ["item"]);
  if (flat) return flat;

  return [];
}

function deepFindArray(obj, keys) {
  if (!obj || typeof obj !== "object") return null;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (keys.includes(k) && Array.isArray(v)) return v;
    const found = deepFindArray(v, keys);
    if (found) return found;
  }
  return null;
}

/**********************
 * 5) 렌더링
 **********************/
function renderSkeleton() {
  $("#heroImg").src = FALLBACK_IMG;

  $("#detailPanel").innerHTML = `
    <div class="section-title">불러오는 중…</div>
    <div class="kv-row"><span class="tag">상호명</span><div class="val skeleton" style="height:18px;border-radius:10px;"></div></div>
    <div class="kv-row"><span class="tag">주소</span><div class="val skeleton" style="height:18px;border-radius:10px;"></div></div>
    <div class="kv-row"><span class="tag">소개</span><div class="val skeleton" style="height:72px;border-radius:14px;"></div></div>
    <div class="kv-row"><span class="tag">대표메뉴</span><div class="val skeleton" style="height:36px;border-radius:14px;"></div></div>
    <div class="kv-row"><span class="tag">문의</span><div class="val skeleton" style="height:18px;border-radius:10px;"></div></div>
    <div class="kv-row"><span class="tag">운영시간</span><div class="val skeleton" style="height:18px;border-radius:10px;"></div></div>
  `;

  $("#listView").innerHTML = Array.from({ length: 6 })
    .map(
      () => `
      <div class="list-item">
        <div>
          <div class="skeleton" style="height:16px;width:55%;border-radius:10px;margin-bottom:10px"></div>
          <div class="skeleton" style="height:12px;width:80%;border-radius:10px;margin-bottom:8px"></div>
          <div class="skeleton" style="height:12px;width:65%;border-radius:10px"></div>
        </div>
        <div class="li-actions">
          <div class="icon-btn skeleton" style="width:34px;height:34px"></div>
          <div class="icon-btn skeleton" style="width:34px;height:34px"></div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderList() {
  const listEl = $("#listView");
  const items = state.filtered;

  if (!items.length) {
    listEl.innerHTML = `
      <div class="list-item" style="cursor:default">
        <div>
          <p class="li-title">검색 결과가 없습니다</p>
          <p class="li-meta">다른 키워드로 검색해 보세요.</p>
        </div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = items
    .map((it) => {
      const menuPreview = it.menus.slice(0, 2).join(", ") || "대표메뉴 정보 없음";
      const fav = isFav(it.id);

      return `
        <div class="list-item" data-id="${escapeHtml(it.id)}">
          <div>
            <p class="li-title">${escapeHtml(it.title)}</p>
            <p class="li-meta">주소: ${escapeHtml(it.addr)}</p>
            <p class="li-meta">메뉴: ${escapeHtml(menuPreview)}</p>
          </div>
          <div class="li-actions">
            <div class="icon-btn" data-action="open" title="상세보기">🔍</div>
            <div class="icon-btn" data-action="fav" title="즐겨찾기">${fav ? "❤️" : "🤍"}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderDetail() {
  const it = state.selected;
  if (!it) return;

  $("#heroImg").src = it.img || FALLBACK_IMG;
  $("#heroImg").alt = `${it.title} 이미지`;

  const fav = isFav(it.id);
  $("#favBtn").innerHTML = fav
    ? "<span style='font-size:18px'>❤️</span>"
    : `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 21s-7-4.6-9.5-8.5C0 9 2 5.8 5.7 5.2c2-.3 3.6.6 4.5 1.8.9-1.2 2.5-2.1 4.5-1.8C18.4 5.8 20.4 9 21.5 12.5 19 16.4 12 21 12 21z" stroke="rgba(255,255,255,.92)" stroke-width="1.6"/>
      </svg>
    `;

  const menuChips = it.menus.length
    ? `<div class="menu-chips">${it.menus.map((m) => `<span class="chip">${escapeHtml(m)}</span>`).join("")}</div>`
    : `<div class="val muted">(대표메뉴 정보 없음)</div>`;

  const homepage =
    it.homepage && it.homepage.startsWith("http")
      ? `<a class="chip" href="${escapeHtml(it.homepage)}" target="_blank" rel="noreferrer">공식/홈페이지</a>`
      : "";

  $("#detailPanel").innerHTML = `
    <div class="kv-row"><span class="tag">상호명</span><div class="val">${escapeHtml(it.title)}</div></div>
    <div class="kv-row"><span class="tag">주소</span><div class="val">${escapeHtml(it.addr)}</div></div>
    <div class="kv-row"><span class="tag">소개</span><div class="val">${escapeHtml(it.desc)}</div></div>
    <div class="kv-row"><span class="tag">대표메뉴</span><div>${menuChips}</div></div>
    <div class="kv-row"><span class="tag">문의</span><div class="val">${escapeHtml(it.tel)}</div></div>
    <div class="kv-row"><span class="tag">운영시간</span><div class="val">${escapeHtml(it.usageTime)}</div></div>
    ${homepage ? `<div class="section-title">링크</div><div class="menu-chips">${homepage}</div>` : ""}
    <button class="btn" id="copyAddrBtn" type="button">주소 복사</button>
  `;

  updateMap(it);

  const copyBtn = $("#copyAddrBtn");
  copyBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(it.addr);
      copyBtn.textContent = "복사 완료 ✓";
      setTimeout(() => (copyBtn.textContent = "주소 복사"), 900);
    } catch {
      alert("복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
    }
  });
}

/**********************
 * 6) 카카오맵
 **********************/
function ensureKakaoLoaded() {
  return new Promise((resolve, reject) => {
    if (!window.kakao || !window.kakao.maps) {
      reject(new Error("카카오맵 SDK가 로드되지 않았습니다. appkey를 확인하세요."));
      return;
    }
    window.kakao.maps.load(() => resolve());
  });
}

async function initMap() {
  try {
    await ensureKakaoLoaded();
    $("#kakaoNotice").classList.add("hidden");

    const center = new kakao.maps.LatLng(35.1796, 129.0756); // 부산 기본
    state.map = new kakao.maps.Map($("#map"), { center, level: 6 });

    state.marker = new kakao.maps.Marker({ position: center });
    state.marker.setMap(state.map);
  } catch (err) {
    console.warn(err);
  }
}

function updateMap(item) {
  if (!state.map || !window.kakao?.maps) return;
  const { lat, lng } = item;
  if (lat == null || lng == null) return;

  const pos = new kakao.maps.LatLng(lat, lng);
  state.map.setCenter(pos);
  state.marker.setPosition(pos);
}

/**********************
 * 7) 이벤트/검색
 **********************/
function applyFilter(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    state.filtered = [...state.items];
  } else {
    state.filtered = state.items.filter((it) => {
      return (
        it.title.toLowerCase().includes(q) ||
        it.addr.toLowerCase().includes(q) ||
        it.menuRaw.toLowerCase().includes(q)
      );
    });
  }
  renderList();

  if (state.selected && !state.filtered.some((it) => it.id === state.selected.id)) {
    state.selected = state.filtered[0] || null;
    if (state.selected) renderDetail();
  }
}

function bindUI() {
  $("#listView").addEventListener("click", (e) => {
    const itemEl = e.target.closest(".list-item");
    if (!itemEl) return;

    const id = itemEl.getAttribute("data-id");
    const action = e.target?.getAttribute?.("data-action");

    if (action === "fav") {
      toggleFav(id);
      return;
    }
    selectById(id);
  });

  $("#favBtn").addEventListener("click", () => {
    if (!state.selected) return;
    toggleFav(state.selected.id);
  });

  const qEl = $("#q");
  qEl.addEventListener("input", () => applyFilter(qEl.value));

  $("#refreshBtn").addEventListener("click", () => bootstrap());

  $("#goHome").addEventListener("click", () => {
    $("#q").value = "";
    applyFilter("");
    if (state.filtered[0]) selectById(state.filtered[0].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function selectById(id) {
  const it = state.items.find((x) => String(x.id) === String(id));
  if (!it) return;
  state.selected = it;
  renderDetail();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**********************
 * 8) 초기화
 **********************/
async function bootstrap() {
  renderSkeleton();

  try {
    const rawItems = await fetchFoodList();
    state.items = rawItems.map(toItem);
    state.filtered = [...state.items];

    state.selected = state.items[0] || null;

    renderList();
    if (state.selected) renderDetail();

    await initMap();
    if (state.selected) updateMap(state.selected);
  } catch (err) {
    console.error(err);
    $("#detailPanel").innerHTML = `
      <div class="section-title">데이터 로드 실패</div>
      <div class="val muted">공공데이터 API 호출/파싱에 실패했습니다.</div>
      <div class="val muted" style="margin-top:8px">
        <b>확인 포인트</b><br/>
        1) FoodService 엔드포인트(getFoodKr 등)가 실제로 맞는지<br/>
        2) resultType / numOfRows / pageNo 등 파라미터가 맞는지<br/>
        3) 브라우저 CORS 정책으로 차단되는지(개발 시 로컬 프록시 필요할 수 있음)
      </div>
      <button class="btn" id="retryBtn" type="button">다시 시도</button>
    `;
    $("#listView").innerHTML = `
      <div class="list-item" style="cursor:default">
        <div>
          <p class="li-title">목록을 불러올 수 없습니다</p>
          <p class="li-meta">개발자 도구 콘솔에서 오류를 확인해 주세요.</p>
        </div>
      </div>
    `;
    $("#retryBtn")?.addEventListener("click", () => bootstrap());
  }
}

// 실행
bindUI();
bootstrap();
