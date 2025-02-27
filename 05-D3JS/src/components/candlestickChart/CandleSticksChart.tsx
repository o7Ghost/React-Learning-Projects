import { data } from "./stockData";
import * as d3 from "d3";
import { StockType } from "./stockData";
import { useEffect, useRef, MouseEvent, useState } from "react";

// TODO: Layout understand this and convert to react
const parseDate = (dateStr: string) => new Date(dateStr);

const getSvgPointRelativeToViewPort = (
  tagRef: SVGSVGElement | null,
  event: MouseEvent<SVGSVGElement, globalThis.MouseEvent>
) => {
  if (!tagRef) {
    return null;
  }

  const pt = tagRef.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;

  return pt.matrixTransform(tagRef.getScreenCTM()?.inverse());
};

/**
 * // need to understand location first
   let dateWidth = this.#zoomRange2 - this.#zoomRange1; // current side which represent by date

    let width = document.getElementById(`${this.#objectIDs.candleContainerId}`)
      .width.baseVal.value; // width of the container

    // location is the x point on the svg ( is the moved location )
    let fraction = location / width; // what is fraction represent??
    // if width is window size
    // what is location??
    // fraction * dateWidth meant much relative date window size moved;

    let newZoomRange1 = this.#panTargetDate - fraction * dateWidth; // pan starting location (y) on the grid
    let newZoomRange2 = newZoomRange1 + dateWidth; // extend by fix width

    Get all data that's in range of the panning
    let filteredData = this.data.filter((x) => { 
      return (
        parseDate(x.date).getTime() > newZoomRange1 - this.#candleWidthDate &&
        parseDate(x.date).getTime() < newZoomRange2 + this.#candleWidthDate
      );
    });

    // set zoom range
    this.#zoomRange1 = newZoomRange1;
    this.#zoomRange2 = newZoomRange2;

    this.#filteredData = filteredData;
    this.draw();
 */
const handlePan = (
  moveToX: number,
  svgMouseXLocation: number,
  xZoomRange1: number,
  XZoomRange2: number,
  svgContainerWidth: number,
  dateRange: StockType[],
  candleWidthDate: number
) => {
  const xAxisDateWidth = XZoomRange2 - xZoomRange1;
  const movedPercentage = moveToX / svgContainerWidth;
  const newXRange1 = svgMouseXLocation - movedPercentage * xAxisDateWidth;
  const newXRange2 = newXRange1 + xAxisDateWidth;

  const newDataRange = dateRange.filter((x) => {
    return (
      parseDate(x.date).getTime() > newXRange1 - candleWidthDate &&
      parseDate(x.date).getTime() < newXRange2 + candleWidthDate
    );
  });

  return { newXRange1, newXRange2, newDataRange };
};

// find the min distance between two times and use that as r width
const calculateCandleWidthDate = (filteredData: StockType[]) => {
  const times = filteredData.map((x) => x.date).sort();
  let indexes = [0, 1];
  let min = parseDate(times[1]).getTime() - parseDate(times[0]).getTime();

  for (let i = 1; i < times.length; i++) {
    if (
      parseDate(times[i + 1]).getTime() - parseDate(times[i]).getTime() <
      min
    ) {
      min = parseDate(times[i + 1]).getTime() - parseDate(times[i]).getTime();
      indexes = [i, i + 1];
    }
  }

  let rWidth =
    parseDate(times[indexes[1]]).getTime() -
    parseDate(times[indexes[0]]).getTime();
  // this.#candleLockerWidthDate = rWidth;
  rWidth -= rWidth * 0.3;
  // this.#candleWidthDate = rWidth;
  return rWidth;
};

