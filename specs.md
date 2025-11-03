# AmCharts 5 Chart Library Specification

## Overview

This document describes the current and planned architecture of the **AmCharts 5 Chart Library**, a modular, config-driven visualization system built around the concept of **chart families**.

The system is designed to provide flexibility, consistency, and scalability across different chart types — all driven by JSON configuration. It abstracts the amCharts 5 API into declarative components that can be reused across multiple chart types (families).

---

## Current Architecture

### Folder Structure

```
src/
├── core/
│   └── createChart.js         # Family router and entry point
├── families/
│   └── xySeries/
│       └── index.js           # xy-series family implementation (lines, columns, areas)
├── xy/
│   ├── axes.js                # Shared XY primitives for domain/value axes
│   └── series.js              # Shared XY primitives for line/column/area series creation
├── shared/
│   ├── loadData.js            # CSV/JSON loader
│   └── colors.js              # Color helpers, parsing utilities
└── decorators/
    ├── withLegend.js
    ├── withCursor.js
    └── withScrollbars.js
```

---

## Family System

A **family** defines the coordinate system and high-level chart logic. Each family can reuse lower-level modules such as decorators or primitives.

| Family | Primary axis types | Typical purpose | Examples |
|---------|--------------------|-----------------|-----------|
| **xy-series** | Domain (date/category) + Value(s) | Cartesian charts | line, column, area, combo |
| **xy-scatter** | Value + Value | Scatter plots, correlation | scatter, bubble |
| **radial-series** | Angle + Radius | Circular/Polar charts | radar, polar area |
| **pie-series** | None (categorical slices) | Pie/donut | pie, donut |
| **category-matrix** | Two discrete axes | Heatmaps, tables | heatmap, matrix |
| **map-series** | Geographic coordinates | Mapping | geo charts |

---

## Core Concepts

### 1. Domain vs. Value Axes

- **Domain Axis** → Defines the X dimension (time or category).
- **Value Axes** → Define numeric Y dimensions (support multiple axes, stacking, and percent stacking).

The domain/value abstraction allows rotation and reuse across different orientations and chart families.

### 2. Orientation

- `orientation: "vertical"` — Domain on X, Values on Y (current supported mode).
- `orientation: "horizontal"` — Future mode; flips domain/value axis mapping.

### 3. Series Types

Each series can define its own visualization type:

```
"type": "line" | "column" | "area"
```

Future: `"scatter" | "bubble" | "radar" | "pie" | "bar"`.

### 4. Axis-Level Stacking

Axis-level stacking modes:

- `"none"` — no stacking (default)
- `"stacked"` — additive stacking
- `"percent"` — normalized (100%) stacking via `calculateTotals`, `valueYShow: "valueYTotalPercent"`

### 5. Series-Level Configuration

Each series can specify:
- `id`: data field name
- `name`: label in legend
- `type`: `"line" | "column" | "area"`
- `valueAxisId`: which value axis to use
- `color`: stroke/fill color

### 6. Decorators

Reusable chart features independent of family logic:
- **withLegend** — Adds a legend
- **withCursor** — Adds an interactive cursor
- **withScrollbars** — Adds scrollbars for large datasets

Future: `withExportMenu`, `withWatermark`, `withA11y`

---

## Configuration Schema (Current)

Example configuration for `xy-series`:

```json
{
  "family": "xy-series",
  "container": "chartdiv",
  "orientation": "vertical",
  "data": { "type": "csv", "url": "./data/line-data.csv" },

  "axes": {
    "domain": { "mode": "date", "field": "date" },
    "values": [
      { "id": "left",  "position": "left",  "stacking": "percent" },
      { "id": "right", "position": "right", "stacking": "none" }
    ]
  },

  "fields": {
    "domain": "date",
    "series": [
      { "id": "value1", "name": "Left Column A", "type": "column", "valueAxisId": "left",  "color": "#FF6B6B" },
      { "id": "value2", "name": "Left Column B", "type": "column", "valueAxisId": "left",  "color": "#4FC3F7" },
      { "id": "value3", "name": "Right Line",    "type": "line",   "valueAxisId": "right", "color": "#FFD93D" },
      { "id": "value4", "name": "Right Area",    "type": "area",   "valueAxisId": "right", "color": "#00E676" }
    ]
  },

  "decorators": {
    "legend": { "enabled": true },
    "cursor": { "enabled": true },
    "scrollbarX": { "enabled": true }
  },

  "theme": { "animated": true }
}
```

---

## Architectural Layers

| Layer | Purpose | Example files |
|--------|----------|---------------|
| **core/** | Entry point, chart registry, lifecycle management | `createChart.js` |
| **xy/** | Shared primitives for all Cartesian families | `axes.js`, `series.js` |
| **families/** | Chart family definitions using primitives | `families/xySeries/index.js` |
| **shared/** | Stateless utilities | `loadData.js`, `colors.js` |
| **decorators/** | Cross-family optional components | `withLegend.js`, `withCursor.js` |

---

## Rendering Flow

1. **`createChart(config)`** → loads config, routes by family.  
2. **Family entry (`createXYSeriesChart`)** → builds chart root and container.  
3. **`createAxes`** → constructs domain and value axes.  
4. **`createSeriesForXY`** → builds all series from config.  
5. **Decorators** → attach legend, cursor, scrollbars.  
6. Chart rendered into target container.

---

## Current Family: xy-series

- Handles **date** and **category** domain modes.  
- Supports **multi-axis** layouts with left/right positioning.  
- Implements **line**, **column**, and **area** series.  
- Supports **stacking** and **percent stacking** at the axis level.  
- Fully driven by configuration; no hardcoded data keys.

---

## Future Families (Scaffolding in progress)

| Family | Notes |
|---------|--------|
| **xy-scatter** | Value–value plots (scatter, bubble) sharing XY primitives |
| **radial-series** | Radar and polar charts (angle/radius) |
| **pie-series** | Pie and donut charts (category-based) |
| **category-matrix** | Heatmaps / matrix visualizations (two categorical axes) |
| **map-series** | Geographic visualizations built on amCharts MapChart |

---

## Data Loading

- Data defined in config as CSV or JSON.  
- Parsed by `shared/loadData.js` into an array of records.  
- Series automatically bind to fields by `id`.

---

## Summary

The library is now a modular, config-driven chart system structured around **families**, **shared primitives**, and **decorators**.  
It currently supports the full `xy-series` (time/category) family with dynamic domain/value axes, stacking, and mixed series types.

Future development will extend this base with additional families (scatter, radial, pie, matrix, map) while keeping the same declarative configuration model.
