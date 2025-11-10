// src/families/radialSeries.js
import { applyChartBackground } from "../core/applyChartBackground.js";
import { withLegend } from "../decorators/withLegend.js";

export function createRadialSeriesChart(root, config) {
  const variant = config.variant || "stacked-radar"; // "polar", "polar-scatter" later

  const data = Array.isArray(config.data) ? config.data : [];
  const fields = config.fields || {};
  const axesCfg = config.axes || {};
  const angleCfg = axesCfg.angle || {};
  const radiusCfg = axesCfg.radius || {};
  const options = config.options || {};

  const angleField = fields.angle || "category";
  const seriesDefs = Array.isArray(config.series) ? config.series : [];

  const angleType = angleCfg.type || "category"; // "category" or "value"

  const startAngle = angleCfg.startAngle ?? options.startAngle ?? 0;
  const endAngle = angleCfg.endAngle ?? options.endAngle ?? 360;

  const innerRadius = options.innerRadius ?? 0;

  // ----- CHART -----
  const chart = root.container.children.push(
    am5radar.RadarChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      startAngle,
      endAngle,
      innerRadius: innerRadius ? am5.percent(innerRadius) : 0,
    })
  );

  applyChartBackground(root, chart, config);

  // ----- ANGLE AXIS (X) -----
  let angleAxis;
  let angleRenderer = am5radar.AxisRendererCircular.new(root, {
    minGridDistance: angleCfg.minGridDistance ?? 30,
  });

  if (angleCfg.showGrid === false) {
    angleRenderer.grid.template.set("visible", false);
  }

  if (angleType === "value") {
    angleAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: angleRenderer,
        min: angleCfg.min ?? 0,
        max: angleCfg.max ?? 360,
        strictMinMax: !!angleCfg.strictMinMax,
      })
    );
  } else {
    angleAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer: angleRenderer,
        categoryField: angleField,
      })
    );
    angleAxis.data.setAll(data);
  }

  // ----- RADIUS AXIS (Y) -----
  const radiusRenderer = am5radar.AxisRendererRadial.new(root, {
    minGridDistance: radiusCfg.minGridDistance ?? 20,
  });

  if (radiusCfg.showGrid === false) {
    radiusRenderer.grid.template.set("visible", false);
  }

  const radiusAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: radiusRenderer,
      min: radiusCfg.min ?? 0,
      max: radiusCfg.max ?? undefined,
      strictMinMax: !!radiusCfg.strictMinMax,
    })
  );

  // ----- SERIES CREATION HELPERS -----
  function createStackedRadarSeries(seriesDef) {
    const valueField = seriesDef.valueField;
    if (!valueField) {
      console.warn("[radial-series] Missing valueField for series", seriesDef);
      return null;
    }

    const series = chart.series.push(
      am5radar.RadarLineSeries.new(root, {
        name: seriesDef.name || valueField,
        xAxis: angleAxis,
        yAxis: radiusAxis,
        categoryXField: angleField,
        valueYField: valueField,
        stacked: true,
        tooltipText: `{${angleField}}: {${valueField}}`,
      })
    );

    series.strokes.template.setAll({
      width: 2,
    });

    series.fills.template.setAll({
      visible: true,
      fillOpacity: 0.4,
    });

    series.data.setAll(data);
    return series;
  }

  function createPolarColumnSeries(seriesDef) {
    const valueField = seriesDef.valueField;
    if (!valueField) return null;

    const series = chart.series.push(
      am5radar.RadarColumnSeries.new(root, {
        name: seriesDef.name || valueField,
        xAxis: angleAxis,
        yAxis: radiusAxis,
        categoryXField: angleField,
        valueYField: valueField,
        clustered: false,
        tooltipText: `{${angleField}}: {${valueField}}`,
      })
    );

    series.columns.template.setAll({
      strokeOpacity: 0,
      width: am5.percent(100),
      fillOpacity: 0.8,
    });

    series.data.setAll(data);
    return series;
  }

  function createPolarScatterSeries(seriesDef) {
    const valueField = seriesDef.valueField;
    if (!valueField) return null;

    const series = chart.series.push(
      am5radar.RadarLineSeries.new(root, {
        name: seriesDef.name || valueField,
        xAxis: angleAxis,
        yAxis: radiusAxis,
        categoryXField: angleField,
        valueYField: valueField,
        strokeOpacity: 0, // try to hide line…
        tooltipText: `{${angleField}}: {${valueField}}`,
      })
    );

    // …and *force* it off here so themes can't resurrect it
    series.strokes.template.setAll({
      visible: false,
      strokeOpacity: 0,
    });

    series.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 4,
          fill: series.get("fill"),
          tooltipText: `{${angleField}}: {${valueField}}`,
        }),
      })
    );

    series.data.setAll(data);
    return series;
  }

  // ----- DISPATCH BY VARIANT -----
  const createdSeries = [];

  if (variant === "stacked-radar") {
    seriesDefs.forEach((s) => {
      const series = createStackedRadarSeries(s);
      if (series) createdSeries.push(series);
    });
  } else if (variant === "polar") {
    seriesDefs.forEach((s) => {
      const series = createPolarColumnSeries(s);
      if (series) createdSeries.push(series);
    });
  } else if (variant === "polar-scatter") {
    seriesDefs.forEach((s) => {
      const series = createPolarScatterSeries(s);
      if (series) createdSeries.push(series);
    });
  } else {
    console.warn(
      `[radial-series] Unknown variant '${variant}', defaulting to 'stacked-radar'.`
    );
    seriesDefs.forEach((s) => {
      const series = createStackedRadarSeries(s);
      if (series) createdSeries.push(series);
    });
  }

  // ----- LEGEND -----
  if (
    config.decorators?.legend?.enabled !== false &&
    createdSeries.length > 1
  ) {
    withLegend(root, chart, { series: createdSeries, config });
  }

  chart.appear(1000, 100);

  return {
    root,
    chart,
    angleAxis,
    radiusAxis,
    series: createdSeries,
    cleanup: () => {
      if (!root.isDisposed()) root.dispose();
    },
  };
}
