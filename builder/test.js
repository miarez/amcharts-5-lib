// test.js (or whatever this file is)

// helper for deep logging
const cd = (val) => console.dir(val, { depth: null });

import { XY } from "./XY.js";
import { Series } from "./Series.js";
import { CategoryAxis, DateAxis, ValueAxis } from "./Axis.js";
import { Chart } from "./Chart.js";

import { Theme } from "./Theme.js";
import { Legend } from "./Legend.js";
import { Cursor } from "./Cursor.js";
import { Scrollbars } from "./Scrollbars.js";

const xyConfig = new XY()
  .category("month")
  .xAxis(new CategoryAxis("x").title("Months of the Year").grid(false))
  .addSeries(new Series("revenue").geom("line"))
  .addSeries(new Series("gp_l7").geom("column").axis("y2"))
  .addSeries(new Series("gp_l8_14").geom("column").axis("y2"))
  .yAxis(new ValueAxis("y2").title("Margin"))
  .build();

const chartConfig = new Chart()
  .type("mixed_series")
  .htmlContainer("chartdiv")
  .dataLoader({
    type: "csv",
    url: "./data/category-columns.csv",
    delimiter: ",",
  })
  .engine(xyConfig)
  // use all four builders with their defaults, no method chaining
  .theme(new Theme())
  .legend(new Legend())
  .cursor(new Cursor())
  .scrollbars(new Scrollbars())
  .build();

cd(chartConfig);
