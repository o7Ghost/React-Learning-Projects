import { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/web";

const AnimatedCircle = ({
  index,
  isShowing,
}: {
  index: number;
  isShowing: boolean;
}) => {
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

  return (
    <animated.circle
      {...style}
      cx={index * 15 + 10}
      cy="10"
      fill={
        !isShowing
          ? "tomato"
          : !wasShowing.current
          ? "cornflowerblue"
          : "lightgrey"
      }
    />
  );
};

const generateCircles = () => {
  const number = [0, 1, 2, 3, 4, 5];
  const pickNumberOfVisiableCircles = Math.floor(Math.random() * 6);
  const result: number[] = [];

  for (let i = 0; i < pickNumberOfVisiableCircles; i++) {
    const pickIdx = Math.floor(Math.random() * number.length);
    result.push(number[pickIdx]);
    number.splice(pickIdx);
  }

  return result;
};

export const AnimatedCircles = () => {
  const allCircles = [0, 1, 2, 3, 4, 5];
  const [visibleCircles, setVisibleCircles] = useState(generateCircles());

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCircles(generateCircles());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg viewBox="0 0 100 20">
      {allCircles.map((d) => (
        <AnimatedCircle
          key={d}
          index={d}
          isShowing={visibleCircles.includes(d)}
        />
      ))}
    </svg>
  );
};
