import { data } from "./stockData";
import * as d3 from "d3";
import { StockType } from "./stockData";
import { useEffect, useRef, MouseEvent, useState } from "react";

type MouseEventData = {
  isMouseDown: boolean;
  panTargetedLocationDate: number;
  zoomFactor: number;
};

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

  // if (evt.touches && evt.touches[0]) {
  //   pt.x = evt.touches[0].clientX;
  //   pt.y = evt.touches[0].clientY;
  // } else {
  //   pt.x = evt.clientX;
  //   pt.y = evt.clientY;
  // }

  pt.x = event.clientX;
  pt.y = event.clientY;

  return pt.matrixTransform(tagRef.getScreenCTM()?.inverse());
};

// #handleScrollZoom(e) {
//   let location = getCursorPoint(this.#objectIDs.svgId, e.sourceEvent);
//   this.#zoomFactor *= e.transform.k > 1 ? 1.1 : 0.9;

//   let width = parseDate(this.#minMaxDate[1]) - parseDate(this.#minMaxDate[0]);

//   let newWidth = Math.round(width / this.#zoomFactor);

//   let svgWidth = document.getElementById(
//     `${this.#objectIDs.candleContainerId}`
//   ).width.baseVal.value;

//   let target = this.#xScaleFunc.invert(location.x).getTime();
//   let coeff = Math.round((newWidth * location.x) / svgWidth);
//   let left = target - coeff;
//   let right = left + newWidth;

//   this.#zoomRange1 = left;
//   this.#zoomRange2 = right;

//   let filteredData = this.data.filter((x) => {
//     return (
//       parseDate(x.date).getTime() > left - this.#candleWidthDate &&
//       parseDate(x.date).getTime() < right + this.#candleWidthDate
//     );
//   });

//   this.#filteredData = filteredData;

//   this.draw();
// }

const handleZoom = (
  event: any,
  tagRef: SVGSVGElement | null,
  mouseEventRef: React.MutableRefObject<MouseEventData>,
  minMaxDate: [Date, Date],
  xScale: d3.ScaleTime<number, number, never>,
  dateRange: StockType[]
) => {
  const svgCoordinates = getSvgPointRelativeToViewPort(
    tagRef,
    event.sourceEvent
  );

  mouseEventRef.current.zoomFactor *= event.sourceEvent.deltaY < 0 ? 1.1 : 0.9; // if zoom is greater than 1 increase by 10% else decrease by 10%

  const width = minMaxDate[1].getTime() - minMaxDate[0].getTime(); // always the same because is always the max date window size
  const newWidth = Math.round(width / mouseEventRef.current.zoomFactor);
  const svgWidth = tagRef?.width.baseVal.value ?? 1;

  // console.log(event.transform.k);

  const mouseXAxisPosition = xScale.invert(svgCoordinates?.x ?? 0).getTime(); // current mouse zoom positon on X axis in time/ms
  const mouseRelativePostion = (svgCoordinates?.x ?? 0) / svgWidth;
  const zoomCutOffRange = Math.round(newWidth * mouseRelativePostion);
  const newLeftRange = mouseXAxisPosition - zoomCutOffRange;
  const newRightRange = newLeftRange + zoomCutOffRange;

  const newXRange1 = newLeftRange;
  const newXRange2 = newRightRange;

  const newDataRange = dateRange.filter((x) => {
    return (
      parseDate(x.date).getTime() > newXRange1 &&
      parseDate(x.date).getTime() < newXRange2
    );
  });

  return { newXRange1, newXRange2, newDataRange };
};

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

// const filter = (event) => {
//   console.log(event);
//   return event.type === "wheel";
// };

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

  // console.log("padding", width - (paddingLeft + paddingRight) - 2);

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
    minMaxDate,
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
  const mouseEventRef = useRef<MouseEventData>({
    isMouseDown: false,
    panTargetedLocationDate: 0,
    zoomFactor: 1,
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

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    // .scaleExtent([0.5, 2])
    .on("zoom", (e) => {
      // console.log("Zoom", e.transform.k);
      const newDataRanges = handleZoom(
        e,
        mainSvgContainerRef.current,
        mouseEventRef,
        styles.minMaxDate as any,
        xScale,
        data
      );

      setZoomRange({
        xZoomRange1: newDataRanges.newXRange1,
        xZoomRange2: newDataRanges.newXRange2,
        dataRange: newDataRanges.newDataRange,
      });
    });

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
        .selectAll("rect")
        .data(zoomRange.dataRange)
        // .enter()
        .join("rect")
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
      // console.log("HERE??", zoomRange.dataRange);
      d3.select(candleStickBodyContainerRef.current)
        .selectAll("rect")
        .data(zoomRange.dataRange)
        // .enter()
        .join("rect")
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
        .selectAll("rect")
        .data(zoomRange.dataRange)
        // .enter()
        .join("rect")
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
      d3.select(mainSvgContainerRef.current)
        .call(zoom)
        .on("mousedown.zoom", null)
        .on("touchstart.zoom", null)
        .on("touchmove.zoom", null)
        .on("touchend.zoom", null);
    }

    // console.log(
    //   "what is current",
    //   mainSvgContainerRef?.current?.width?.baseVal?.value
    // );
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
                data,
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
