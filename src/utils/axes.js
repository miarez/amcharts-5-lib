// src/utils/axes.js
export function createAxes(root, chart, config) {
  const axesCfg = config.axes || {};
  const orientation = (config.orientation || "vertical").toLowerCase(); // "vertical" | "horizontal"

  const domainCfg = axesCfg.domain || {};
  const valueCfgs = Array.isArray(axesCfg.values)
    ? axesCfg.values
    : axesCfg.values
    ? [axesCfg.values]
    : [];

  const domainMode = (domainCfg.mode || "date").toLowerCase(); // "date" | "category"
  const domainField =
    domainCfg.field ||
    config.fields?.domain ||
    (domainMode === "date" ? "date" : "category");

  const isVertical = orientation === "vertical";

  // ---------- DOMAIN AXIS ----------
  let domainAxis;

  if (isVertical) {
    // Domain on X
    if (domainMode === "category") {
      const renderer = am5xy.AxisRendererX.new(root, { minGridDistance: 60 });

      domainAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: domainField,
          renderer,
        })
      );
    } else {
      const renderer = am5xy.AxisRendererX.new(root, { minGridDistance: 60 });

      domainAxis = chart.xAxes.push(
        am5xy.DateAxis.new(root, {
          maxDeviation: 0.2,
          groupData: false,
          baseInterval: domainCfg.baseInterval || { timeUnit: "day", count: 1 },
          renderer,
        })
      );
    }
  } else {
    // Domain on Y (horizontal charts)
    if (domainMode === "category") {
      const renderer = am5xy.AxisRendererY.new(root, { minGridDistance: 20 });

      domainAxis = chart.yAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: domainField,
          renderer,
        })
      );
    } else {
      const renderer = am5xy.AxisRendererY.new(root, { minGridDistance: 20 });

      domainAxis = chart.yAxes.push(
        am5xy.DateAxis.new(root, {
          maxDeviation: 0.2,
          groupData: false,
          baseInterval: domainCfg.baseInterval || { timeUnit: "day", count: 1 },
          renderer,
        })
      );
    }
  }

  // Attach metadata for series.js
  domainAxis._domainMode = domainMode; // "date" | "category"
  domainAxis._domainField = domainField; // e.g. "date" or "category"

  // ---------- VALUE AXES ----------
  const valueAxes = {};

  if (valueCfgs.length === 0) {
    // Default single value axis
    if (isVertical) {
      const rendererY = am5xy.AxisRendererY.new(root, { opposite: false });

      const axis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, { renderer: rendererY })
      );
      axis._stacking = "none";
      valueAxes.default = axis;
    } else {
      const rendererX = am5xy.AxisRendererX.new(root, { opposite: false });

      const axis = chart.xAxes.push(
        am5xy.ValueAxis.new(root, { renderer: rendererX })
      );
      axis._stacking = "none";
      valueAxes.default = axis;
    }

    return { domainAxis, valueAxes };
  }

  let firstAxis = null;

  valueCfgs.forEach((conf) => {
    const stacking = conf.stacking || "none"; // "none" | "stacked" | "percent"

    const renderer = isVertical
      ? am5xy.AxisRendererY.new(root, {
          opposite: conf.position === "right",
        })
      : am5xy.AxisRendererX.new(root, {
          opposite: conf.position === "top",
        });

    const opts = {};

    if (stacking === "percent") {
      opts.min = 0;
      opts.max = 100;
      opts.strictMinMax = true;
      opts.calculateTotals = true;
    }

    const axis = (isVertical ? chart.yAxes : chart.xAxes).push(
      am5xy.ValueAxis.new(root, {
        renderer,
        min: conf.min ?? opts.min,
        max: conf.max ?? opts.max,
        strictMinMax: opts.strictMinMax,
        calculateTotals: opts.calculateTotals,
      })
    );

    axis._stacking = stacking;

    const id = conf.id || "default";
    valueAxes[id] = axis;
    if (!firstAxis) firstAxis = axis;
  });

  if (!valueAxes.default) {
    valueAxes.default = firstAxis;
  }

  return { domainAxis, valueAxes };
}
