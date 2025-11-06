// src/families/forceTree.js
import { withLegend } from "../decorators/withLegend.js";
import { applyChartBackground } from "../core/applyChartBackground.js";

// root is injected from createChart(config)
export function createForceTreeChart(root, config) {
  const options = config.options || {};
  const fields = config.fields || {};

  const categoryField = fields.category || "name";
  const valueField = fields.value || "value";
  const childrenField = fields.children || "children";
  const colorField = fields.color || null;

  const rawData = config.data;

  // ForceDirected expects an array of root nodes
  let rootNodes;
  if (Array.isArray(rawData)) {
    rootNodes = rawData;
  } else if (rawData && typeof rawData === "object") {
    rootNodes = [rawData];
  } else {
    rootNodes = [];
  }

  // Treat the root container as the "chart" for this family
  const chart = root.container;

  // Background, same as other families
  applyChartBackground(root, chart, config);

  // Optional title
  if (options.title) {
    chart.children.push(
      am5.Label.new(root, {
        text: options.title,
        fontSize: 16,
        fontWeight: "600",
        x: am5.p50,
        centerX: am5.p50,
        paddingBottom: 8,
      })
    );
  }

  const series = chart.children.push(
    am5hierarchy.ForceDirected.new(root, {
      valueField,
      categoryField,
      childDataField: childrenField,
      minRadius: options.minRadius ?? 10,
      maxRadius: options.maxRadius ?? 40,
      centerStrength: options.centerStrength ?? 0.8,
      manyBodyStrength: options.manyBodyStrength ?? -20,
    })
  );

  // Data
  series.data.setAll(rootNodes);

  // Optional color field
  if (colorField) {
    series.nodes.template.adapters.add("fill", (fill, target) => {
      const d = target.dataItem?.dataContext;
      if (d && d[colorField]) {
        return am5.color(d[colorField]);
      }
      return fill;
    });
  }

  // Basic node/label styling so it doesn't silently render super-plain
  series.nodes.template.setAll({
    tooltipText: `{${categoryField}}: {${valueField}}`,
    cursorOverStyle: "pointer",
  });

  series.labels.template.setAll({
    text: `{${categoryField}}`,
    fontSize: 11,
  });

  // Optional legend (off by default, same pattern as other families)
  const legendEnabled = config.decorators?.legend?.enabled ?? false;
  if (legendEnabled) {
    withLegend(root, chart, { series: [series] });
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
