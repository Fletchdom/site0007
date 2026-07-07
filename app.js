const params = new URLSearchParams(location.search);
const page = document.body.dataset.page;
const items = Array.isArray(window.SITE_ITEMS) ? window.SITE_ITEMS : [];

const byHot = (list) => [...list].sort((a, b) => Number(b.hot || 0) - Number(a.hot || 0));
const byScore = (list) => [...list].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
const byYear = (list) => [...list].sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

function escapeAttr(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function img(item, loading = "eager") {
  return `<img src="${escapeAttr(item.poster)}" alt="${escapeAttr(item.title)}" loading="${loading}" decoding="async">`;
}

function watchHref(item) {
  return `./movie.html?id=${encodeURIComponent(item.id)}`;
}

function card(item, wide = false) {
  return `<article class="video-card ${wide ? "wide-card" : ""}">
    <a href="${watchHref(item)}">
      <div class="thumb">${img(item)}<span class="play">▶</span><em>${item.kind}</em></div>
      <div class="video-info">
        <h3>${item.title}</h3>
        <p>${item.originalTitle}</p>
        <div><b>${item.score}</b><span>${item.year}</span><span>${item.genre}</span></div>
      </div>
    </a>
  </article>`;
}

function row(title, note, list, target) {
  const el = document.getElementById(target);
  if (!el) return;
  el.innerHTML = `<div class="row-head"><div><h2>${title}</h2><p>${note}</p></div><a href="./library.html">全部</a></div>
    <div class="video-row">${list.map((item) => card(item)).join("")}</div>`;
}

function mini(item, index) {
  return `<a class="mini-item" href="${watchHref(item)}">
    <span>${String(index + 1).padStart(2, "0")}</span>
    <div>${img(item)}</div>
    <b>${item.title}</b>
    <em>${item.score}</em>
  </a>`;
}

function renderHome() {
  const hot = byHot(items);
  const hero = hot.find((item) => item.kind === "电影") || hot[0];
  const movies = byHot(items.filter((item) => item.kind === "电影")).slice(0, 10);
  const dramas = byHot(items.filter((item) => item.kind === "日剧")).slice(0, 10);
  const anime = byHot(items.filter((item) => item.kind === "动漫电影")).slice(0, 10);
  const docs = byHot(items.filter((item) => item.kind === "综艺纪录")).slice(0, 6);

  document.getElementById("heroMedia").innerHTML = `<a href="${watchHref(hero)}">${img(hero)}<span class="play big">▶</span></a>`;
  document.getElementById("heroText").innerHTML = `
    <p class="kicker">今日主推 · ${hero.kind}</p>
    <h1>${hero.title}</h1>
    <p>${hero.summary}</p>
    <div class="hero-meta"><span>${hero.score} 分</span><span>${hero.year}</span><span>${hero.genre}</span></div>
    <a class="primary-btn" href="${watchHref(hero)}">立即查看</a>`;
  document.getElementById("quickList").innerHTML = `${hot.slice(1, 6).map(mini).join("")}
    <div class="quick-divider"></div>
    <div class="quick-focus">
      <p class="kicker">今日看点</p>
      <a href="./library.html?kind=${encodeURIComponent("电影")}"><b>日本电影</b><span>${movies.length} 部精选</span></a>
      <a href="./library.html?kind=${encodeURIComponent("日剧")}"><b>热门日剧</b><span>${dramas.length} 部追看</span></a>
      <a href="./library.html?sort=score"><b>高分片单</b><span>按评分浏览</span></a>
    </div>
    <div class="quick-tags">
      <a href="./library.html?sort=year">新片新剧</a>
      <a href="./library.html?kind=${encodeURIComponent("动漫电影")}">动漫电影</a>
      <a href="./library.html?q=${encodeURIComponent("家庭")}">家庭题材</a>
      <a href="./library.html?q=${encodeURIComponent("悬疑")}">悬疑推理</a>
    </div>`;
  document.getElementById("homeRail").innerHTML = hot.slice(0, 36).map((item, index) => card(item, index < 2)).join("");
  row("日本电影", "经典日影、院线佳作和高分剧情片", movies, "movieRow");
  row("热门日剧", "悬疑、都市、美食、家庭题材一站浏览", dramas, "dramaRow");
  row("动漫电影", "剧场版动画与日系幻想作品", anime, "animeRow");
  row("综艺纪录", "旅行、美食、文化与人物纪实", docs.length ? docs : byScore(items).slice(0, 6), "docRow");
}

function filteredList() {
  const kind = params.get("kind") || "全部";
  const keyword = (params.get("q") || "").trim().toLowerCase();
  const sort = params.get("sort") || document.getElementById("sortSelect")?.value || "hot";
  let list = [...items];
  if (kind !== "全部") list = list.filter((item) => item.kind === kind);
  if (keyword) {
    list = list.filter((item) => `${item.title} ${item.originalTitle} ${item.kind} ${item.genre} ${item.summary}`.toLowerCase().includes(keyword));
  }
  if (sort === "score") list = byScore(list);
  else if (sort === "year") list = byYear(list);
  else list = byHot(list);
  return { list, kind, keyword };
}

function renderLibrary() {
  document.querySelectorAll("[data-kind]").forEach((button) => {
    button.onclick = () => {
      const next = new URLSearchParams(location.search);
      const kind = button.dataset.kind;
      if (kind === "全部") next.delete("kind");
      else next.set("kind", kind);
      location.href = `./library.html${next.toString() ? `?${next}` : ""}`;
    };
  });
  const search = document.getElementById("searchInput");
  search.value = params.get("q") || "";
  document.getElementById("searchForm").onsubmit = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(location.search);
    const value = search.value.trim();
    if (value) next.set("q", value);
    else next.delete("q");
    location.href = `./library.html${next.toString() ? `?${next}` : ""}`;
  };
  const select = document.getElementById("sortSelect");
  select.value = params.get("sort") || "hot";
  select.onchange = () => {
    const next = new URLSearchParams(location.search);
    next.set("sort", select.value);
    location.href = `./library.html?${next}`;
  };
  const { list, kind, keyword } = filteredList();
  document.getElementById("libraryTitle").textContent = keyword ? `搜索：${keyword}` : kind === "全部" ? "全部视频" : kind;
  document.getElementById("resultCount").textContent = `${list.length} 部`;
  document.getElementById("libraryGrid").innerHTML = list.map(card).join("");
}

