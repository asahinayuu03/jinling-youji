/* ============================================================
   金陵有迹 — 主交互逻辑
   点击地图标记 → 高亮标记 + 更新右侧详情卡片
   ============================================================ */

(function () {
  var places = window.PLACES || [];
  var placeById = {};
  places.forEach(function (p) { placeById[p.id] = p; });

  function showPlace(id) {
    var p = placeById[id];
    if (!p) return;

    // 高亮当前标记，取消其它标记的高亮
    var markers = document.querySelectorAll('.marker');
    markers.forEach(function (m) {
      m.classList.toggle('is-active', m.getAttribute('data-id') === id);
    });

    // 隐藏「请选择」空态，显示详情卡片
    document.getElementById('detailEmpty').hidden = true;
    document.getElementById('detailCard').hidden = false;

    // 填充卡片内容
    var media = document.getElementById('detailMedia');
    media.textContent = p.name;
    media.setAttribute('data-category', p.category);

    document.getElementById('detailCategory').textContent = p.category;
    document.getElementById('detailName').textContent = p.name;
    document.getElementById('detailBrief').textContent = p.brief;
    document.getElementById('detailStory').textContent = p.story;
  }

  window.showPlace = showPlace;
})();
