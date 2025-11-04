# 🐝 amCharts 5 Vibe Coding Project

> **Note:** This README was generated collaboratively by **Stas Pakhomov** and **ChatGPT-5**.  
> It reflects the project’s goals, structure, and philosophy as discussed in our development sessions.

This project is part of my ongoing deep dive into **amCharts 5**, where I'm rebuilding and reimagining chart configurations through a clean, modular architecture — this time with **heavy “vibe coding” via ChatGPT-5**.

---

## 🎯 Project Intent

Over the past few months, I’ve written **multiple amCharts 5 wrappers by hand** — learning all the quirks, patterns, and tradeoffs between flexibility and verbosity.  
While I got great results, each iteration ended up being a little too hard-coded and not as declarative as I wanted.

So this time, I’m starting fresh:

> **Everything should be config-driven, dynamic, and composable.**  
> No chart type or axis should be “baked in” — everything should flow from a schema or builder pattern.

---

## ⚙️ Current Focus

The immediate goal is to build a **Date-based Beeswarm chart** using amCharts 5 — a clean demo that explores:

- how to replace `CategoryAxis` with a `DateAxis`,
- how to apply _jitter_ (small random offsets) to spread overlapping data,
- and how to express all of this through a flexible config builder API.

The long-term goal is to expand the system into a **full chart builder library** that can dynamically interpret a config and render any chart type (XY, multi-axis, scatter, radar, etc.) from CSV or database sources.

---

## 🧩 Architectural Principles

1. **Zero Hardcoding** — names, series, colors, and axes must come from data or config.
2. **Builder Pattern Everywhere** — fluent API for chaining (e.g. `ChartConfigBuilder.xyScatter().container().data().axes()...`).
3. **Composable Builders** — `ChartBuilder`, `AxesBuilder`, `FieldsBuilder`, and `SeriesBuilder` should all be standalone but interoperable.
4. **Type Safety by Convention** — while JS is flexible, configs should be self-validating and human-readable.
5. **Vibe-Driven Iteration** — every component should feel natural to use and tweak interactively.

---

## 🧠 Concepts in Use

- **Beeswarm logic**: create a swarm effect using `jitter` (a small random vertical offset).
- **DateAxis migration**: replace categorical grouping with real-time series plotting.
- **Dynamic data loading**: CSV / DB / JSON driven.
- **Flexible field mapping**: `xField`, `yField`, `radiusField`, and `colorField` should be assignable at runtime.

---

## 🚧 Current Milestone

**Milestone #1:**  
Create a functional beeswarm chart with a `DateAxis` on X and random `jitter` on Y — all defined through a single config file.  
This will serve as the base case for expanding into multi-series and multi-axis systems later.

---

## 💡 Next Steps

- Add schema validation for chart configs
- Build a `ChartRegistry` to auto-instantiate the right chart class
- Implement reusable themes and decorators
- Expand builder syntax to support heatmaps, radial charts, and grouped categories

---

## 🧑‍💻 Author

**Stas Pakhomov**  
A lifelong tinkerer, developer, and data-driven explorer building his own health analytics ecosystem and visualization layer on top of Cloudflare’s edge stack.

---

## 🪄 ChatGPT-5 Collaboration Note

This project is written in close collaboration with **ChatGPT-5**, used not just as a coding assistant but as a true co-pilot for design reasoning, architecture planning, and iteration.  
The focus here is **“vibe coding”** — building by intuition, dialogue, and continuous refinement rather than rigid top-down planning.

---
