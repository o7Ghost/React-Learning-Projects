import * as d3 from "d3";
import { useEffect, useRef } from "react";

const margin = { top: 30, right: 30, bottom: 50, left: 50 };

const width = 700 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

export const TimeSeriesPlot = () => {
  const xAxis = useRef<any>(null);
  const yAxis = useRef<any>(null);

  const xScale = d3.scaleTime(
    [new Date("2020-12-01"), new Date("2023-06-01")],
    [0, width]
  );

  const yScale = d3.scaleLinear([0, 10], [height, 0]);

  useEffect(() => {
    if (xAxis.current) {
      d3.select(xAxis.current).call(
        d3.axisBottom(xScale).ticks(8, d3.timeFormat("%b %y"))
      );
    }
  }, [xAxis, xScale]);

  useEffect(() => {
    if (yAxis.current) {
      d3.select(yAxis.current).call(d3.axisLeft(yScale));
    }
  }, [yAxis, yScale]);

  return (
    <div>
      <svg width={1000} height={1000} style={{ display: "inline-block" }}>
        <g
          ref={xAxis}
          transform={`translate(${[margin.left, 350].join(",")})`}
        />
        <g
          ref={yAxis}
          transform={`translate(${[margin.left, margin.top].join(",")})`}
        />
      </svg>
    </div>
  );
};
