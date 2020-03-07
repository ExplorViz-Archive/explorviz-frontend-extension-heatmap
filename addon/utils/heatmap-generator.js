
// Generate dummy values for a given class list
export function computeDummyHeatmap(clazzList) {
  let heatmap = new Map();
  
  clazzList.forEach(clazz => {
    heatmap.set(clazz.fullQualifiedName , Math.floor(Math.random()*100)-50);
  });

  return heatmap;
}


// Compute the min and max values for the heatmap.
export function computeHeatmapMinMax(map) {
  let min = Math.min(...map.values());
  let max = Math.max(...map.values());
  return {"min": min, "max": max}
}

export function revertKey(gradient){
  let replacedItems = Object.keys(gradient).map((key) => {
    return {[key.replace(/_/g,'.').replace(/\+/g, '')]: gradient[key]}
  })
  return Object.assign({}, ...replacedItems);
}