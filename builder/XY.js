// XY.js
import { AxisBase, CategoryAxis, ValueAxis } from "./Axis.js";
import { Series } from "./Series.js";

export class XY {
  constructor() {
    // x: category x-axis
    const defaultXAxis = new CategoryAxis("x").build();
    // y: primary value axis
    const defaultYAxis = new ValueAxis("y").build();

    // inject orientation defaults here
    if (!defaultXAxis.position) defaultXAxis.position = "bottom";
    if (!defaultYAxis.position) defaultYAxis.position = "left";

    this._config = {
      engineType: "XY",
      chartType: null,
      categoryField: null,
      axes: {
        x: defaultXAxis,
        y: [defaultYAxis],
      },
      series: [],
    };
  }

  chartType(chartType) {
    this._config.chartType = chartType;
    return this;
  }

  category(field) {
    this._config.categoryField = field;
    return this;
  }

  // X axis modifier (never changes id, respects existing position) MEOW
  xAxis(input = {}) {
    const raw = input instanceof AxisBase ? input.build() : input;

    const { id: _ignored, ...rest } = raw;

    Object.assign(this._config.axes.x, rest);

    // ensure we always have a position
    if (!this._config.axes.x.position) {
      this._config.axes.x.position = "bottom";
    }

    return this;
  }

  // Y axis upsert by id
  yAxis(input = {}) {
    const raw = input instanceof AxisBase ? input.build() : input;
    const id = raw.id;
    if (!id) {
      throw new Error("yAxis requires an 'id' (e.g. 'y', 'y2').");
    }

    const yAxes = this._config.axes.y;
    const existing = yAxes.find((a) => a.id === id);

    if (existing) {
      Object.assign(existing, raw);
      // preserve existing position unless user explicitly set one
      if (!existing.position) {
        existing.position = id === "y" ? "left" : "right";
      }
    } else {
      const position =
        raw.position ||
        (id === "y" ? "left" : yAxes.length === 0 ? "left" : "right");

      yAxes.push({
        id,
        type: raw.type || "value", // raw object fallback
        position,
        ...raw,
      });
    }

    return this;
  }

  addSeries(seriesBuilder) {
    if (!(seriesBuilder instanceof Series)) {
      throw new Error("addSeries expects a Series instance.");
    }
    const built = seriesBuilder.build();
    this._config.series.push(built);
    return this;
  }

  build() {
    if (!this._config.categoryField) {
      throw new Error("categoryField must be set.");
    }
    if (!this._config.series.length) {
      throw new Error("At least one series must be added.");
    }

    const categoryField = this._config.categoryField;
    const defaultXAxisId = this._config.axes.x?.id || "x";

    // auto-create missing Y axes referenced in series.axis
    const existingYIds = new Set(this._config.axes.y.map((a) => a.id));
    const usedAxisIds = new Set(this._config.series.map((s) => s.axis || "y"));

    usedAxisIds.forEach((axisId) => {
      if (!existingYIds.has(axisId)) {
        const axis = new ValueAxis(axisId).build();
        if (!axis.position) {
          axis.position = this._config.axes.y.length === 0 ? "left" : "right";
        }
        this._config.axes.y.push(axis);
        existingYIds.add(axisId);
      }
    });

    const normalizedSeries = this._config.series.map((s) => ({
      ...s,
      axis: s.axis || "y",
      xField: s.xField || categoryField,
      xAxisId: s.xAxisId || defaultXAxisId,
    }));

    return {
      ...this._config,
      series: normalizedSeries,
    };
  }
}
