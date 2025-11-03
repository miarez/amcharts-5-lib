// src/decorators/withLegend.js
export function withLegend(root, chart, { series }) {
  const legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50,
      layout: root.horizontalLayout,
    })
  );

  legend.data.setAll(series);
  return legend;
}
