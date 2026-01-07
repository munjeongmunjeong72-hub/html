// ============================
// ✅ 사용자 제공 정보
// ============================
const API_BASE = "https://apis.data.go.kr/1360000/MidFcstInfoService";
const SERVICE_KEY = "1e6ef0543aaf7d4b206257b3ddefaeda53c8430d5ab4b8c224af6db8cc6ba353";

// ============================
// ✅ 지역 데이터 (검색용)
// - label: 사용자가 보는 이름
// - landRegId: 중기육상예보 regId
// - taRegId: 중기기온예보 regId
// ============================
const REGIONS = [
  { label: "서울·인천·경기", landRegId: "11B00000", taRegId: "11B10101", hint: "서울/인천/경기" },
  { label: "강원영서", landRegId: "11D10000", taRegId: "11D10301", hint: "춘천/원주" },
  { label: "강원영동", landRegId: "11D20000", taRegId: "11D20501", hint: "강릉/속초" },
  { label: "대전·세종·충남", landRegId: "11C20000", taRegId: "11C20401", hint: "대전/세종/천안" },
  { label: "충북", landRegId: "11C10000", taRegId: "11C10301", hint: "청주/충주" },
  { label: "광주·전남", landRegId: "11F20000", taRegId: "11F20401", hint: "광주/목포/여수" },
  { label: "전북", landRegId: "11F10000", taRegId: "11F10201", hint: "전주/군산" },
  { label: "대구·경북", landRegId: "11H10000", taRegId: "11H10701", hint: "대구/포항/경주" },
  { label: "부산·울산·경남", landRegId: "11H20000", taRegId: "11H20201", hint: "부산/울산/창원" },
  { label: "제주", landRegId: "11G00000", taRegId: "11G00201", hint: "제주/서귀포" },
];

// ============================
// ✅ DOM
// ============================
const elSearch = document.getElementById("regionSearch");
const elSuggestions = document.getElementById("suggestions");
const elBtnLoad = document.getElementById("btnLoad");
const elLoading = document.getElementById("loading");
const elError = document.getElementById("error");
const elGrid = document.getElementById("grid");
const elMeta = document.getElementById("meta");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

let selectedRegion = REGIONS[0]; // 기본 지역

// ============================
// ✅ 유틸
// ============================
function setLoading(isLoading) {
  elLoading.style.display = isLoading ? "block" : "none";
  elBtnLoad.disabled = isLoading;
}

function setError(msg) {
  if (!msg) {
    elError.style.display = "none";
    elError.textContent = "";
    return;
  }
  elError.style.display = "block";
  elError.textContent = msg;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function dowK(date) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return days[date.getDay()];
}

function formatDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 중기예보 기준시각(tmFc) 자동 계산
function getLatestTmFc() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = pad2(now.getMonth() + 1);
  const dd = pad2(now.getDate());
  const hour = now.getHours();

  if (hour >= 18) return `${yyyy}${mm}${dd}1800`;
  if (hour >= 6) return `${yyyy}${mm}${dd}0600`;

  // 전날 18시
  const prev = new Date(now);
  prev.setDate(now.getDate() - 1);
  const pyyyy = prev.getFullYear();
  const pmm = pad2(prev.getMonth() + 1);
  const pdd = pad2(prev.getDate());
  return `${pyyyy}${pmm}${pdd}1800`;
}

function iconForWeather(text) {
  if (!text) return "🌤️";
  const t = text.trim();
  if (t.includes("맑")) return "☀️";
  if (t.includes("구름") && t.includes("많")) return "⛅";
  if (t.includes("구름")) return "🌤️";
  if (t.includes("흐")) return "☁️";
  if (t.includes("비") && t.includes("눈")) return "🌨️";
  if (t.includes("눈")) return "❄️";
  if (t.includes("비")) return "🌧️";
  if (t.includes("소나기")) return "🌦️";
  return "🌤️";
}

function isRainy(text) {
  if (!text) return false;
  const t = text.trim();
  return t.includes("비") || t.includes("소나기") || t.includes("눈");
}

// ============================
// ✅ API
// ============================
async function fetchMidLandFcst(regId, tmFc) {
  const url = new URL(`${API_BASE}/getMidLandFcst`);
  url.searchParams.set("serviceKey", SERVICE_KEY);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "10");
  url.searchParams.set("dataType", "JSON");
  url.searchParams.set("regId", regId);
  url.searchParams.set("tmFc", tmFc);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`중기육상예보 호출 실패 (HTTP ${res.status})`);
  const json = await res.json();

  const item = json?.response?.body?.items?.item?.[0];
  if (!item) throw new Error("중기육상예보 데이터가 없습니다. (regId/tmFc 확인 필요)");
  return item;
}

