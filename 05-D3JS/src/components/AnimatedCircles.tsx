import React, { useEffect, useRef } from "react";
import { useSpring, animated } from "@react-spring/web";

const AnimatedCircle = ({ index, isShowing }) => {
  const wasShowing = useRef(false);

  useEffect(() => {
    wasShowing.current = isShowing;
  }, [isShowing]);

  const style = useSpring({
    config: {
      duration: 1200,
    },
    r: isShowing ? 6 : 0,
    opacity: isShowing ? 1 : 0,
  });

  return <animated.div></animated.div>;
};

export const AnimatedCircles = () => {};
