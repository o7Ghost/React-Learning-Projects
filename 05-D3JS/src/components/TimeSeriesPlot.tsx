import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/web";

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

type CursorProps = {
  x: number | null;
  y: number;
  height: number;
  color: string;
};

const Cursor = ({ x, y, height, color }: CursorProps) => {
  const springProps = useSpring({
    to: {
      x,
      y,
    },
  });

  if (!springProps.x) {
    return null;
  }

  const xAxix = springProps.x as any;

  return (
    <>
      <animated.line
        x1={xAxix}
        x2={xAxix}
        y1={0}
        y2={height}
        stroke="black"
        strokeWidth={1}
      />
      <circle cx={x ?? 0} cy={y} r={5} fill={color} />
    </>
  );
};

export const TimeSeriesPlot = () => {
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const xAxis = useRef<any>(null);
  const yAxis = useRef<any>(null);

  const xScale = d3.scaleTime(
    [new Date("2021-12-01"), new Date("2023-11-31")],
    [0, width]
  );

  const max = d3.max(data, (d) => d.y);
  const yScale = d3.scaleLinear([0, max ?? 0], [height, 0]);

  const getClosestPoint = (cursorPosition: number) => {
    // Given a value from the range,
    // returns the corresponding value from the domain
    const x = xScale.invert(cursorPosition) as any;

    // console.log("invert", x);
    // console.log("regular", cursorPosition);

    let minDistance = Infinity;
    let closest: DataPoint | null = null;

    for (const point of data) {
      // Convert both dates to timestamps
      const pointDate = new Date(point.x).getTime();
      const xDate = x.getTime();

      // Calculate the absolute difference in time
      const distance = Math.abs(pointDate - xDate);

      // Check if this point is closer than the previous closest
      if (distance < minDistance) {
        minDistance = distance;
        closest = point;
      }
    }

    return closest;
  };

  const onMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const closest = getClosestPoint(mouseX);

    console.log(xScale(new Date(closest?.x ?? 0)));
    // console.log(xScale(closest.x));

    setCursorPosition(xScale(new Date(closest?.x ?? 0)));
  };

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
          {cursorPosition && (
            <Cursor
              height={height}
              x={cursorPosition}
              y={yScale(getClosestPoint(cursorPosition)?.y ?? 0)}
              color={"#9a6fb0"}
            />
          )}
          <path
            d={linePath}
            opacity={1}
            stroke="#9a6fb0"
            fill="none"
            strokeWidth={2}
          />
          <rect
            x={0}
            y={0}
            width={700}
            height={380}
            onMouseMove={onMouseMove}
            onMouseLeave={() => setCursorPosition(null)}
            visibility={"hidden"}
            pointerEvents={"all"}
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
