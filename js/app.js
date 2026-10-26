/* ============================================================
   金陵有迹 — 主交互逻辑
   1. 点击地图标记 → 打开地点详情浮层（含古今对照滑块）
   2. 主题卡片 → 地图高亮对应主题地点（其余变暗）
   3. 探索路线 → 高亮路线地点 + 进度条 + 打卡收集印记
   4. 移动端汉堡菜单
   ============================================================ */

(function () {
  var places = window.PLACES || [];
  var routes = window.ROUTES || [];
  var placeById = {};
  places.forEach(function (p) { placeById[p.id] = p; });

  var currentRouteId = null;
  var currentPlaceId = null;

  function findRoute(id) {
    for (var i = 0; i < routes.length; i++) {
      if (routes[i].id === id) return routes[i];
    }
    return null;
  }

  /* ---------- 打卡记录（存浏览器 localStorage） ---------- */
  var STORAGE_KEY = 'jinling_completed';
  function getCompleted() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveCompleted(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch (e) {}
  }
  function isCompleted(id) {
    return getCompleted().indexOf(id) !== -1;
  }

  /* ---------- 古今对照滑块 ---------- */
  var range = document.getElementById('compareRange');
  var before = document.getElementById('compareBeforeImg');
  var handle = document.getElementById('compareHandle');
  function setSlider(v) {
    if (!before || !handle) return;
    before.style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
    handle.style.left = v + '%';
  }
  if (range) {
    range.addEventListener('input', function () { setSlider(Number(this.value)); });
  }

  /* ---------- 渲染路线卡片 ---------- */
  function renderRoutes() {
    var container = document.getElementById('routeList');
    if (!container) return;
    routes.forEach(function (r) {
      var names = r.places.map(function (id) {
        return placeById[id] ? placeById[id].name : id;
      }).join(' → ');

      var card = document.createElement('button');
      card.className = 'route-card';
      card.type = 'button';
      card.innerHTML =
        '<span class="route-card__tag">' + r.theme + '</span>' +
        '<h3 class="route-card__name">' + r.name + '</h3>' +
        '<p class="route-card__desc">' + r.desc + '</p>' +
        '<p class="route-card__stops">' + names + '</p>' +
        '<span class="route-card__cta">开始探索 →</span>';
      card.addEventListener('click', function () { startRoute(r.id); });
      container.appendChild(card);
    });
  }

  /* ---------- 路线进度条 ---------- */
  function showProgress(route) {
    if (!route) return;
    var completed = route.places.filter(isCompleted).length;
    document.getElementById('rpName').textContent = route.name;
    document.getElementById('rpCount').textContent = '已完成 ' + completed + ' / ' + route.places.length;
    document.getElementById('rpFill').style.width = (completed / route.places.length * 100) + '%';
    document.getElementById('routeProgress').hidden = false;
  }
  function hideProgress() {
    document.getElementById('routeProgress').hidden = true;
  }

  /* ---------- 地图高亮（选中后浮起/高亮，其余变暗） ---------- */
  function highlightPlaces(ids) {
    var set = {};
    ids.forEach(function (id) { set[id] = true; });
    document.querySelectorAll('.marker').forEach(function (m) {
      var on = set[m.getAttribute('data-id')];
      m.classList.toggle('is-lit', !!on);
      m.classList.toggle('is-dimmed', !on);
    });
  }

  function highlightByTheme(theme) {
    currentRouteId = null;
    hideProgress();
    var ids = places.filter(function (p) { return p.theme === theme; }).map(function (p) { return p.id; });
    highlightPlaces(ids);
  }

  /* ---------- 开始路线 ---------- */
  function startRoute(routeId) {
    var route = findRoute(routeId);
    if (!route) return;
    currentRouteId = routeId;
    highlightPlaces(route.places);
    showProgress(route);
    document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------- 打卡 ---------- */
  function checkin() {
    if (!currentPlaceId) return;
    var list = getCompleted();
    if (list.indexOf(currentPlaceId) === -1) list.push(currentPlaceId);
    saveCompleted(list);
    updateCheckinBtn();
    if (currentRouteId) showProgress(findRoute(currentRouteId));
  }
  function updateCheckinBtn() {
    var btn = document.getElementById('dpCheckin');
    var done = currentPlaceId && isCompleted(currentPlaceId);
    btn.textContent = done ? '已打卡 ✓' : '打卡 · 获取印记';
    btn.classList.toggle('is-done', !!done);
  }

  /* ---------- 打开地点详情 ---------- */
  function showPlace(id) {
    var p = placeById[id];
    if (!p) return;
    currentPlaceId = id;

    document.querySelectorAll('.marker').forEach(function (m) {
      m.classList.toggle('is-active', m.getAttribute('data-id') === id);
    });

    var media = document.getElementById('dpMedia');
    media.textContent = p.name;
    media.setAttribute('data-theme', p.theme);

    document.getElementById('dpCategory').textContent = p.theme;
    document.getElementById('dpName').textContent = p.name;
    document.getElementById('dpBrief').textContent = p.brief;
    document.getElementById('dpStory').textContent = p.story;
    document.getElementById('dpFeature').textContent = p.feature;
    document.getElementById('dpChange').textContent = p.change;
    document.getElementById('dpPeople').textContent = p.people;

    if (range) range.value = 50;
    setSlider(50);
    updateCheckinBtn();

    document.getElementById('detailOverlay').hidden = false;
    var scrollBox = document.querySelector('.detail-page__scroll');
    if (scrollBox) scrollBox.scrollTop = 0; /* 每次打开都从顶部开始 */
    document.body.style.overflow = 'hidden';
  }

  /* ---------- 关闭详情 ---------- */
  function closeDetail() {
    document.getElementById('detailOverlay').hidden = true;
    document.body.style.overflow = '';
  }
  var overlay = document.getElementById('detailOverlay');
  document.getElementById('detailClose').addEventListener('click', closeDetail);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeDetail(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !overlay.hidden) closeDetail(); });

  /* ---------- 绑定事件 ---------- */
  document.querySelectorAll('.theme-card').forEach(function (card) {
    card.addEventListener('click', function () {
      highlightByTheme(card.getAttribute('data-theme'));
      document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
    });
  });
  document.getElementById('dpCheckin').addEventListener('click', checkin);

  renderRoutes();

  /* ---------- 主题卡片显示地点数 ---------- */
  document.querySelectorAll('.theme-card').forEach(function (card) {
    var theme = card.getAttribute('data-theme');
    var count = places.filter(function (p) { return p.theme === theme; }).length;
    var countEl = card.querySelector('.theme-card__count');
    if (countEl) countEl.textContent = count + ' 处地点';
  });

  /* ---------- 移动端汉堡菜单 ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  window.showPlace = showPlace;
  window.highlightByTheme = highlightByTheme;
  window.startRoute = startRoute;
})();
