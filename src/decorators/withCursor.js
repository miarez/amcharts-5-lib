// src/decorators/withCursor.js
export function withCursor(root, chart, { xAxis }) {
  const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
  cursor.lineY.set("visible", false);
  cursor.lineX.set("visible", true);
  cursor.set("behavior", "none");
  if (xAxis) cursor.set("xAxis", xAxis);
  return cursor;
}
