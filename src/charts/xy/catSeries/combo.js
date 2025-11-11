// src/charts/mixedSeriesXY.js

// config:
// - config.engine.type === "XY"
// - config.engine.axes.x { type: "date" | "category", ... }
// - config.engine.axes.y: array of value axes
// - config.engine.series: array of { field, name, geom, axis, xField, xAxisId }

export function createMixedSeriesXYChart(root, config, data) {
  const engine = config.engine || {};
  const axesCfg = engine.axes || {};

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      layout: root.verticalLayout,
    })
  );

  // X AXIS
  const xCfg = axesCfg.x;
  if (!xCfg) {
    throw new Error("engine.axes.x is required for mixed_series.");
  }

  const xAxis = createXAxis(root, chart, xCfg, engine);

  // Y AXES
  const yAxesById = {};
  const yDefs = Array.isArray(axesCfg.y) ? axesCfg.y : [];

  yDefs.forEach((yCfg, idx) => {
    const id = yCfg.id || `y${idx}`;
    yAxesById[id] = createYAxis(root, chart, yCfg);
  });

  // SERIES
  const seriesDefs = engine.series || [];
  const createdSeries = [];

  seriesDefs.forEach((sCfg) => {
    const yAxis =
      (sCfg.axis && yAxesById[sCfg.axis]) ||
      yAxesById.y ||
      Object.values(yAxesById)[0];

    if (!yAxis) {
      throw new Error(
        `Series "${sCfg.name || sCfg.field}" refers to axis "${
          sCfg.axis
        }", but no matching y axis was found.`
      );
    }

    const series = createSeries(root, chart, xAxis, yAxis, engine, sCfg, data);
    createdSeries.push(series);
  });

  return { root, chart, series: createdSeries };
}

function createXAxis(root, chart, cfg, engine) {
  const position = cfg.position === "top" ? "top" : "bottom";

  if (cfg.type === "date") {
    const renderer = am5xy.AxisRendererX.new(root, {
      opposite: position === "top",
      minGridDistance: 40,
    });

    const axis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        renderer,
        baseInterval: cfg.baseInterval || { timeUnit: "month", count: 1 },
      })
    );

    if (cfg.title) {
      axis.children.push(
        am5.Label.new(root, {
          text: cfg.title,
          paddingTop: 8,
        })
      );
    }

    return axis;
  }

  if (cfg.type === "category") {
    const renderer = am5xy.AxisRendererX.new(root, {
      opposite: position === "top",
      minGridDistance: 40,
    });

    const axis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        renderer,
        categoryField: engine.categoryField || cfg.categoryField || "category",
      })
    );

    if (cfg.title) {
      axis.children.push(
        am5.Label.new(root, {
          text: cfg.title,
          paddingTop: 8,
        })
      );
    }

    // For category axis, set data from engine.categoryField
    const catField = engine.categoryField || cfg.categoryField;
    if (catField) {
      axis.data.setAll(
        (engine._dataForCategories || []).map((row) => ({
          category: row[catField],
        }))
      );
    }

    return axis;
  }

  throw new Error(`Unsupported x axis type: ${cfg.type}`);
}

function createYAxis(root, chart, cfg) {
  const position = cfg.position === "right" ? "right" : "left";

  const renderer = am5xy.AxisRendererY.new(root, {
    opposite: position === "right",
  });

  const axis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer,
      min: cfg.min,
      max: cfg.max,
    })
  );

  if (cfg.title) {
    axis.children.push(
      am5.Label.new(root, {
        text: cfg.title,
        paddingBottom: 8,
      })
    );
  }

  return axis;
}

function createSeries(root, chart, xAxis, yAxis, engine, sCfg, data) {
  const geom = sCfg.geom || "line";
  const valueField = sCfg.field;
  const xField = sCfg.xField || engine.categoryField;

  if (!valueField) {
    throw new Error("Series missing `field` (valueYField).");
  }

  let series;

  if (geom === "line") {
    series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: sCfg.name || valueField,
        xAxis,
        yAxis,
        valueYField: valueField,
        valueXField: xField,
        tooltip: am5.Tooltip.new(root, {
          labelText: "{name}: {valueY}",
        }),
      })
    );
  } else if (geom === "column") {
    series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: sCfg.name || valueField,
        xAxis,
        yAxis,
        valueYField: valueField,
        valueXField: xField,
        clustered: true,
        tooltip: am5.Tooltip.new(root, {
          labelText: "{name}: {valueY}",
        }),
      })
    );
  } else {
    throw new Error(`Unsupported geom "${geom}" in mixed_series.`);
  }

  series.data.setAll(data);
  return series;
}
