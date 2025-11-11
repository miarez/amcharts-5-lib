// src/decorators/withCursor.js

/**
 * Attach an XY cursor and optional axis tooltip.
 *
 * cursorConfig:
 *   {
 *     enabled: true,
 *     behavior: "none" | "zoomX" | "zoomY" | "zoomXY",
 *     showLineX: true,
 *     showLineY: true,
 *     xAxisTooltip: { enabled: true, categoryFormat: "{value}" }
 *   }
 */
export function withCursor(root, chart, xAxis, yAxis, cursorConfig = {}) {
  if (!cursorConfig.enabled) return null;

  const behavior = cursorConfig.behavior || "none";

  const cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, {
      behavior,
    })
  );

  cursor.lineX.set("visible", cursorConfig.showLineX ?? true);
  cursor.lineY.set("visible", cursorConfig.showLineY ?? true);

  const xTooltipCfg = cursorConfig.xAxisTooltip || {};
  if (xAxis && xTooltipCfg.enabled !== false) {
    xAxis.set(
      "tooltip",
      am5.Tooltip.new(root, {
        labelText: xTooltipCfg.categoryFormat || "{category}",
      })
    );
  }

  return cursor;
}