const getStyles = () => {
  const maxPrice: number = d3.max(data.map((x) => x.high)) ?? 0;
  const decimal = 3;
  const charWidth = 7.8; //TODO: not sure what this does yet...
  const yLabelWidth =
    2.5 + maxPrice.toFixed(decimal).toString().length * charWidth; // TODO: not sure what this does
  const width = 1000;
  const height = 1000 - 50;
  const paddingLeft = 25;
  const paddingTop = 10;
  const paddingBottom = 30;
  const paddingRight = yLabelWidth;
  const minMaxDate = d3.extent(data.map((x) => parseDate(x.date)));
  const candleWidthDate = calculateCandleWidthDate(data);
  const candleTailWidth = 1;

  console.log("padding", width - (paddingLeft + paddingRight) - 2);

  return {
    width, // container screen width
    height, // container screen height
    paddingLeft, // container screen left padding
    paddingTop, // container screen right padding
    paddingBottom, // container screen bottom padding
    paddingRight, // container screen right padding
    yLabelWidth,
    svgWidth: width - (paddingLeft + paddingRight) - 2,
    svgHeight: height - (paddingTop + paddingBottom + 6),
    xZoomRange1: (minMaxDate[0]?.getTime() as number) - candleWidthDate / 2,
    xZoomRange2: (minMaxDate[1]?.getTime() as number) - candleWidthDate / 2,
    candleTailWidth,
    upCandlesTail: "#089981",
    downCandlesTail: "#e13443",
    upCandlesStroke: "#089981",
    downCandlesStroke: "#e13443",
    candleWidthDate,
  };
};

const styles = getStyles();

// export const config = (width, height) => {
//     return {
//       width: width,
//       height: height,
//       candleTailWidth: 1,
//       paddingLeft: 25,
//       paddingTop: 10,
//       paddingBottom: 30,
//       yPaddingScaleTop: 0.04,
//       yPaddingScaleBottom: 0.03,
//       xTicksTransform: 10,
//       xLabelWidth: 150,
//       xLabelHeight: 25,
//       xLabelFontSize: 12,
//       yLabelHeight: 25,
//       yLabelFontSize: 12,
//       decimal: 3,
//       charWidth: 7.8,
//       selectoreStrokeDashArray: '2,2',
//       timeFormat: "%a %d %b '%y %H:%M",
//       mobileBreakPoint:600,
//       //calcualte after set data//
//       infoTextWidth: undefined,
//       infoTextWidthMeta: undefined,
//       yLabelWidth: undefined,
//       paddingRight: undefined,
//       svgWidth: undefined,
//       svgHeight: undefined,
//     };
//   };

