// src/families/xySeries.js
import { createAxes } from "../utils/axes.js";
import { createSeriesForXY } from "../utils/series.js";
import { withLegend } from "../decorators/withLegend.js";
import { withCursor } from "../decorators/withCursor.js";
import { withScrollbars } from "../decorators/withScrollbars.js";
import { applyChartBackground } from "../core/applyChartBackground.js";

// NOTE: root is now injected from createChart()
export function createXYSeriesChart(root, config) {
  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
    })
  );
  applyChartBackground(root, chart, config);

  const { domainAxis, valueAxes } = createAxes(root, chart, config);

  const series = createSeriesForXY(root, chart, {
    config,
    domainAxis,
    valueAxes,
    data: config.data,
  });

  if (config.decorators?.legend?.enabled) {
    withLegend(root, chart, { series });
  }

  if (config.decorators?.cursor?.enabled) {
    withCursor(root, chart, { domainAxis, config });
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
