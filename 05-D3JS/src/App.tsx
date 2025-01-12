import { SingleCircleD3, RandonCircles, AnimatedCircles } from "./components";

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
    </>
  );
}

export default App;