async function fetchMidTa(regId, tmFc) {
  const url = new URL(`${API_BASE}/getMidTa`);
  url.searchParams.set("serviceKey", SERVICE_KEY);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "10");
  url.searchParams.set("dataType", "JSON");
  url.searchParams.set("regId", regId);
  url.searchParams.set("tmFc", tmFc);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`중기기온예보 호출 실패 (HTTP ${res.status})`);
  const json = await res.json();

  const item = json?.response?.body?.items?.item?.[0];
  if (!item) throw new Error("중기기온예보 데이터가 없습니다. (regId/tmFc 확인 필요)");
  return item;
}

// 3~9일(7일치) 구성
function build7Days(landItem, taItem) {
  const today = new Date();
  const days = [];

  for (let offset = 3; offset <= 9; offset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    const dayKey = String(offset);
    const minKey = `taMin${dayKey}`;
    const maxKey = `taMax${dayKey}`;

    const isAfter7 = offset >= 8;

    let wfText = "";
    let rnProb = 0;

    if (!isAfter7) {
      const wfAm = landItem[`wf${dayKey}Am`];
      const wfPm = landItem[`wf${dayKey}Pm`];
      wfText = wfPm || wfAm || "";

      const rnAm = landItem[`rnSt${dayKey}Am`];
      const rnPm = landItem[`rnSt${dayKey}Pm`];
      if (rnAm != null && rnPm != null) rnProb = Math.round((Number(rnAm) + Number(rnPm)) / 2);
      else rnProb = Number(rnPm ?? rnAm ?? 0);
    } else {
      // wf8/rnSt8 형태 대응
      wfText = landItem[`wf${dayKey}`] || landItem[`wf${dayKey}Pm`] || landItem[`wf${dayKey}Am`] || "";
      rnProb = Number(landItem[`rnSt${dayKey}`] ?? landItem[`rnSt${dayKey}Pm`] ?? landItem[`rnSt${dayKey}Am`] ?? 0);
    }

    const tMin = taItem[minKey];
    const tMax = taItem[maxKey];

    days.push({
      date,
      wfText,
      rnProb,
      tMin: (tMin == null ? null : Number(tMin)),
      tMax: (tMax == null ? null : Number(tMax)),
    });
  }

  return days;
}

