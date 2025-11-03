// src/families/xySeries.js
import { createAxes } from "../utils/axes.js";
import { createSeriesForXY } from "../utils/series.js";
import { withLegend } from "../decorators/withLegend.js";
import { withCursor } from "../decorators/withCursor.js";
import { withScrollbars } from "../decorators/withScrollBars.js";

export function createXYSeriesChart(config) {
  const root = am5.Root.new(config.container || "chartdiv");

  if (config.theme?.animated && window.am5themes_Animated) {
    root.setThemes([am5themes_Animated.new(root)]);
  }

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: false,
      wheelX: false,
      wheelY: false,
      layout: root.verticalLayout,
    })
  );

  const { domainAxis, valueAxes } = createAxes(root, chart, config);

  const series = createSeriesForXY(root, chart, {
    config,
    domainAxis,
    valueAxes,
    data: config.data,
  });

  if (config.decorators?.legend?.enabled) withLegend(root, chart, { series });
  if (config.decorators?.cursor?.enabled) {
    withCursor(root, chart, { domainAxis, config });
  }
  if (config.decorators?.scrollbarX?.enabled)
    withScrollbars(root, chart, { axis: "x" });

  return {
    root,
    chart,
    series,
    cleanup: () => {
      if (!root.isDisposed()) root.dispose();
    },
  };
}
