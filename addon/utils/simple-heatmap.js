import simpleheat from 'simpleheat';

export function getDefaultGradient() {
  return {
    "0_00": "rgb(0, 0, 255)",
    "0_15": "rgb(0, 153, 255)",
    "0_25": "rgb(0, 255, 255)",
    "0_35": "rgb(0, 255, 100)",
    "0_45": "rgb(0, 255, 0)",
    "0_55": "rgb(175, 255, 0)",
    "0_65": "rgb(255, 255, 0)",
    "0_75": "rgb(255, 125, 0)",
    "0_85": "rgb(255, 75, 0)",
    "1_00": "rgb(255, 0, 0)"
  };
}

export function simpleHeatmap(maximumValue, canvas, gradient) {
  let simpleHeatMap = simpleheat(canvas);
  simpleHeatMap.radius(3, 2);
  simpleHeatMap.max(maximumValue);
  simpleHeatMap.gradient(gradient);
  return simpleHeatMap;
}