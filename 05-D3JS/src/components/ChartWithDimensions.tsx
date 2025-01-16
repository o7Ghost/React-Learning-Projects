import { LegacyRef, useEffect, useMemo, useRef, useState } from "react";
import { ResizeObserver } from "@juggle/resize-observer";
import * as d3 from "d3";
import { Axis, AxisV2 } from "./Axis";

type Dimension = {
  width?: number;
  height?: number;
  marginLeft?: number;
  marginRight?: number;
  marginBottom?: number;
  marginTop?: number;
};

const combineChartDimensions = (dimensions: Dimension) => {
  const parsedDimension = {
    ...dimensions,
    marginTop: dimensions?.marginTop || 10,
    marginRight: dimensions?.marginRight || 10,
    marginBottom: dimensions?.marginBottom || 40,
    marginLeft: dimensions?.marginLeft || 75,
  };

  return {
    ...parsedDimension,
    boundedHeight: Math.max(
      (parsedDimension?.height ?? 0) -
        (parsedDimension.marginTop + parsedDimension.marginBottom),
      0
    ),
    boundedWidth: Math.max(
      (parsedDimension?.width ?? 0) -
        (parsedDimension.marginLeft + parsedDimension.marginRight),
      0
    ),
  };
};

const useChartWithDimensions = (passedSettings: Dimension) => {
  const ref = useRef<any>();
  const dimensions = combineChartDimensions(passedSettings);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      return () => [ref, dimensions] as const;
    }

    const element: any = ref.current;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries)) {
        return;
      }
      if (!entries.length) {
        return;
      }

      const entry = entries[0];

      if (width != entry.contentRect.width) {
        setWidth(entry.contentRect.width);
      }
      if (height != entry.contentRect.height) {
        setHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(element);

    return () => resizeObserver.unobserve(element);
  }, []);

  const newSettings = combineChartDimensions({
    ...dimensions,
    width: dimensions.width || width,
    height: dimensions.height || height,
  });

  return [ref, newSettings] as const;
};

const chartSettings = {};

export const ChartWithDimensions = () => {
  const [ref, dms] = useChartWithDimensions(chartSettings);

  const xScale = useMemo(() => {
    return d3.scaleLinear().domain([0, 100]).range([0, dms.boundedWidth]);
  }, [dms.boundedWidth]);

  console.log(dms.boundedWidth);
  return (
    <div ref={ref} style={{ height: "200px" }}>
      <svg width={dms.width} height={dms.height}>
        <g
          transform={`translate(${[dms.marginLeft, dms.marginTop].join(",")})`}
        >
          <rect
            width={dms.boundedWidth}
            height={dms.boundedHeight}
            fill="lavender"
          />
          <g transform={`translate(${[0, dms.boundedHeight].join(",")})`}>
            <AxisV2 range={[0, dms.boundedWidth]} />
          </g>
        </g>
      </svg>
    </div>
  );
};
