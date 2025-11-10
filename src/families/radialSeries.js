// src/families/radialSeries.js
import { applyChartBackground } from "../core/applyChartBackground.js";
import { withLegend } from "../decorators/withLegend.js";

export function createRadialSeriesChart(root, config) {
  const variant = config.variant || "stacked-radar"; // "polar", "polar-scatter"

  // ----- RAW DATA & CONFIG -----
  const rawData = Array.isArray(config.data) ? config.data : [];
  let data = rawData.slice(); // we'll transform this in some cases

  const fields = config.fields || {};
  const axesCfg = config.axes || {};
  const angleCfg = axesCfg.angle || {};
  const radiusCfg = axesCfg.radius || {};
  const options = config.options || {};

  const seriesDefs = Array.isArray(config.series) ? config.series : [];

  // Named fields
  let angleField = fields.angle || "category"; // may be overwritten
  const xField = fields.x || null;
  const yField = fields.y || null;
  const sizeField = fields.size || "size"; // not used yet but ready

  const angleTypeFromConfig = angleCfg.type || "category"; // "category" or "value"
  let angleType = angleTypeFromConfig;

  const isPolarScatter = variant === "polar-scatter";

  // For auto radius bounds when we map x,y
  let inferredRadiusMin = null;
  let inferredRadiusMax = null;

  // ----- CARTESIAN INPUT → POLAR (FOR POLAR-SCATTER) -----
  // If user didn't give an explicit angle field but DID give x & y,
  // we treat (x,y) as cartesian and map x linearly to angle.
  if (isPolarScatter && !fields.angle && xField && yField) {
    const startAngle = angleCfg.startAngle ?? options.startAngle ?? 0;
    const endAngle = angleCfg.endAngle ?? options.endAngle ?? 360;

    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;

    data.forEach((row) => {
      const x = Number(row[xField]);
      const y = Number(row[yField]);

      if (!Number.isNaN(x)) {
        if (x < xMin) xMin = x;
        if (x > xMax) xMax = x;
      }
      if (!Number.isNaN(y)) {
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      }
    });

    if (xMin === Infinity || xMax === -Infinity) {
      console.warn("[radial-series] polar-scatter: no valid x values to map.");
    } else {
      const xSpan = xMax - xMin || 1; // avoid divide by zero
      const angleSpan = endAngle - startAngle;

      data = data.map((row) => {
        const x = Number(row[xField]);
        const normalizedX = (x - xMin) / xSpan;
        const angle = startAngle + normalizedX * angleSpan;

        return {
          ...row,
          _angle: angle,
          // y stays as-is; we use series valueField to pick radius
        };
      });

      angleField = "_angle";
      angleType = "value";

      inferredRadiusMin = yMin;
      inferredRadiusMax = yMax;
    }
  }

  // ----- CHART -----
  const innerRadiusPercent = options.innerRadius ?? 0;

  const chart = root.container.children.push(
    am5radar.RadarChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
      startAngle: angleCfg.startAngle ?? options.startAngle ?? 0,
      endAngle: angleCfg.endAngle ?? options.endAngle ?? 360,
      innerRadius: innerRadiusPercent ? am5.percent(innerRadiusPercent) : 0,
    })
  );

  applyChartBackground(root, chart, config);

  // ----- ANGLE AXIS (X) -----
  let angleAxis;
  const angleRenderer = am5radar.AxisRendererCircular.new(root, {
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

  let radiusMin = radiusCfg.min;
  let radiusMax = radiusCfg.max;

  if (radiusMin == null && inferredRadiusMin != null) {
    radiusMin = inferredRadiusMin;
  }
  if (radiusMax == null && inferredRadiusMax != null) {
    radiusMax = inferredRadiusMax;
  }

  const radiusAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: radiusRenderer,
      min: radiusMin ?? 0,
      max: radiusMax ?? undefined,
      strictMinMax: !!radiusCfg.strictMinMax,
    })
  );

  // ----- ANGLE FIELD HELPER -----
  function applyAngleField(seriesOptions) {
    if (angleType === "value") {
      seriesOptions.valueXField = angleField; // numeric angle
    } else {
      seriesOptions.categoryXField = angleField; // categorical angle
    }
    return seriesOptions;
  }

  // ----- SERIES HELPERS -----

  function createStackedRadarSeries(seriesDef) {
    const valueField = seriesDef.valueField;
    if (!valueField) {
      console.warn("[radial-series] Missing valueField for series", seriesDef);
      return null;
    }

    const series = chart.series.push(
      am5radar.RadarLineSeries.new(
        root,
        applyAngleField({
          name: seriesDef.name || valueField,
          xAxis: angleAxis,
          yAxis: radiusAxis,
          valueYField: valueField,
          stacked: true,
          tooltipText: `{${angleField}}: {${valueField}}`,
        })
      )
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
    if (!valueField) {
      console.warn("[radial-series] Missing valueField for series", seriesDef);
      return null;
    }

    const series = chart.series.push(
      am5radar.RadarColumnSeries.new(
        root,
        applyAngleField({
          name: seriesDef.name || valueField,
          xAxis: angleAxis,
          yAxis: radiusAxis,
          valueYField: valueField,
          clustered: false,
          tooltipText: `{${angleField}}: {${valueField}}`,
        })
      )
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
    if (!valueField) {
      console.warn("[radial-series] Missing valueField for series", seriesDef);
      return null;
    }

    const tooltip =
      angleType === "value"
        ? `{${angleField}}°: {${valueField}}`
        : `{${angleField}}: {${valueField}}`;

    const series = chart.series.push(
      am5radar.RadarLineSeries.new(
        root,
        applyAngleField({
          name: seriesDef.name || valueField,
          xAxis: angleAxis,
          yAxis: radiusAxis,
          valueYField: valueField,
          strokeOpacity: 0, // try to kill line in constructor
          tooltipText: tooltip,
        })
      )
    );

    // Hard-kill any line stroke so it's pure scatter by default
    series.strokes.template.setAll({
      visible: false,
      strokeOpacity: 0,
    });

    series.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 5,
          fill: series.get("fill"),
          tooltipText: tooltip,
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
