
// Generate dummy values for a given class list
export function computeHeatmap(clazzList) {
  let heatmap = new Map();
  
  clazzList.forEach(clazz => {
    heatmap.set(clazz.fullQualifiedName , Math.floor(Math.random()*100)-50);
  });

  return heatmap;
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

// export function computeGradient(int) {
//   let val = "crimson";
//   /*if (int <= -45) { //-50 - -45
//     val = "black"
//   } else*/ if (int <= -35) { //-46 - -30
//     val = "blue"
//   } else if (int <= -15) { //-31 - -15
//     val = "cornflowerblue"
//   } else if (int <= -5) { //-16 - -5
//     val = "cyan"
//   } else if (int <= 5) { //-5 - 5
//     val = "rgb(0, 255, 174)"
//   }else if (int <= 15) {
//     val = "lime"
//   } else if (int <= 25) {
//     val = "yellow"
//   } else if (int <= 35) {
//     val = "orangered"
//   } else /*if (int <= 45)*/ {
//     val = "crimson"
//   } /*else {
//     val = "white"
//   }*/
//   return val;
// }

export function computeGradient(int) {
  let val = "crimson";
  /*if (int <= -45) { //-50 - -45
    val = "black"
  } else*/ if (int <= -35) { //-46 - -30
    val = "blue"
  } else if (int <= -15) { //-31 - -15
    val = "cornflowerblue"
  } else if (int <= -5) { //-16 - -5
    val = "cyan"
  } else if (int <= 5) { //-5 - 5
    val = "rgb(0, 255, 174)"
  }else if (int <= 15) {
    val = "rgb(0, 255, 106)"
  } else if (int <= 25) {
    val = "rgb(174, 255, 0)"
  } else if (int <= 35) {
    val = "rgb(255, 145, 0)"
  } else /*if (int <= 45)*/ {
    val = "(255, 0, 0)"
  } /*else {
    val = "white"
  }*/
  return val;
}