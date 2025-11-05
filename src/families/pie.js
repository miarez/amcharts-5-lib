// src/families/pie.js
import { withLegend } from "../decorators/withLegend.js";
import { applyChartBackground } from "../core/applyChartBackground.js";

// NOTE: root is injected from createChart(), same as XY families
export function createPieChart(root, config) {
  const options = config.options || {};
  const fields = config.fields || {};

  const categoryField = fields.category || "category";
  const valueField = fields.value || "value";
  const colorField = fields.color || null;

  // data is already resolved in main.js and attached as config.data
  const data = Array.isArray(config.data) ? config.data : [];

  // Chart container
  const chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      layout: root.verticalLayout,
      innerRadius: normalizeInnerRadius(options.innerRadius),
    })
  );

  // Optional background (same pattern as XY)
  applyChartBackground(root, chart, config);

  // Optional title above chart
  if (options.title) {
    root.container.children.unshift(
      am5.Label.new(root, {
        text: options.title,
        fontSize: 16,
        fontWeight: "600",
        paddingBottom: 8,
      })
    );
  }

  const series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField,
      categoryField,
    })
  );

  // Data for slices
  series.data.setAll(data);

  // Optional per-slice color field
  if (colorField) {
    series.slices.template.adapters.add("fill", (fill, target) => {
      const d = target.dataItem?.dataContext;
      if (d && d[colorField]) {
        return am5.color(d[colorField]);
      }
      return fill;
    });
  }

  // Optional legend using shared decorator
  if (options.legend !== false) {
    // withLegend just calls legend.data.setAll(...)
    // Here we pass series.dataItems instead of an array of series
    withLegend(root, chart, { series: series.dataItems });
  }

  return {
    root,
    chart,
    series,
    cleanup: () => {
      if (!root.isDisposed()) root.dispose();
    },
  };
}

// Helper to support numeric or percentage innerRadius
function normalizeInnerRadius(innerRadius) {
  if (innerRadius == null) return 0;
  if (typeof innerRadius === "string" && innerRadius.endsWith("%")) {
    const n = Number.parseFloat(innerRadius);
    if (!Number.isNaN(n)) return am5.percent(n);
  }
  return innerRadius;
}