function renderDetail() {
  const item = items.find((entry) => entry.id === params.get("id")) || items[0];
  document.title = `${item.title}-日本电影高清在线观看资料`;
  document.querySelector("meta[name='description']").setAttribute("content", item.summary);
  document.getElementById("detailRoot").innerHTML = `
    <div class="watch-frame">${img(item)}<span class="play big">▶</span></div>
    <aside class="watch-info">
      <p class="kicker">${item.kind} · ${item.genre}</p>
      <h1>${item.title}</h1>
      <p class="origin">${item.originalTitle}</p>
      <div class="hero-meta"><span>${item.score} 分</span><span>${item.year}</span><span>${item.genre}</span></div>
      <p>${item.summary}</p>
      <a class="primary-btn" href="./library.html?kind=${encodeURIComponent(item.kind)}">同类推荐</a>
    </aside>`;
  const related = byHot(items.filter((entry) => entry.id !== item.id && (entry.kind === item.kind || entry.genre === item.genre))).slice(0, 12);
  document.getElementById("relatedGrid").innerHTML = related.map(card).join("");
}

function markBrokenImages() {
  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => image.closest(".video-card,.mini-item,.watch-frame,.hero-media")?.classList.add("image-missing"), { once: true });
  });
}

if (items.length) {
  if (page === "home") renderHome();
  if (page === "library") renderLibrary();
  if (page === "detail") renderDetail();
  markBrokenImages();
}
