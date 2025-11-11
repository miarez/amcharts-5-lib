// src/charts/xy/catSeries/_baseCatSeries.js

import { createXYChart } from "../../../engines/xyEngine.js";
import { applyChartBackground } from "../../../utils/applyChartBackground.js";
import { withLegend } from "../../../decorators/withLegend.js";
import { withCursor } from "../../../decorators/withCursor.js";
import { withScrollbars } from "../../../decorators/withScrollbars.js";

const STACKABLE_GEOMS = new Set(["column", "bar", "area"]);

export function buildCatSeriesChart(root, config) {
  const engine = config.engine || {};
  const data = Array.isArray(config.data) ? config.data : [];

  const axesCfg = engine.axes || {};
  const xCfg = axesCfg.x || {};
  const yCfgs = Array.isArray(axesCfg.y)
    ? axesCfg.y
    : axesCfg.y
    ? [axesCfg.y]
    : [];

  const seriesDefs = Array.isArray(engine.series) ? engine.series : [];

  // --- FIELDS ---

  let categoryField = engine.categoryField || xCfg.field;
  if (!categoryField && data.length) {
    const keys = Object.keys(data[0]);
    categoryField = keys.find((k) => isNaN(Number(data[0][k]))) || keys[0];
  }

  const firstSeries = seriesDefs[0];
  const valueField = firstSeries?.field;

  // --- CHART + AXES ---

  const { chart } = createXYChart(root, engine);

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField,
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 30,
      }),
    })
  );
  xAxis.data.setAll(data);

  const firstY = yCfgs[0] || {};

  // axis stacking mode:
  // - if you later support "percent", you can use firstY.stacking: "percent"
  // - right now you’re using firstY.stacked: true
  const axisStacking = (() => {
    if (typeof firstY.stacking === "string") {
      return firstY.stacking.toLowerCase(); // "none" | "stacked" | "percent"
    }
    if (firstY.stacked) return "stacked";
    return "none";
  })();

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
      min: firstY.min ?? 0,
      max: firstY.max,
    })
  );

  if (axisStacking === "percent") {
    yAxis.set("calculateTotals", true);
  }

  // --- SERIES ---

  const series = seriesDefs.map((sDef) => {
    const vf = sDef.field || valueField;

    // decide geometry: per-series geom > engine.chartType > "column"
    const geom = (sDef.geom || engine.chartType || "column").toLowerCase();

    let SeriesClass = am5xy.ColumnSeries;
    if (geom === "line" || geom === "area") {
      SeriesClass = am5xy.LineSeries;
    }

    const isStackableGeom = STACKABLE_GEOMS.has(geom);

    const tooltipText =
      axisStacking === "percent"
        ? "{name}: {valueYTotalPercent.formatNumber('0.0')}"
        : "{name}: {valueY}";

    const s = chart.series.push(
      SeriesClass.new(root, {
        name: sDef.name || vf,
        xAxis,
        yAxis,
        categoryXField: categoryField,
        valueYField: vf,
        tooltip: am5.Tooltip.new(root, {
          labelText: tooltipText,
        }),
      })
    );

    // styling for line/area
    if (geom === "line") {
      s.strokes.template.setAll({
        strokeWidth: sDef.strokeWidth ?? 2,
      });
      s.fills.template.set("visible", false);
    }

    if (geom === "area") {
      s.strokes.template.setAll({
        strokeWidth: sDef.strokeWidth ?? 2,
      });
      s.fills.template.setAll({
        visible: true,
        fillOpacity: sDef.fillOpacity ?? 0.4,
      });
    }

    // --- STACKING LOGIC ---
    if (axisStacking !== "none" && isStackableGeom) {
      s.set("stacked", true);

      if (axisStacking === "percent") {
        // show percent-of-total instead of raw value
        s.set("valueYShow", "valueYTotalPercent");
      }
    }

    s.data.setAll(data);
    s.appear(800);
    return s;
  });

  // --- THEME BACKGROUND ---

  if (config.theme && config.theme.background) {
    applyChartBackground(root, chart, config.theme.background);
  }

  // --- DECORATORS: legend, cursor, scrollbars ---

  const legend = withLegend(root, chart, series, config.legend || {});
  const cursor = withCursor(root, chart, xAxis, yAxis, config.cursor || {});
  const scrollbars = withScrollbars(root, chart, config.scrollbars || {});

  chart.appear(800, 100);

  const cleanup = () => {
    if (!root.isDisposed()) {
      root.dispose();
    }
  };

  return {
    chart,
    xAxis,
    yAxis,
    series,
    legend,
    cursor,
    scrollbars,
    cleanup,
  };
}
