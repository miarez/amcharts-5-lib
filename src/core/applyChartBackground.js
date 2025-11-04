// src/core/applyChartBackground.js
/**
 * Sets a chart background fill if specified in config.theme.background.
 *
 * Example config:
 * "theme": {
 *   "mode": "dark",
 *   "background": "#000000"
 * }
 *
 * Usage:
 * import { applyChartBackground } from "../core/applyChartBackground.js";
 * applyChartBackground(root, chart, config);
 */
export function applyChartBackground(root, chart, config) {
  const background = config?.theme?.background;

  if (!background) return;

  chart.set(
    "background",
    am5.Rectangle.new(root, {
      fill: am5.color(background),
      fillOpacity: 1,
    })
  );
}
