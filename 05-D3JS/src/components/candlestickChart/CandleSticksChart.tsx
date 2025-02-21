import { data } from "./stockData";
import * as d3 from "d3";
import { StockType } from "./stockData";
import { useEffect, useRef } from "react";

// TODO: Layout understand this and convert to react

// #createLayout() {
//     d3.select(`#${this.id}`)
//       .style(
//         'padding',
//         `${this.#config.paddingTop}px ${this.#config.paddingRight}px ${
//           this.#config.paddingBottom
//         }px ${this.#config.paddingLeft}px`
//       )
//       .style('display', 'inline-block')
//       .attr('width', this.#config.width)
//       .attr('height', this.#config.height)
//       .append('svg')
//       .attr('width', this.#config.svgWidth)
//       .attr('height', this.#config.svgHeight)
//       .style('overflow', 'inherit')
//       .style('cursor', 'crosshair')
//       .attr('id', this.#objectIDs.svgId)
//       .style('margin-top', '-50px');
//   }

const parseDate = (dateStr: string) => new Date(dateStr);

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
  const candleContainerRef = useRef<SVGGElement | null>(null);

  const xScale = d3.scaleTime(
    [styles.xZoomRange1, styles.xZoomRange2],
    [0, styles.svgWidth]
  );

  const yAxisDomain = d3
    .extent([
      ...(data.map((x) => x.high) ?? 0),
      ...(data.map((x) => x.low) ?? 1),
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

    if (candleContainerRef.current) {
      d3.select(candleContainerRef.current)
        .selectAll()
        .data(data)
        .enter()
        .append("rect")
        .attr("width", styles.candleTailWidth)
        .attr("height", (d) => {
          console.log(yScale(d.open) + " " + yScale(d.high));
          return d.open > d.close
            ? yScale(d.open) - yScale(d.high)
            : yScale(d.close) - yScale(d.high);
        })
        .attr("x", (d) => {
          // console.log("Data", xScale(parseDate(d.date)));
          return xScale(parseDate(d.date)) - styles.candleTailWidth / 2;
        })
        .attr("y", (d) => {
          // console.log(d.high, yScale(d.high));
          return yScale(d.high);
        })
        .attr("fill", (d) =>
          d.open < d.close ? styles.upCandlesTail : styles.downCandlesTail
        );
    }
  }, [xAxis, xScale, yAxis, yScale, candleContainerRef]);

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
      >
        <g ref={candleContainerRef} />
        <g ref={xAxis} transform={`translate(0, 10)`} />
        <g ref={yAxis} transform={`translate(5, 0)`} />
      </svg>
    </div>
  );
};
