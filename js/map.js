/* ============================================================
   金陵有迹 — 地图标记渲染
   读取 data.js 里的地点，在地图 SVG 上生成标记（圆点 + 标签）
   每个标记带 data-theme，供主题筛选使用
   ============================================================ */

(function () {
  var markersLayer = document.getElementById('markers');
  if (!markersLayer) return;

  var NS = 'http://www.w3.org/2000/svg';
  var places = window.PLACES || [];

  places.forEach(function (p) {
    // 每个标记是一个 <g>，平移到地点坐标
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'marker');
    g.setAttribute('data-id', p.id);
    g.setAttribute('data-theme', p.theme);
    g.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');

    // 选中时的光环
    var halo = document.createElementNS(NS, 'circle');
    halo.setAttribute('class', 'marker__halo');
    halo.setAttribute('r', '16');

    // 圆点
    var dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('class', 'marker__dot');
    dot.setAttribute('r', '7');

    // 名称标签
    var label = document.createElementNS(NS, 'text');
    label.setAttribute('class', 'marker__label');
    label.setAttribute('x', '13');
    label.setAttribute('y', '4');
    label.textContent = p.name;

    // 透明大点击区（移动端手指更容易点中）
    var hit = document.createElementNS(NS, 'circle');
    hit.setAttribute('class', 'marker__hit');
    hit.setAttribute('r', '22');

    g.appendChild(halo);
    g.appendChild(dot);
    g.appendChild(hit);
    g.appendChild(label);

    // 点击标记 → 显示详情
    g.addEventListener('click', function () {
      if (window.showPlace) window.showPlace(p.id);
    });

    markersLayer.appendChild(g);
  });
})();
