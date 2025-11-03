// src/utils/axes.js
export function createAxes(root, chart, config) {
  const axesCfg = config.axes || {};
  const orientation = (config.orientation || "vertical").toLowerCase();

  // For now we only support vertical (domain on X, values on Y)
  if (orientation !== "vertical") {
    throw new Error(
      `Only vertical orientation is supported for xy-series right now (got "${orientation}")`
    );
  }

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

  // ---------- DOMAIN AXIS (X in vertical mode) ----------
  let domainAxis;

  if (domainMode === "category") {
    const renderer = am5xy.AxisRendererX.new(root, { minGridDistance: 60 });

    domainAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: domainField,
        renderer,
      })
    );
  } else {
    // default: date / numeric
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

  // Attach metadata for series.js
  domainAxis._domainMode = domainMode; // "date" | "category"
  domainAxis._domainField = domainField; // e.g. "date" or "label"

  // ---------- VALUE AXES (Y in vertical mode) ----------
  const valueAxes = {};

  if (valueCfgs.length === 0) {
    // Default single value axis
    const rendererY = am5xy.AxisRendererY.new(root, { opposite: false });

    const axis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, { renderer: rendererY })
    );

    axis._stacking = "none";
    valueAxes.default = axis;

    return { domainAxis, valueAxes };
  }

  let firstAxis = null;

  valueCfgs.forEach((conf) => {
    const stacking = conf.stacking || "none"; // "none" | "stacked" | "percent"
    const rendererY = am5xy.AxisRendererY.new(root, {
      opposite: conf.position === "right",
    });

    const opts = {};

    // 100% stacking: clamp to 0–100 and calculateTotals
    if (stacking === "percent") {
      opts.min = 0;
      opts.max = 100;
      opts.strictMinMax = true;
      opts.calculateTotals = true;
    }

    const axis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: rendererY,
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
