# Proposed Directory Structure For the Future

```
builder/
  index.js                 # exports the Builder namespace (public API)

  utils/
    text.js                # e.g. titleCase, slugify
    merge.js               # shallow/deep merge helpers etc.

  chart/                   # chart-level shell (engine-agnostic)
    Chart.js               # wraps engine config + theme + data + components
    Theme.js               # Theme builder (mode, background, animated...)
    Legend.js              # Legend builder
    Cursor.js              # Cursor builder
    Scrollbars.js          # Scrollbars builder (x/y)
    DataSource.js          # (later) builder for dataLoader: csv/json/api, etc.

  axes/                    # axis builders shared across engines
    AxisBase.js            # common id/position/title/grid
    CategoryAxis.js        # XY: categorical
    ValueAxis.js           # XY/Radial: numeric
    DateAxis.js            # XY: time-based
    AngleAxis.js           # Radial: angle axis (optional later)
    RadiusAxis.js          # Radial: radius axis (optional later)

  series/                  # series-level builders
    SeriesBase.js          # common: field, name, color, etc.
    XYSeries.js            # our current Series (field, geom, axis)
    RadialSeries.js        # (later) for radar/polar series
    PieSliceSeries.js      # (later) for pie/donut slices
    HierarchyNodeSeries.js # (later) for treemap/sunburst/force trees

  engines/                 # engine-level config builders
    xy/
      XY.js                # current XY engine builder (categoryField, axes, series)
      MultiAxisXY.js       # (later) specializations if needed
    radial/
      Radial.js            # radar / polar circular series
      Gauge.js             # gauge-style radial configs
    pie/
      Pie.js               # pie/donut/nested pie
    hierarchy/
      Hierarchy.js         # treemap, sunburst, force tree
    map/
      Geo.js               # (future) choropleth, bubble map, flows
    flow/
      Flow.js              # (future) sankey, chord, dependency flows

  playground/
    test.js                # where you’re doing your cd(xyConfig) experiments

```
