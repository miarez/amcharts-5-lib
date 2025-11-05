// src/families/pie.js
import { withLegend } from "../decorators/withLegend.js";
import { applyChartBackground } from "../core/applyChartBackground.js";

// NOTE: root is injected from createChart(), same as XY families
export function createPieChart(root, config) {
  const variant = config.family || "pie"; // "pie" or "donut"

  const options = config.options || {};
  const fields = config.fields || {};
  const data = Array.isArray(config.data) ? config.data : [];

  const categoryField = fields.category || "category";
  const valueField = fields.value || "value";
  const colorField = fields.color || null;

  // If user explicitly set innerRadius in options, respect it.
  // Otherwise, pick a default based on variant.
  const innerRadiusRaw =
    options.innerRadius ?? (variant === "donut" ? "50%" : 0);

  const chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      layout: root.verticalLayout,
      innerRadius: normalizeInnerRadius(innerRadiusRaw),
    })
  );

  // ✅ same as XY: shared background decorator
  applyChartBackground(root, chart, config);

  // Optional title (purely cosmetic, like you'd do on XY)
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

  series.data.setAll(data);

  // Optional per-slice color field (same pattern as XY colorField)
  if (colorField) {
    series.slices.template.adapters.add("fill", (fill, target) => {
      const d = target.dataItem?.dataContext;
      if (d && d[colorField]) {
        return am5.color(d[colorField]);
      }
      return fill;
    });
  }

  // Optional donut-style rounding (purely cosmetic)
  if (variant === "donut") {
    const cornerRadius = options.cornerRadius ?? 10;
    const innerCornerRadius = options.innerCornerRadius ?? 8;

    series.slices.template.setAll({
      cornerRadius,
      innerCornerRadius,
    });
  }

  // ✅ Legend handling aligned with XY:
  // enable via config.decorators.legend.enabled
  const legendEnabled = config.decorators?.legend?.enabled ?? false;
  if (legendEnabled) {
    // If your withLegend expects an array of series,
    // you can change this to series: [series]
    withLegend(root, chart, { series });
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

function normalizeInnerRadius(innerRadius) {
  if (innerRadius == null) return 0;
  if (typeof innerRadius === "string" && innerRadius.endsWith("%")) {
    const n = Number.parseFloat(innerRadius);
    if (!Number.isNaN(n)) return am5.percent(n);
  }
  return innerRadius;
}
