import { useEffect, useState } from "react";
import { Flex } from "@pancakeswap/uikit";
import random from "lodash/random";
import uniqueId from "lodash/uniqueId";
import { BallWithNumber } from "../svgs";

const WinningNumbers = ({
  numAsArray,
  size = "32px",
  fontSize = "16px",
  rotateText,
  indexArray,
  ...containerProps
}: any) => {
  const [rotationValues, setRotationValues] = useState([]);
  const colors = [
    "pink",
    "lilac",
    "teal",
    "aqua",
    "green",
    "yellow",
    "orange",
    "power",
  ];

  useEffect(() => {
    if (rotateText && numAsArray && rotationValues.length === 0) {
      setRotationValues(numAsArray.map(() => random(-30, 30)));
    }
  }, [rotateText, numAsArray, rotationValues, indexArray]);

  return (
    <Flex justifyContent="space-between" {...containerProps}>
      {Array.isArray(numAsArray) && numAsArray.map((num: any, index: any) => {
        return indexArray ? (
          <div
            className={`${indexArray.includes(index) ? "bordered-item" : ""}`}
            key={uniqueId()}
          >
            <BallWithNumber
              rotationTransform={rotateText && rotationValues[index]}
              size={size}
              fontSize={fontSize}
              color={colors[index]}
              number={num}
            />
          </div>
        ) : (
          <BallWithNumber
            key={uniqueId()}
            rotationTransform={rotateText && rotationValues[index]}
            size={size}
            fontSize={fontSize}
            color={colors[index]}
            number={num}
          />
        );
      })}
    </Flex>
  );
};

export default WinningNumbers;
