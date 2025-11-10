// src/families/beeswarm.js
import { applyChartBackground } from "../core/applyChartBackground.js";
import { withCursor } from "../decorators/withCursor.js";
import { withScrollbars } from "../decorators/withScrollBars.js";

export function createBeeswarmChart(root, config) {
  const d3 = window.d3;
  if (!d3) {
    throw new Error(
      "Beeswarm charts require d3 to be loaded (window.d3 is missing)."
    );
  }

  // ----- CHART -----
  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelY: "zoomXY",
      pinchZoomX: true,
      pinchZoomY: true,
    })
  );
  // Hug the container – no extra dead space around the plot
  chart.setAll({
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  });

  applyChartBackground(root, chart, config);

  // ----- AXES -----
  const axesCfg = config.axes || {};
  const xCfg = axesCfg.x || {};
  const yCfg = axesCfg.y || {};

  const xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererX.new(root, {
        minGridDistance: 30,
      }),
      min: xCfg.min ?? undefined,
      max: xCfg.max ?? undefined,
      strictMinMax: xCfg.strictMinMax ?? false,
      // from the demo – tiny padding on both sides
      extraMin: 0.01,
      extraMax: 0.01,
    })
  );

  const yRenderer = am5xy.AxisRendererY.new(root, {
    minGridDistance: 20,
  });

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: yRenderer,
      visible: true,
      strictMinMax: true,
    })
  );

  // Hide only grids, not the axis line itself
  yRenderer.grid.template.set("forceHidden", true);

  // Make sure labels and ticks aren’t being suppressed
  yRenderer.labels.template.setAll({
    visible: true,
    forceHidden: false,
  });

  yRenderer.ticks.template.setAll({
    visible: true,
    forceHidden: false,
  });

  yRenderer.labels.template.set("forceHidden", false);
  xAxis._domainMode = "value";
  xAxis._domainField = config.fields?.x || "x";

  // ----- FIELDS -----
  const xField = config.fields?.x || "x";
  const yField = config.fields?.y || "y";
  const valueField = config.fields?.value || "value";

  // ----- SERIES -----
  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      calculateAggregates: true,
      xAxis,
      yAxis,
      valueXField: xField,
      valueYField: yField,
      valueField, // used by heatRules
    })
  );

  // No connecting line – just bullets
  series.strokes.template.set("visible", false);

  // Bullet appearance
  const circleTemplate = am5.Template.new({});

  series.bullets.push(() => {
    const bulletCircle = am5.Circle.new(
      root,
      {
        radius: 5,
        fill: series.get("fill"),
        fillOpacity: 0.8,
        tooltipText: `{${xField}}`,
        tooltipY: 0,
      },
      circleTemplate
    );

    bulletCircle.states.create("hover", {
      fill: chart.get("colors").getIndex(4),
    });

    return am5.Bullet.new(root, {
      sprite: bulletCircle,
    });
  });

  // Heat rule: radius based on valueField
  const minRadius =
    config.options?.minRadius !== undefined ? config.options.minRadius : 2;
  const maxRadius =
    config.options?.maxRadius !== undefined ? config.options.maxRadius : 9;

  series.set("heatRules", [
    {
      target: circleTemplate,
      min: minRadius,
      max: maxRadius,
      dataField: valueField,
      key: "radius",
    },
  ]);

  // ----- DATA -----
  const data = Array.isArray(config.data) ? config.data : [];
  // --- Auto-fit axes to data ---

  let xMin = Infinity;
  let xMax = -Infinity;

  for (const row of data) {
    const v = Number(row[xField]);
    if (!Number.isNaN(v)) {
      if (v < xMin) xMin = v;
      if (v > xMax) xMax = v;
    }
  }

  // small padding so circles don’t touch chart edge
  if (xMin < Infinity) {
    const padding = (xMax - xMin) * 0.02; // 2% on each side
    xAxis.setAll({
      min: xMin - padding,
      max: xMax + padding,
      strictMinMax: true,
      extraMin: 0,
      extraMax: 0,
    });
  }

  // For Y: points are centered around 0 and D3 moves them vertically,
  // so we just want a tight symmetric range around 0.
  // This keeps the vertical plot area compact.
  const verticalExtent = (config.options?.maxRadius ?? 9) * 0.8; // tweak factor if you like

  yAxis.setAll({
    min: -verticalExtent,
    max: verticalExtent,
    strictMinMax: true,
  });
  series.data.setAll(data);

  // ----- D3 FORCE LAYOUT (beeswarm) -----
  const simulation = d3.forceSimulation();
  const collisionForce = d3.forceCollide();
  const nodes = [];

  function updatePositions() {
    if (!nodes.length) return;

    // Actual drawable height of the plot area
    const plotHeight = chart.plotContainer.innerHeight();
    if (!plotHeight) return;

    // Find current simulation vertical extent
    let minY = Infinity;
    let maxY = -Infinity;
    for (const node of nodes) {
      if (node.y < minY) minY = node.y;
      if (node.y > maxY) maxY = node.y;
    }
    const span = maxY - minY || 1;

    // Target: use ~70% of available vertical space
    const targetSpan = plotHeight * 0.7;
    const scale = targetSpan / span;

    const simMid = (minY + maxY) / 2;
    const plotMid = plotHeight / 2;

    am5.array.each(nodes, function (node) {
      const circle = node.circle;

      // Rescale simulation y into the plot band
      const scaledY = (node.y - simMid) * scale + plotMid;

      // dy is relative offset from the chart’s own y
      circle.setAll({
        dy: scaledY - circle.y(),
      });

      // lock x so only vertical jitter happens
      node.fx = circle.x();
    });
  }

  simulation.on("tick", updatePositions);

  function addNode(dataItem) {
    const bullets = dataItem.bullets;
    if (!bullets || !bullets.length) return;

    const bullet = bullets[0];
    const circle = bullet.get("sprite");
    if (!circle) return;

    const node = {
      fx: circle.x(),
      y: circle.y(),
      circle,
    };

    nodes.push(node);
  }

  function updateForces() {
    simulation.force("collision", collisionForce);

    collisionForce.radius(function (node) {
      const circle = node.circle;
      return circle.get("radius", 1) + 1; // +1 padding
    });
  }

  // When data is ready, build nodes and start the simulation
  series.events.on("datavalidated", function () {
    // bullets are created slightly after data; defer
    setTimeout(function () {
      nodes.length = 0; // reset if re-validated
      am5.array.each(series.dataItems, function (dataItem) {
        addNode(dataItem);
      });
      simulation.nodes(nodes);
      updateForces();
      simulation.alpha(1).restart();
    }, 500);
  });

  // Re-run forces when chart bounds change (resize, etc.)
  chart.plotContainer.events.on("boundschanged", function () {
    updateForces();
    simulation.alpha(1).restart();
  });

  // Animations (same as demo)
  chart.appear(1000, 100);

  // ----- DECORATORS -----
  if (config.decorators?.cursor?.enabled) {
    withCursor(root, chart, { domainAxis: xAxis, config });
  }

  if (config.decorators?.scrollbarX?.enabled) {
    withScrollbars(root, chart, { axis: "x" });
  }

  // ----- RETURN CONTEXT -----
  return {
    root,
    chart,
    series,
    cleanup: () => {
      simulation.stop();
      if (!root.isDisposed()) root.dispose();
    },
  };
}
