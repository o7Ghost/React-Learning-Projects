import {
  SingleCircleD3,
  RandonCircles,
  AnimatedCircles,
  Axis,
  ChartWithDimensions,
  AxisV2,
} from "./components";

const style = {
  display: "flex",
  height: "200px",
  width: "100%",
};

function App() {
  return (
    <>
      <div style={style}>
        <SingleCircleD3 />
      </div>
      <div style={style}>
        <RandonCircles />
      </div>
      <div style={style}>
        <AnimatedCircles />
      </div>
      <div style={style}>
        <Axis />
      </div>
      <ChartWithDimensions />
      <div style={style}>
        <AxisV2 />
      </div>
    </>
  );
}

export default App;
