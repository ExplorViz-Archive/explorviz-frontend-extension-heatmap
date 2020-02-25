
// Generate dummy values for a given class list
export function computeHeatmap(clazzList) {
  let heatmap = new Map();
  
  clazzList.forEach(clazz => {
    heatmap.set(clazz.fullQualifiedName , Math.floor(Math.random()*100)-50);
  });

  return heatmap;
}


// Compute the min and max values for the heatmap.
export function computeHeatmapMinMax(map) {
  
  let min = 500;
  let max = -500;
 
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


export function generateHeatmap(height, width, heatmap) {
  let hm = [];
  if (typeof heatmap !== 'undefined'){
    hm = heatmap;
  } else {
    for (let h=0; h<height; h++) {
      let row = [];
      for(let w=0; w<width; w++) {
        row[w] = Math.floor(Math.random()*100)-50;
      }
      hm.push(row);
    }
  }
  // console.log(hm);
  return applyGradients(hm);
}

export function applyGradients(heatmap) {
  let gradientmap = [];
  heatmap.forEach(element => {
    // let row = [];
    element.forEach(elelement => {
      // row.push(computeGradient(elelement));
      gradientmap.push(computeGradient(elelement));
    })
    // gradientmap.push(row);
  });
  // console.log(gradientmap);
  return gradientmap;
}

export function computeGradient(int) {
  let val = "";

  if (int <= -35) { //-* - -35
    val = "rgb(0, 0, 255)"
  } else if (int <= -25) { //-34 - -25
    val = "rgb(0, 255, 255)"
  } else if (int <= -15) { //-26 - -15
    val = "rgb(0, 255, 100)"
  }else if (int <= -5) { //-14 - -5
    val = "rgb(209, 255, 227)"
  } else if (int <= 5) { //-6 - 5
    val = "rgb(255, 255, 255)"
  }else if (int <= 15) { //6 - 15
    val = "rgb(255, 255, 0)"
  } else if (int <= 25) { // 14 - 25
    val = "rgb(255, 162, 0)"
  } else if (int <= 35) { // 26 - 35
    val = "rgb(255, 98, 0)"
  } else {  // 36 - * 
    val = "rgb(255, 0, 0)"
  } 

  return val;
}