const cd = (val) => console.dir(val, { depth: null });

import { XY } from "./XY.js";
import { Series } from "./Series.js";
import { CategoryAxis, ValueAxis, DateAxis } from "./Axis.js";

const xyConfig = new XY()
  .category("month")
  .xAxis(new DateAxis("x").title("Months of the Year").grid(false))
  .addSeries(new Series("revenue").geom("line"))
  .addSeries(new Series("gp_l7").geom("column").axis("y2"))
  .addSeries(new Series("gp_l8_14").geom("column").axis("y2"))
  .yAxis(new ValueAxis("y2").min(100).max(500).title("Margin"))
  .build();

cd(xyConfig);
