// src/charts/xy/catSeries/_baseCatSeries.js
import { debug, pp } from "../../../utils/pp.js";

import { createXYChart } from "../../../engines/xyEngine.js";
import { applyChartBackground } from "../../../utils/applyChartBackground.js";
import { withLegend } from "../../../decorators/withLegend.js";
import { withCursor } from "../../../decorators/withCursor.js";
import { withScrollbars } from "../../../decorators/withScrollbars.js";

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
  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {}),
      min: firstY.min ?? 0,
      max: firstY.max,
    })
  );

  // --- SERIES ---

  const series = seriesDefs.map((sDef) => {
    const vf = sDef.field || valueField;

    const s = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: sDef.name || vf,
        xAxis,
        yAxis,
        categoryXField: categoryField,
        valueYField: vf,
        tooltip: am5.Tooltip.new(root, {
          labelText: "{name}: {valueY}",
        }),
      })
    );

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
