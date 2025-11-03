// src/decorators/withScrollbars.js
export function withScrollbars(root, chart, { axis }) {
  if (axis === "x" || !axis) {
    const scrollbarX = am5xy.XYChartScrollbar.new(root, {
      orientation: "horizontal",
    });
    chart.set("scrollbarX", scrollbarX);
    chart.bottomAxesContainer.children.push(scrollbarX);
    return scrollbarX;
  }

  // You can extend later for Y-scrollbars if needed
  return null;
}
