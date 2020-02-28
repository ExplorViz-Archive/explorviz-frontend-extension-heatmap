import heatmapGen from "./heatmap-generator";

export function setColorValues(index, heatValue, colorMap, foundationMesh) {
  let depthSegments = foundationMesh.userData.depthSegments;
  let widthSegments = foundationMesh.userData.widthSegments;
  
  // Compute face numbers of top side of the cube 
  let size = widthSegments * depthSegments * 2;

  let evenIndex;
  let secondaryScalar = 0.5;
  let tertiaryScalar = 0.25;

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
   */
export function invokeRecoloring(colorMap, foundationMesh, maximumValue){
  let depthSegments = foundationMesh.userData.depthSegments;
  let widthSegments = foundationMesh.userData.widthSegments;

  // The number of faces at front and back of the foundation mesh, i.e. the starting index for the faces on top.
  let depthOffset = depthSegments * 4;
  // Compute face numbers of top side of the cube 
  let size = widthSegments * depthSegments * 2;
  for(let i = 0; i < size; i+= 1){
    if (colorMap[i]) {
      let color = heatmapGen.computeGradient(colorMap[i], maximumValue);
      foundationMesh.geometry.faces[i + depthOffset].color.set(color);
    }
  }
  
  foundationMesh.geometry.colorsNeedUpdate = true;
}