export const CandleSticksChart = () => {
  const xAxis = useRef<SVGGElement | null>(null);
  const yAxis = useRef<SVGGElement | null>(null);
  const candleHighWickContainerRef = useRef<SVGGElement | null>(null);
  const candleStickBodyContainerRef = useRef<SVGGElement | null>(null);
  const candleLowerWickContainerRef = useRef<SVGGElement | null>(null);
  const mainSvgContainerRef = useRef<SVGSVGElement | null>(null);
  const mouseEventRef = useRef<any>({
    isMouseDown: false,
    panTargetedLocationDate: 0,
  });
  const [zoomRange, setZoomRange] = useState({
    xZoomRange1: styles.xZoomRange1,
    xZoomRange2: styles.xZoomRange2,
    dataRange: data,
  });

  const xScale = d3.scaleTime(
    [zoomRange.xZoomRange1, zoomRange.xZoomRange2],
    [0, styles.svgWidth]
  );

  const yAxisDomain = d3
    .extent([
      ...(zoomRange.dataRange.map((x) => x.high) ?? 0),
      ...(zoomRange.dataRange.map((x) => x.low) ?? 1),
    ])
    .reverse() as [number, number];

  const yScale = d3.scaleLinear(yAxisDomain, [0, styles.svgHeight]);

  useEffect(() => {
    if (xAxis.current) {
      d3.select(xAxis.current)
        .call(
          d3
            .axisBottom(xScale)
            .ticks(styles.svgWidth / 100)
            .tickSize(styles.svgHeight)
        )
        .select(".domain")
        .remove();
    }

    if (yAxis.current) {
      // console.log("width", styles.svgWidth);
      d3.select(yAxis.current)
        .call(d3.axisRight(yScale).tickSize(styles.svgWidth))
        .select(".domain")
        .remove();
    }

    if (candleHighWickContainerRef.current) {
      d3.select(candleHighWickContainerRef.current)
        .selectAll()
        .data(zoomRange.dataRange)
        .enter()
        .append("rect")
        .attr("width", styles.candleTailWidth)
        .attr("height", (d) => {
          return d.open > d.close
            ? yScale(d.open) - yScale(d.high)
            : yScale(d.close) - yScale(d.high);
        })
        .attr("x", (d) => {
          return xScale(parseDate(d.date)) - styles.candleTailWidth / 2;
        })
        .attr("y", (d) => {
          return yScale(d.high);
        })
        .attr("fill", (d) =>
          d.open < d.close ? styles.upCandlesTail : styles.downCandlesTail
        );
    }

    if (candleStickBodyContainerRef.current) {
      d3.select(candleStickBodyContainerRef.current)
        .selectAll()
        .data(zoomRange.dataRange)
        .enter()
        .append("rect")
        .attr("width", 5)
        .attr("height", (d) => {
          return d.open > d.close
            ? yScale(d.close) - yScale(d.open)
            : yScale(d.open) - yScale(d.close);
        })
        .attr("x", (d) => {
          return xScale(parseDate(d.date)) - 5 / 2;
        })
        .attr("y", (d) => {
          return d.open > d.close ? yScale(d.open) : yScale(d.close);
        })
        .attr("stroke", (d) => {
          return d.open > d.close
            ? styles.downCandlesStroke
            : styles.upCandlesStroke;
        })
        .attr("fill", (d) =>
          d.open < d.close ? styles.upCandlesTail : styles.downCandlesTail
        );
    }

    if (candleLowerWickContainerRef.current) {
      d3.select(candleLowerWickContainerRef.current)
        .selectAll()
        .data(zoomRange.dataRange)
        .enter()
        .append("rect")
        .attr("width", styles.candleTailWidth)
        .attr("height", (d) => {
          return d.open > d.close
            ? yScale(d.low) - yScale(d.close)
            : yScale(d.low) - yScale(d.open);
        })
        .attr("x", (d) => {
          return xScale(parseDate(d.date)) - styles.candleTailWidth / 2;
        })
        .attr("y", (d) => {
          return d.open > d.close ? yScale(d.close) : yScale(d.open);
        })
        .attr("fill", (d) =>
          d.open < d.close ? styles.upCandlesTail : styles.downCandlesTail
        );
    }
  }, [
    xAxis,
    xScale,
    yAxis,
    yScale,
    candleHighWickContainerRef,
    candleStickBodyContainerRef,
  ]);

  useEffect(() => {
    if (mainSvgContainerRef.current) {
    }

    console.log(
      "what is current",
      mainSvgContainerRef?.current?.width?.baseVal?.value
    );
  }, [mainSvgContainerRef]);

  return (
    <div
      id="main"
      style={{
        height: styles.height,
        width: styles.width,
        display: "inline-block",
      }}
    >
      <svg
        style={{
          height: styles.svgHeight,
          width: styles.svgWidth,
          overflow: "inherit",
          cursor: "crosshair",
        }}
        onMouseUp={() => {
          mouseEventRef.current.isMouseDown = false;
          mouseEventRef.current.panTargetedLocationDate = 0;
        }}
        onMouseMove={(e) => {
          if (mouseEventRef.current.isMouseDown) {
            const svgCoordinates = getSvgPointRelativeToViewPort(
              mainSvgContainerRef.current,
              e
            );

            if (svgCoordinates?.x && mainSvgContainerRef?.current) {
              const newDataRanges = handlePan(
                svgCoordinates?.x,
                mouseEventRef.current.panTargetedLocationDate,
                zoomRange.xZoomRange1,
                zoomRange.xZoomRange2,
                mainSvgContainerRef?.current?.width?.baseVal?.value,
                zoomRange.dataRange,
                styles.candleWidthDate
              );

              setZoomRange({
                xZoomRange1: newDataRanges.newXRange1,
                xZoomRange2: newDataRanges.newXRange2,
                dataRange: newDataRanges.newDataRange,
              });
              // console.log(newDataRanges);
            }
          }
        }}
        onMouseDown={(e) => {
          mouseEventRef.current.isMouseDown = true;
          const svgCoordinates = getSvgPointRelativeToViewPort(
            mainSvgContainerRef.current,
            e
          );

          if (svgCoordinates?.x) {
            mouseEventRef.current.panTargetedLocationDate = xScale
              .invert(svgCoordinates.x)
              .getTime();
          }
        }}
        ref={mainSvgContainerRef}
      >
        <g ref={xAxis} transform={`translate(0, 10)`} />
        <g ref={yAxis} transform={`translate(5, 0)`} />
        <g ref={candleHighWickContainerRef} />
        <g ref={candleStickBodyContainerRef} />
        <g ref={candleLowerWickContainerRef} />
      </svg>
    </div>
  );
};
