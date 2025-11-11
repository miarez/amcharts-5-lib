// src/builders/Chart.js

import { Theme } from "./Theme.js";
import { Legend } from "./Legend.js";
import { Cursor } from "./Cursor.js";
import { Scrollbars } from "./Scrollbars.js";

export class Chart {
  constructor() {
    this._config = {
      type: null, // e.g. "mixed_series", "line", "pie_basic"
      container: null, // HTML container id
      dataLoader: null, // { type, url, delimiter, ... }
      engine: null, // XY/Radial/etc config object

      // these can be explicitly set via builders,
      // but will be defaulted via their own builders if left null
      theme: null,
      legend: null,
      cursor: null,
      scrollbars: null,
    };
  }

  // --- CORE ---

  type(chartType) {
    this._config.type = chartType;
    return this;
  }

  htmlContainer(id) {
    this._config.container = id;
    return this;
  }

  dataLoader(options = {}) {
    this._config.dataLoader = { ...options };
    return this;
  }

  engine(engineConfig) {
    if (!engineConfig) {
      throw new Error("engine() requires a config object (e.g. XY.build()).");
    }
    this._config.engine = { ...engineConfig };
    return this;
  }

  // --- THEME / LEGEND / CURSOR / SCROLLBARS ---

  theme(input) {
    if (!input) return this;

    const theme = input instanceof Theme ? input.build() : { ...input };

    this._config.theme = theme;
    return this;
  }

  legend(input) {
    if (!input) return this;

    const legend = input instanceof Legend ? input.build() : { ...input };

    this._config.legend = legend;
    return this;
  }

  cursor(input) {
    if (!input) return this;

    const cursor = input instanceof Cursor ? input.build() : { ...input };

    this._config.cursor = cursor;
    return this;
  }

  scrollbars(input) {
    if (!input) return this;

    const scrollbars =
      input instanceof Scrollbars ? input.build() : { ...input };

    this._config.scrollbars = scrollbars;
    return this;
  }

  // --- OUTPUT ---

  build() {
    const { container, dataLoader, engine } = this._config;

    if (!container) {
      throw new Error("htmlContainer() must be set before build().");
    }
    if (!dataLoader) {
      throw new Error("dataLoader() must be set before build().");
    }
    if (!engine) {
      throw new Error("engine() must be set before build().");
    }

    // default any unset builders using their own defaults
    const theme = this._config.theme ?? new Theme().build();
    const legend = this._config.legend ?? new Legend().build();
    const cursor = this._config.cursor ?? new Cursor().build();
    const scrollbars = this._config.scrollbars ?? new Scrollbars().build();

    return {
      type: this._config.type,
      container,
      dataLoader,
      engine,
      theme,
      legend,
      cursor,
      scrollbars,
    };
  }
}
