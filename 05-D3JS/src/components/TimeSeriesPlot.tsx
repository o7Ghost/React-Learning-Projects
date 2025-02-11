import * as d3 from "d3";
import { useEffect, useRef } from "react";

const margin = { top: 30, right: 30, bottom: 50, left: 50 };

const width = 700 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const data = [
  { x: "2023-01-01", y: 90 },
  { x: "2023-02-01", y: 12 },
  { x: "2023-03-01", y: 34 },
  { x: "2023-04-01", y: 53 },
  { x: "2023-05-01", y: 52 },
  { x: "2023-06-01", y: 9 },
  { x: "2023-07-01", y: 18 },
  { x: "2023-08-01", y: 78 },
  { x: "2023-09-01", y: 28 },
  { x: "2023-12-01", y: 34 },
];

type DataPoint = { x: string; y: number };

const customTimeParser = d3.timeParse("%Y-%m-%d");

export const TimeSeriesPlot = () => {
  const xAxis = useRef<any>(null);
  const yAxis = useRef<any>(null);

  const xScale = d3.scaleTime(
    [new Date("2021-12-01"), new Date("2023-11-31")],
    [0, width]
  );

  const max = d3.max(data, (d) => d.y);
  const yScale = d3.scaleLinear([0, max ?? 0], [height, 0]);

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

  const lineBuilder = d3
    .line<DataPoint>()
    .x((d: DataPoint) => xScale(customTimeParser(d.x) as any))
    .y((d) => yScale(d.y));

  const linePath = lineBuilder(data);

  if (!linePath) {
    return null;
  }

  return (
    <div>
      <svg width={1000} height={1000} style={{ display: "inline-block" }}>
        <g
          width={300}
          height={300}
          transform={`translate(${[margin.left, 380].join(",")})`}
        >
          <path
            d={linePath}
            opacity={1}
            stroke="#9a6fb0"
            fill="none"
            strokeWidth={2}
          />
        </g>
        <g
          ref={xAxis}
          transform={`translate(${[margin.left, 700].join(",")})`}
        />
        <g
          ref={yAxis}
          transform={`translate(${[margin.left, 380].join(",")})`}
        />
      </svg>
    </div>
  );
};
