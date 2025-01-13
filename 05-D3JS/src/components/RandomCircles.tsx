import React, { useEffect, useState } from "react";

const generateCirclePosition = () => {
  const positionArray = [];

  for (let i = 0; i < 100; i += 1) {
    const x = Math.floor(Math.random() * 100) + 1;
    const y = Math.floor(Math.random() * 100) + 1;
    positionArray.push({ x, y });
  }

  return positionArray;
};

export const RandonCircles = () => {
  const [dataSets, setDataSets] = useState(generateCirclePosition());

  useEffect(() => {
    const interval = setInterval(() => {
      setDataSets(generateCirclePosition());
    }, 2000);

    return () => clearTimeout(interval);
  }, []);

  return (
    <svg viewBox="0 0 100 50">
      {dataSets.map((position, index) => {
        return <circle key={index} cx={position.x} cy={position.y} r="3" />;
      })}
    </svg>
  );
};
