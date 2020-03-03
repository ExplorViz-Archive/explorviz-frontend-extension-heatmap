
// Generate dummy values for a given class list
export function computeDummyHeatmap(clazzList) {
  let heatmap = new Map();
  
  clazzList.forEach(clazz => {
    heatmap.set(clazz.fullQualifiedName , Math.floor(Math.random()*100)-50);
  });

  return heatmap;
}


// Compute the min and max values for the heatmap.
export function computeHeatmapMinMax(map, maxValue) {
  let min = maxValue;
  let max = -maxValue;
  if (map) {
    map.forEach((value) => {
      if (value < min) {
        min = value;
      } else if (value > max){
        max = value;   
      }
    })
  }
  return {"min": min, "max": max}
}