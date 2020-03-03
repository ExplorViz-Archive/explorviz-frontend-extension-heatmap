export function getDefaultGradient() {
  return {
    "-0_35": "rgb(0, 0, 255)",
    "-0_25": "rgb(0, 255, 255)",
    "-0_15": "rgb(0, 255, 100)",
    "-0_05": "rgb(209, 255, 227)",
    "0_05": "rgb(255, 255, 255)",
    "0_15": "rgb(255, 255, 0)",
    "0_25": "rgb(255, 162, 0)",
    "0_35": "rgb(255, 98, 0)",
    "max": "rgb(255, 0, 0)"
  };
}

export function setColorValues(index, heatValue, colorMap, foundationMesh) {
  let depthSegments = foundationMesh.userData.depthSegments;
  let widthSegments = foundationMesh.userData.widthSegments;
  
  // Compute face numbers of top side of the cube 
  let size = widthSegments * depthSegments * 2;

  let evenIndex;
  let secondaryScalar = 0.4;
  let tertiaryScalar = 0.2;

  if (index % 2 === 0){
    evenIndex = index;
  } else {
    evenIndex = index - 1;
  }
  colorMap[evenIndex]     += heatValue;
  colorMap[evenIndex + 1] += heatValue;

  // TODO: compute bounds

  // secondary colors
  let nIndex = evenIndex + 2; 
  if (nIndex < size) {
    colorMap[nIndex] += heatValue * secondaryScalar;
    colorMap[nIndex + 1] += heatValue * secondaryScalar;
  }

  let sIndex = evenIndex - 2; 
  if (sIndex < size) {
    colorMap[sIndex] += heatValue * secondaryScalar;
    colorMap[sIndex + 1] += heatValue * secondaryScalar;
  }

  let wIndex = evenIndex - widthSegments*2; 
  if (wIndex < size ) {
    colorMap[wIndex] += heatValue * secondaryScalar;
    colorMap[wIndex + 1] += heatValue * secondaryScalar;
  }

  let eIndex = evenIndex + widthSegments*2; 
  if (eIndex < size) {
    colorMap[eIndex] += heatValue * secondaryScalar;
    colorMap[eIndex + 1] += heatValue * secondaryScalar;
  }

  // tertiary colors
  let neIndex = eIndex + 2; 
  if (neIndex < size) {
    colorMap[neIndex] += heatValue * tertiaryScalar;
    colorMap[neIndex + 1] += heatValue * tertiaryScalar;
  }

  let seIndex = eIndex - 2; 
  if (seIndex < size) {
    colorMap[seIndex] += heatValue * tertiaryScalar;
    colorMap[seIndex + 1] += heatValue * tertiaryScalar;
  }

  let swIndex = wIndex + 2; 
  if (swIndex < size ) {
    colorMap[swIndex] += heatValue * tertiaryScalar;
    colorMap[swIndex + 1] += heatValue * tertiaryScalar;
  }

  let nwIndex = wIndex - 2; 
  if (nwIndex < size) {
    colorMap[nwIndex] += heatValue * tertiaryScalar;
    colorMap[nwIndex + 1] += heatValue * tertiaryScalar;
  }
}

/**
   * Apply the values specified in the colorMap to the surface of the foundation Mesh
   * 
   * @param {Number[]} colorMap 
   * @param {*} foundationMesh
   * @param {Number} maximumValue
   */
export function invokeRecoloring(colorMap, foundationMesh, maximumValue, gradient){
  let depthSegments = foundationMesh.userData.depthSegments;
  let widthSegments = foundationMesh.userData.widthSegments;
  // The number of faces at front and back of the foundation mesh, i.e. the starting index for the faces on top.
  let depthOffset = depthSegments * 4;
  // Compute face numbers of top side of the cube 
  let size = widthSegments * depthSegments * 2;
  for(let i = 0; i < size; i+= 1){
    if (colorMap[i]) {
      let color = computeGradient(colorMap[i], maximumValue, gradient);
      foundationMesh.geometry.faces[i + depthOffset].color.set(color);
    }
  }
  
  foundationMesh.geometry.colorsNeedUpdate = true;
}

export function computeGradient(requestedValue, maximumValue, gradient) {
  let val = "";
  let gradientValue = 0;
  if (maximumValue > 0) {
    gradientValue = requestedValue/maximumValue;
  }

  // console.log(gradient)
  if (gradientValue <= -0.35) { //-* - -35
    val = gradient["-0_35"];
  } else if (gradientValue <= -0.25) { //-34 - -25
    val = gradient["-0_25"];
  } else if (gradientValue <= -0.15) { //-26 - -15
    val = gradient["-0_15"];
  }else if (gradientValue <= -0.05) { //-14 - -5
    val = gradient["-0_05"];
  } else if (gradientValue <= 0.05) { //-6 - 5
    val = gradient["0_05"];
  }else if (gradientValue <= 0.15) { //6 - 15
    val = gradient["0_15"];
  } else if (gradientValue <= 0.25) { // 14 - 25
    val = gradient["0_25"];
  } else if (gradientValue <= 0.35) { // 26 - 35
    val = gradient["0_35"];
  } else {  // 36 - * 
    val = gradient["max"];
  } 

  // console.log(val);
  return val;
}