// ============================
// ✅ 카드 렌더
// ============================
function renderCards(days) {
  elGrid.innerHTML = "";

  days.forEach(d => {
    const rainy = isRainy(d.wfText);
    const icon = iconForWeather(d.wfText);

    const rainText = rainy
      ? "강수량(mm): 중기예보에서는 제공이 제한적이에요"
      : "강수량(mm): -";

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="rowTop">
        <div class="date">${formatDate(d.date)}</div>
        <div class="dow">${dowK(d.date)}요일</div>
      </div>

      <div class="rowWeather">
        <div class="icon">${icon}</div>
        <div class="desc">${d.wfText || "정보 없음"}</div>
      </div>

      <div class="pill">☔ 강수확률 ${Number.isFinite(d.rnProb) ? d.rnProb : 0}%</div>

      <div class="temps">
        <div class="tempBox">
          <div class="tempLabel">최저</div>
          <div class="tempValue">${d.tMin == null ? "-" : `${d.tMin}°`}</div>
        </div>
        <div class="tempBox">
          <div class="tempLabel">최고</div>
          <div class="tempValue">${d.tMax == null ? "-" : `${d.tMax}°`}</div>
        </div>
      </div>

      <div class="rain">
        ${rainy ? "🌧️ 비/눈 예보가 있어요<br/>" : ""}
        ${rainText}
      </div>
    `;
    elGrid.appendChild(card);
  });
}

// ============================
// ✅ Canvas 그래프 (최저/최고 라인 + 강수확률 바)
// ============================
function drawChart(days) {
  // 캔버스 선명도(레티나) 처리
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth;
  const cssH = canvas.clientHeight;
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const W = cssW;
  const H = cssH;

  // 레이아웃
  const pad = { left: 46, right: 20, top: 24, bottom: 46 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  ctx.clearRect(0, 0, W, H);

  // 데이터 범위(기온)
  const mins = days.map(d => d.tMin).filter(v => Number.isFinite(v));
  const maxs = days.map(d => d.tMax).filter(v => Number.isFinite(v));
  const allTemps = [...mins, ...maxs];

  // 데이터가 없을 때
  if (allTemps.length === 0) {
    ctx.font = "700 14px system-ui";
    ctx.fillStyle = "#64748b";
    ctx.fillText("그래프를 그릴 수 있는 기온 데이터가 없습니다.", 18, 28);
    return;
  }

  let tMin = Math.min(...allTemps);
  let tMax = Math.max(...allTemps);

  // 여유 범위
  tMin -= 2;
  tMax += 2;

  const yTemp = (temp) => {
    const ratio = (temp - tMin) / (tMax - tMin);
    return pad.top + (1 - ratio) * plotH;
  };

  const xAt = (i) => pad.left + (i * plotW) / (days.length - 1);

  // 배경 가이드(격자)
  ctx.strokeStyle = "rgba(226,232,240,0.9)";
  ctx.lineWidth = 1;

  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const y = pad.top + (i * plotH) / gridLines;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    // y축 라벨(기온)
    const tempLabel = Math.round(tMax - (i * (tMax - tMin)) / gridLines);
    ctx.fillStyle = "#64748b";
    ctx.font = "800 11px system-ui";
    ctx.fillText(`${tempLabel}°`, 10, y + 4);
  }

  // x축 라벨
  ctx.fillStyle = "#64748b";
  ctx.font = "900 11px system-ui";
  days.forEach((d, i) => {
    const x = xAt(i);
    const label = formatDate(d.date);
    ctx.fillText(label, x - 12, H - 18);
  });

  // 강수확률 바 (보조)
  // - plot 하단에서 위로 올라오게, max 100%
  const barBaseY = pad.top + plotH;
  const barMaxH = plotH * 0.45; // 너무 크게 가리지 않게
  days.forEach((d, i) => {
    const prob = Number.isFinite(d.rnProb) ? d.rnProb : 0;
    const barH = (prob / 100) * barMaxH;
    const x = xAt(i);
    const barW = Math.max(10, plotW / (days.length * 2.4));

    ctx.fillStyle = "rgba(37,99,235,0.16)";
    ctx.strokeStyle = "rgba(37,99,235,0.22)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.roundRect(x - barW / 2, barBaseY - barH, barW, barH, 8);
    ctx.fill();
    ctx.stroke();
  });

  // 라인 그리기 함수
  function drawLine(values, strokeStyle, fillStyle) {
    const pts = values.map((v, i) => ({
      x: xAt(i),
      y: yTemp(v),
      v
    }));

    // 라인
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    pts.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // 점
    pts.forEach(p => {
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // 값 라벨
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 11px system-ui";
      ctx.fillText(`${p.v}°`, p.x - 10, p.y - 10);
    });
  }

  // 값 배열
  const minTemps = days.map(d => (Number.isFinite(d.tMin) ? d.tMin : allTemps[0]));
  const maxTemps = days.map(d => (Number.isFinite(d.tMax) ? d.tMax : allTemps[0]));

  // 색상은 CSS 테마의 블루 계열 톤(하드코딩이지만 테마 일관)
  drawLine(minTemps, "#60a5fa", "#60a5fa"); // 최저
  drawLine(maxTemps, "#2563eb", "#2563eb"); // 최고

  // 우측 상단: 강수확률 max 표시
  const maxProb = Math.max(...days.map(d => Number.isFinite(d.rnProb) ? d.rnProb : 0));
  ctx.fillStyle = "#64748b";
  ctx.font = "900 12px system-ui";
  ctx.fillText(`강수확률 최대: ${maxProb}%`, W - pad.right - 140, pad.top - 8);
}

// roundRect polyfill (일부 브라우저 대응)
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    const radius = typeof r === "number" ? { tl: r, tr: r, br: r, bl: r } : r;
    this.beginPath();
    this.moveTo(x + radius.tl, y);
    this.lineTo(x + w - radius.tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + radius.tr);
    this.lineTo(x + w, y + h - radius.br);
    this.quadraticCurveTo(x + w, y + h, x + w - radius.br, y + h);
    this.lineTo(x + radius.bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - radius.bl);
    this.lineTo(x, y + radius.tl);
    this.quadraticCurveTo(x, y, x + radius.tl, y);
    this.closePath();
    return this;
  };
}

// ============================
// ✅ 지역 검색 UI
// ============================
function normalize(str) {
  return (str || "").toLowerCase().replace(/\s+/g, "");
}

function showSuggestions(list) {
  if (!list.length) {
    elSuggestions.style.display = "none";
    elSuggestions.innerHTML = "";
    return;
  }

  elSuggestions.innerHTML = "";
  list.slice(0, 8).forEach(r => {
    const item = document.createElement("div");
    item.className = "suggestionItem";
    item.innerHTML = `
      <div>
        <div><strong>${r.label}</strong></div>
        <div class="suggestionSmall">${r.hint}</div>
      </div>
      <div class="suggestionSmall">${r.landRegId}</div>
    `;
    item.addEventListener("click", () => {
      selectedRegion = r;
      elSearch.value = r.label;
      showSuggestions([]);
      loadWeather();
    });
    elSuggestions.appendChild(item);
  });

  elSuggestions.style.display = "block";
}

function onSearchInput() {
  const q = normalize(elSearch.value);
  if (!q) {
    showSuggestions([]);
    return;
  }

  const filtered = REGIONS.filter(r => {
    const target = normalize(`${r.label} ${r.hint}`);
    return target.includes(q);
  });

  showSuggestions(filtered);
}

// suggestions 영역 밖 클릭 시 닫기
document.addEventListener("click", (e) => {
  const isInside = elSuggestions.contains(e.target) || elSearch.contains(e.target);
  if (!isInside) showSuggestions([]);
});

// 엔터로 첫 번째 추천 선택
elSearch.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const q = normalize(elSearch.value);
    const filtered = REGIONS.filter(r => normalize(`${r.label} ${r.hint}`).includes(q));
    if (filtered.length) {
      selectedRegion = filtered[0];
      elSearch.value = selectedRegion.label;
      showSuggestions([]);
      loadWeather();
    }
  }
});

elSearch.addEventListener("input", onSearchInput);

// ============================
// ✅ 메인 로딩
// ============================
async function loadWeather() {
  setError("");
  setLoading(true);

  try {
    const tmFc = getLatestTmFc();

    const [landItem, taItem] = await Promise.all([
      fetchMidLandFcst(selectedRegion.landRegId, tmFc),
      fetchMidTa(selectedRegion.taRegId, tmFc),
    ]);

    const days = build7Days(landItem, taItem);

    elMeta.textContent =
      `${selectedRegion.label} · 기준 발표시각 ${tmFc} · 3~9일(7일치) 표시`;

    renderCards(days);
    drawChart(days);

  } catch (err) {
    setError(
      `불러오기 실패: ${err.message}\n\n` +
      `가능한 원인:\n` +
      `1) 브라우저 CORS 차단\n` +
      `2) 서비스키/요청 파라미터(regId, tmFc) 오류\n` +
      `3) 해당 발표시각 데이터 미생성\n\n` +
      `해결 팁: VSCode Live Server 또는 로컬 서버로 실행하고, Network 탭에서 응답을 확인해보세요.`
    );
  } finally {
    setLoading(false);
  }
}

elBtnLoad.addEventListener("click", () => {
  // 검색창에 사용자가 다른 텍스트를 넣었을 수 있으니, 가장 가까운 매칭으로 선택
  const q = normalize(elSearch.value);
  if (q) {
    const filtered = REGIONS.filter(r => normalize(`${r.label} ${r.hint}`).includes(q));
    if (filtered.length) selectedRegion = filtered[0];
  }
  loadWeather();
});

// 그래프 리사이즈 대응
window.addEventListener("resize", () => {
  // 카드/데이터가 이미 렌더된 상태면 다시 그리기 위해
  // meta가 비어 있지 않으면 마지막 결과가 있다고 보고 redraw 시도
  if (elMeta.textContent.trim()) {
    // grid에서 데이터를 다시 계산할 수 없으니, 마지막 데이터를 저장해두는게 정석.
    // 여기서는 간단히: 다시 load 하지 않고도 그려야 하므로 캐싱을 둔다.
    // => 아래에서 캐시 적용
  }
});

// 간단 캐시(리사이즈용)
let lastDaysCache = null;

// drawChart 호출 시 캐시에 저장하도록 수정
const _drawChart = drawChart;
drawChart = function(days){
  lastDaysCache = days;
  _drawChart(days);
};

// resize 시 캐시로 redraw
window.addEventListener("resize", () => {
  if (lastDaysCache) drawChart(lastDaysCache);
});

// 초기값 세팅
elSearch.value = selectedRegion.label;
loadWeather();



