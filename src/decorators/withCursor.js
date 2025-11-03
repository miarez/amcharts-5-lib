// src/decorators/withCursor.js

// root: am5.Root
// chart: am5xy.XYChart
// options: { domainAxis, config }
export function withCursor(root, chart, { domainAxis, config }) {
  const cursorCfg = config?.decorators?.cursor || {};

  const behavior = cursorCfg.behavior || "none";
  const showLineX = cursorCfg.showLineX ?? true;
  const showLineY = cursorCfg.showLineY ?? false;

  const cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, {
      behavior,
    })
  );

  cursor.lineX.set("visible", showLineX);
  cursor.lineY.set("visible", showLineY);

  if (!domainAxis) return cursor;

  // Tie cursor to the domain axis (X in vertical orientation)
  cursor.set("xAxis", domainAxis);

  // ----- Axis tooltip for X (the little date/category box) -----
  const xTooltipCfg = cursorCfg.xAxisTooltip || {};
  const tooltipEnabled = xTooltipCfg.enabled ?? true;

  if (tooltipEnabled) {
    const domainMode = domainAxis._domainMode || "date"; // "date" | "category"

    // 1) If user explicitly provided labelText, use it
    let labelText = xTooltipCfg.labelText || null;

    // 2) Otherwise derive a default from domain mode + config formats
    if (!labelText) {
      if (domainMode === "date") {
        const fmt = xTooltipCfg.dateFormat || "MMM dd, yyyy";
        labelText = `{value.formatDate('${fmt}')}`;
      } else {
        // category / other domain types
        labelText = xTooltipCfg.categoryFormat || "{value}";
      }
    }

    // Create tooltip and attach to axis
    const axisTooltip = am5.Tooltip.new(root, {});
    domainAxis.set("tooltip", axisTooltip);

    // IMPORTANT: set label text explicitly on the label object
    axisTooltip.label.set("text", labelText);

    // Optional: ensure text is visible (white on dark bg)
    axisTooltip.label.setAll({
      fill: am5.color(0xffffff),
    });
  }

  return cursor;
}
