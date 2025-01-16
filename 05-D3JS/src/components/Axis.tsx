import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";

// using use axisbottom api
export const AxisV2 = ({
  domain = [0, 100],
  range = [0, 600],
}: {
  domain?: [number, number];
  range?: [number, number];
}) => {
  const ax = useRef<any>(null);

  const width = range[1] - range[0];
  const pixelsPerTick = 30;

  const numberOfTicksTarget = Math.max(1, Math.floor(width / pixelsPerTick));
  const xScale = d3.scaleLinear(domain, range);

  useEffect(() => {
    if (ax.current) {
      d3.select(ax.current)
        .transition()
        .duration(100)
        .call(d3.axisBottom(xScale).ticks(numberOfTicksTarget));
    }
  }, [ax, xScale]);

  return (
    <svg style={{ overflow: "visible" }}>
      <g ref={ax} transform={`translate(0,0)`} />
    </svg>
  );
};

export const Axis = ({
  domain = [0, 100],
  range = [0, 500],
}: {
  domain?: any;
  range?: any;
}) => {
  const ticks = useMemo(() => {
    const xScale = d3.scaleLinear().domain(domain).range(range);

    const width = range[1] - range[0];
    const pixelsPerTick = 30;

    const numberOfTicksTarget = Math.max(1, Math.floor(width / pixelsPerTick));

    return xScale
      .ticks(numberOfTicksTarget)
      .map((value) => ({ value, xOffset: xScale(value) }));
  }, [domain, range]);

  return (
    <svg height={30} style={{ overflow: "visible" }}>
      <path
        //   d="M 9.5 0.5 H 290.5"
        d={["M", range[0], 6, "v", -6, "H", range[1], "v", 6].join(" ")}
        stroke="currentColor"
        fill="none"
      />
      {ticks.map(({ value, xOffset }) => (
        <g key={value} transform={`translate(${xOffset}, 0)`}>
          <line y2="6" stroke="currentColor" />
          <text
            key={value}
            style={{
              fontSize: "10px",
              textAnchor: "middle",
              transform: "translateY(20px)",
            }}
          >
            {value}
          </text>
        </g>
      ))}
    </svg>
  );
};
