// builder/XY.js

import { CategoryAxis, DateAxis, ValueAxis } from "./Axis.js";
import { Series } from "./Series.js";

export class XY {
  constructor() {
    this._categoryField = null;
    this._explicitChartType = null;
    this._xAxis = null;
    this._yAxes = [];
    this._seriesBuilders = [];
  }

  category(field) {
    this._categoryField = field;
    return this;
  }

  chartType(type) {
    this._explicitChartType = type;
    return this;
  }

  xAxis(axis) {
    this._xAxis = axis;
    return this;
  }

  yAxis(axis) {
    this._yAxes.push(axis);
    return this;
  }

  addSeries(series) {
    this._seriesBuilders.push(series);
    return this;
  }

  /**
   * Expose chartType inference if you ever want to inspect it.
   */
  inferChartType() {
    const series = this._seriesBuilders.map((s) =>
      typeof s.build === "function" ? s.build() : s
    );
    const yAxes = this._yAxes.map((a) =>
      typeof a.build === "function" ? a.build() : a
    );

    return inferChartTypeFromSeriesAndAxes(series, yAxes);
  }

  build() {
    const xAxis =
      this._xAxis && typeof this._xAxis.build === "function"
        ? this._xAxis.build()
        : this._xAxis;

    const yAxes = this._yAxes.map((a) =>
      typeof a.build === "function" ? a.build() : a
    );

    const series = this._seriesBuilders.map((s) =>
      typeof s.build === "function" ? s.build() : s
    );

    // 🔥 Axis-level validation: stacked axis cannot have mixed geoms
    validateStackingPerAxis(series, yAxes);

    const chartType =
      this._explicitChartType || inferChartTypeFromSeriesAndAxes(series, yAxes);

    return {
      engineType: "XY",
      chartType,
      categoryField: this._categoryField,
      axes: {
        x: xAxis,
        y: yAxes,
      },
      series,
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function normalizeGeom(s) {
  return (s.geom || "line").toLowerCase();
}

/**
 * Decide the chart type from:
 *  - the geoms of the series (column / line / area)
 *  - whether the first Y axis is stacked
 */
function inferChartTypeFromSeriesAndAxes(series, yAxes) {
  if (!Array.isArray(series) || series.length === 0) {
    return "column"; // safe fallback
  }

  const geoms = series.map(normalizeGeom);
  const uniqueGeoms = [...new Set(geoms)];

  const firstY = (Array.isArray(yAxes) && yAxes[0]) || {};
  const stackingRaw = (firstY.stacking || "").toLowerCase();
  const isStackedAxis =
    firstY.stacked === true || (stackingRaw && stackingRaw !== "none");

  // Single-geom charts
  if (uniqueGeoms.length === 1) {
    const g = uniqueGeoms[0];

    if (g === "column") {
      return isStackedAxis ? "stackedColumn" : "column";
    }

    if (g === "area") {
      return isStackedAxis ? "stackedArea" : "area";
    }

    if (g === "line") {
      return "line";
    }

    return "column";
  }

  // Mixed geoms → combo
  return "combo";
}

/**
 * Axis-level guardrail:
 *   If an axis is stacked, all series mapped to that axis
 *   must share the same geometry.
 *
 * Otherwise, throw a hard error in the *builder*.
 */
function validateStackingPerAxis(series, yAxes) {
  if (!Array.isArray(yAxes) || yAxes.length === 0) return;
  if (!Array.isArray(series) || series.length === 0) return;

  // Build a quick lookup: axisId -> axisConfig
  const axisById = new Map();
  yAxes.forEach((axis, idx) => {
    const id = axis.id || `y${idx}`;
    axisById.set(id, axis);
  });

  // Map: axisId -> array of series geoms on that axis
  const geomsByAxis = new Map();

  series.forEach((s) => {
    const geom = normalizeGeom(s);

    // Try to find which axis this series belongs to
    const axisIdFromSeries = s.axis || s.valueAxisId || s.yAxisId;

    let axisId = axisIdFromSeries;
    if (!axisId) {
      // default: first Y axis
      const defaultAxis = yAxes[0];
      axisId = defaultAxis?.id || "y0";
    }

    if (!geomsByAxis.has(axisId)) {
      geomsByAxis.set(axisId, []);
    }
    geomsByAxis.get(axisId).push(geom);
  });

  // Now validate each axis independently
  for (const [axisId, geoms] of geomsByAxis.entries()) {
    const axis = axisById.get(axisId) || {};
    const stackingRaw = (axis.stacking || "").toLowerCase();
    const isStackedAxis =
      axis.stacked === true || (stackingRaw && stackingRaw !== "none");

    if (!isStackedAxis) continue;

    const uniqueGeoms = [...new Set(geoms)];

    if (uniqueGeoms.length > 1) {
      throw new Error(
        `Invalid config: axis "${axisId}" is stacked, but has multiple geometries: ` +
          uniqueGeoms.join(", ") +
          ". Use a single geom type per stacked axis."
      );
    }
  }
}
