// src/families/xyScatter.js
import { createScatterSeries } from "../utils/scatterSeries.js";
import { withLegend } from "../decorators/withLegend.js";
import { withCursor } from "../decorators/withCursor.js";
import { withScrollbars } from "../decorators/withScrollBars.js";

import { applyChartBackground } from "../core/applyChartBackground.js";

// NOTE: root is injected from createChart()
export function createXYScatterChart(root, config) {
  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
    })
  );

  applyChartBackground(root, chart, config);

  const axesCfg = config.axes || {};
  const xCfg = axesCfg.x || {};
  const yCfg = axesCfg.y || {};

  const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 40 });
  const yRenderer = am5xy.AxisRendererY.new(root, { minGridDistance: 30 });

  const xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: xRenderer,
      min: xCfg.min ?? undefined,
      max: xCfg.max ?? undefined,
      strictMinMax: xCfg.strictMinMax ?? false,
    })
  );

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: yRenderer,
      min: yCfg.min ?? undefined,
      max: yCfg.max ?? undefined,
      strictMinMax: yCfg.strictMinMax ?? false,
    })
  );

  // For cursor/decorators: treat xAxis as "domain" for tooltip formatting
  xAxis._domainMode = "value";
  xAxis._domainField = config.fields?.x || "x";

  const series = createScatterSeries(root, chart, {
    config,
    xAxis,
    yAxis,
    data: config.data,
  });

  if (config.decorators?.legend?.enabled) {
    withLegend(root, chart, { series });
  }

  if (config.decorators?.cursor?.enabled) {
    withCursor(root, chart, { domainAxis: xAxis, config });
  }

  if (config.decorators?.scrollbarX?.enabled) {
    withScrollbars(root, chart, { axis: "x" });
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
