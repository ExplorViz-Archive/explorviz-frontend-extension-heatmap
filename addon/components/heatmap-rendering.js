import layout from '../templates/components/heatmap-rendering';
// import HeatmapRenderingCore from './heatmap-rendering-core'
// import Component from '@ember/component';
import RenderingCore from "explorviz-frontend/components/visualization/rendering/rendering-core";
import heatmapGen from "../utils/heatmap-generator";
import clazzHelper from "../utils/clazz-helper";
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';

import THREE from 'three';

import applyCityLayout from
  'explorviz-frontend/utils/application-rendering/city-layouter';
import Interaction from
  'explorviz-frontend/utils/application-rendering/interaction';
import Labeler from
  'explorviz-frontend/utils/application-rendering/labeler';
import CalcCenterAndZoom from
  'explorviz-frontend/utils/application-rendering/center-and-zoom-calculator';
import FoundationBuilder from
  'explorviz-frontend/utils/application-rendering/foundation-builder';

export default RenderingCore.extend({

  landscapeRepo: service('repos/landscape-repository'),
  configuration: service("configuration"),
  store: service("store"),
  highlighter: service('visualization/application/highlighter'),
  currentUser: service(),

  // Disable generation of ember container
  tagName: '', 
  layout: layout,

  applicationID: null,
  application3D: null,
  foundationMesh: null,

  scene: null,
  webglrenderer: null,
  camera: null,

  canvas: null,
  font: null,
  animationFrameId: null,

  listeners: null,

  oldRotation: null,
  initialSetupDone: false,
  centerAndZoomCalculator: null,
  
  labeler: null,
  foundationBuilder: null,

  interaction: null,
  interactionHandler: null,
  
  // there's already a property 'listener' in superclass RenderingCore
  listeners2: null,

  // @Override
  /**
   * 
   */
  didRender(){
    this._super(...arguments);
      this.initRendering();
      this.initListener();
  },

  initRendering() {
    this._super(...arguments);

    this.set('oldRotation', { x: 0, y: 0 });
    
    this.onReSetupScene = function () {
      this.resetRotation();
      this.set('centerAndZoomCalculator.centerPoint', null);
      this.get('camera.position').set(0, 0, 100);
      this.cleanAndUpdateScene();
    };
    
    this.onUpdated = function () {
      if (this.get('initDone')) {
        this.preProcessEntity();
        this.cleanAndUpdateScene();
      }
    };

    this.onResized = function () {
      this.set('centerAndZoomCalculator.centerPoint', null);
      this.cleanAndUpdateScene();
    };

    // Move camera to specified position
    this.onMoveCameraTo = function (emberModel) {
      if (!emberModel) {
        return;
      }

      let emberModelName = emberModel.get('constructor.modelName');
      // Position of target object in local coordinates
      let position;

      // Calculate center point of application
      if (!this.get('centerAndZoomCalculator.centerPoint')) {
        this.get('centerAndZoomCalculator')
          .calculateAppCenterAndZZoom(this.get('latestApplication'));
      }
      let viewCenterPoint = this.get('centerAndZoomCalculator.centerPoint');

      if (emberModelName === "clazz") {
        position = new THREE.Vector3(emberModel.get('positionX'), emberModel.get('positionY'), emberModel.get('positionZ'));
        applyCameraPosition(this.get('application3D'), viewCenterPoint, this.get('camera'), position);
        // Apply zoom
        this.get('camera').position.z += 25;
      } else if (emberModelName === "clazzcommunication") {
        let sourceClazz = emberModel.get('sourceClazz');
        let targetClazz = emberModel.get('targetClazz');

        position = new THREE.Vector3(
          sourceClazz.get('positionX') + 0.5 * (targetClazz.get('positionX') - sourceClazz.get('positionX')),
          sourceClazz.get('positionY') + 0.5 * (targetClazz.get('positionY') - sourceClazz.get('positionY')),
          sourceClazz.get('positionZ') + 0.5 * (targetClazz.get('positionZ') - sourceClazz.get('positionZ')));

        applyCameraPosition(this.get('application3D'), viewCenterPoint, this.get('camera'), position);
        // Apply zoom
        this.get('camera').position.z += 50;
      } else {
        // Given model not yet supported for moving camera
        return;
      }

      function applyCameraPosition(application, centerPoint, camera, position) {
        position.sub(centerPoint);
        position.multiplyScalar(0.5);

        let appQuaternion = new THREE.Quaternion();

        application.getWorldQuaternion(appQuaternion);
        position.applyQuaternion(appQuaternion);

        let appPosition = new THREE.Vector3();
        application.getWorldPosition(appPosition);
        position.sub(appPosition);

        // Move camera on to given position
        camera.position.set(position.x, position.y, position.z);
      }
    };

    this.get('camera').position.set(0, 0, 100);
    
    if (!this.get('labeler')) {
      // Owner necessary to inject service into util
      this.set('labeler', Labeler.create(getOwner(this).ownerInjection()));
    }

    if (!this.get('foundationBuilder')) {
      this.set('foundationBuilder', FoundationBuilder.create());
    }

    if (!this.get('interaction')) {
      // Owner necessary to inject service into util
      this.set('interaction', Interaction.create(getOwner(this).ownerInjection()));
    }

    if (!this.get('centerAndZoomCalculator')) {
      this.set('centerAndZoomCalculator', CalcCenterAndZoom.create());
    }

    const backgroundColor = this.get('configuration.applicationColors.background');
    this.set('scene.background', new THREE.Color(backgroundColor));

    this.initInteraction();

    const spotLight = new THREE.SpotLight(0xffffff, 0.5, 1000, 1.56, 0, 0);
    spotLight.position.set(100, 100, 100);
    spotLight.castShadow = false;
    this.get('scene').add(spotLight);

    const light = new THREE.AmbientLight(
      new THREE.Color(0.65, 0.65, 0.65));
    this.scene.add(light);

    this.set('centerAndZoomCalculator.centerPoint', null);
  },

  // @Override
  cleanup() {
    this._super(...arguments);

    // Remove foundation for re-rendering
    this.get('foundationBuilder').removeFoundation(this.get('store'));

    this.set('applicationID', null);
    this.set('application3D', null);

    this.removeListeners();

    // Clean up landscapeRepo for visualization template
    this.set('landscapeRepo.latestApplication', null);
    this.set('landscapeRepo.replayApplication', null);

    this.get('interaction').removeHandlers();
  },

  removeListeners() {
    // unsubscribe from all services
    this.get('listeners2').forEach(([service, event, listenerFunction]) => {
      this.get(service).off(event, listenerFunction);
    });
    this.set('listeners2', null);
  },


  // @Override
  /**
   * Persists rotation and removes foundation
   *
   * @method cleanAndUpdateScene
   */
  cleanAndUpdateScene() {
    // Save old rotation
    this.set('oldRotation', this.get('application3D').rotation);

    // Remove foundation for re-rendering
    this.get('foundationBuilder').removeFoundation(this.get('store'));

    this._super(...arguments);
  },

  // @Override
  /**
   * Update latest application in landscape repo
   *
   * @method preProcessEntity
   */
  preProcessEntity() {
    const application = this.get('store').peekRecord('application',
      this.get('applicationID'));

    // depending on the mode set the replay applcation
    if (this.get("mode") === "replay") {
      this.set('landscapeRepo.replayApplication', application);
    }
    else {
      this.set('landscapeRepo.latestApplication', application);
    }
  },

  // @Override
  /**
   * Main method for adding THREE.js objects to application
   *
   * @method populateScene
   */
  populateScene() {
    this._super(...arguments);

    const emberApplication = this.get('latestApplication');

    if (!emberApplication || !this.get('font')) {
      return;
    }

    this.set('applicationID', emberApplication.id);

    const self = this;

    // If foundation is already set don't add a new one. The foundationObj is set to null by cleanup.
    let foundation;
    if(!this.get('foundationBuilder.foundationObj')){
      foundation = this.get('foundationBuilder').createFoundation(emberApplication, this.get('store'));
    } else {
      foundation = this.get('foundationBuilder.foundationObj');
    }

    emberApplication.applyDefaultOpenLayout(self.get('initialSetupDone'));

    applyCityLayout(emberApplication);

    this.set('application3D', new THREE.Object3D());
    this.set('application3D.userData.model', emberApplication);

    // Update raycasting children, because of new entity
    this.get('interaction').updateEntities(this.get('application3D'));

    // Apply (possible) highlighting
    this.get('highlighter').applyHighlighting();

    if (!this.get('centerAndZoomCalculator.centerPoint')) {
      this.get('centerAndZoomCalculator')
        .calculateAppCenterAndZZoom(emberApplication);
    }

    const viewCenterPoint = this.get('centerAndZoomCalculator.centerPoint');

    const drawableClazzCommunications = emberApplication.get('drawableClazzCommunications');

    drawableClazzCommunications.forEach((drawableClazzComm) => {
      if (drawableClazzComm.get('startPoint') && drawableClazzComm.get('endPoint')) {
        const start = new THREE.Vector3();
        start.subVectors(drawableClazzComm.get('startPoint'), viewCenterPoint);
        start.multiplyScalar(0.5);

        const end = new THREE.Vector3();
        end.subVectors(drawableClazzComm.get('endPoint'), viewCenterPoint);
        end.multiplyScalar(0.5);

        let transparent = false;
        let opacityValue = 1.0;

        if (drawableClazzComm.get('state') === "TRANSPARENT") {
          transparent = this.get('currentUser').getPreferenceOrDefaultValue('flagsetting', 'appVizTransparency');
          opacityValue = this.get('currentUser').getPreferenceOrDefaultValue('rangesetting', 'appVizTransparencyIntensity');
        }

        const communicationColor = this.get('configuration.applicationColors.communication');
        const communicationHighlightedColor = this.get('configuration.applicationColors.highlightedEntity');

        const material = new THREE.MeshBasicMaterial({
          color: drawableClazzComm.get('highlighted') ? new THREE.Color(communicationHighlightedColor) : new THREE.Color(communicationColor), // either red if 'highlighted', otherwise orange
          opacity: opacityValue,
          transparent: transparent
        });

        const thickness = drawableClazzComm.get('lineThickness') * 0.3;

        // Determines how smooth/round the curve looks, impacts performance
        const curveSegments = 40;
        const curveHeight = this.get('currentUser').getPreferenceOrDefaultValue('rangesetting', 'appVizCurvyCommHeight');

        const isCurvedCommunication = curveHeight > 0.0;

        if (isCurvedCommunication && drawableClazzComm.get('sourceClazz') !== drawableClazzComm.get('targetClazz')) {
          let curveMeshes = this.curvedCylinderMeshes(start, end, material, thickness, curveSegments, curveHeight);
          for (let i = 0; i < curveMeshes.length; i++) {
            let curveSegment = curveMeshes[i];
            curveSegment.userData.model = drawableClazzComm;
            self.get('application3D').add(curveSegment);
          }
        } else {
          const pipe = this.cylinderMesh(start, end, material, thickness);
          pipe.userData.model = drawableClazzComm;
          self.get('application3D').add(pipe);
        }

        // Indicate communication for direction for (indirectly) highlighted communication
        if (drawableClazzComm.get('highlighted') ||
          drawableClazzComm.get('sourceClazz.highlighted') ||
          drawableClazzComm.get('targetClazz.highlighted')) {

          // Check for recursion
          if (drawableClazzComm.get('sourceClazz.fullQualifiedName') ==
            drawableClazzComm.get('targetClazz.fullQualifiedName')) {
              // todo: draw a circular arrow or something alike
          } else {
            // Add arrow from in direction of source to target clazz
            let arrowThickness = this.get('currentUser').getPreferenceOrDefaultValue('rangesetting', 'appVizCommArrowSize') * 4 * thickness;
            let yOffset = isCurvedCommunication ? curveHeight / 2 + 1 : 0.8;

            self.addCommunicationArrow(start, end, arrowThickness, yOffset);

            // Draw second arrow for bidirectional communication, but not if only trace communication direction shall be displayed
            if (drawableClazzComm.get('isBidirectional') && !this.get('highlighter.isTrace')) {
              self.addCommunicationArrow(end, start, arrowThickness, yOffset);
            }
          }
        }
      }
    });
    const foundationColor = this.get('configuration.applicationColors.foundation');
    this.addComponentToScene(foundation, foundationColor);

    self.scene.add(self.get('application3D'));

    if (self.get('initialSetupDone')) {
      // Apply old rotation
      self.set('application3D.rotation.x', self.get('oldRotation.x'));
      self.set('application3D.rotation.y', self.get('oldRotation.y'));
    }
    else {
      self.resetRotation();
      self.set('oldRotation.x', self.get('application3D').rotation.x);
      self.set('oldRotation.y', self.get('application3D').rotation.y);
      self.set('initialSetupDone', true);
    }

    // Get all (nested) clazzes of the application
    let clazzList = [];
    clazzHelper.getClazzList(foundation, clazzList);
    // Set foundationMesh for further adaption
    this.set('foundationMesh', self.get('application3D.children')[1]);
    this.applyHeatmap(clazzList);
  },

  // Helper functions
  cylinderMesh(pointX, pointY, material, thickness) {
    const direction = new THREE.Vector3().subVectors(pointY, pointX);
    const orientation = new THREE.Matrix4();
    orientation.lookAt(pointX, pointY, new THREE.Object3D().up);
    orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1,
      0, 0, -1, 0, 0, 0, 0, 0, 1));
    const edgeGeometry = new THREE.CylinderGeometry(thickness, thickness,
      direction.length(), 20, 1);
    const pipe = new THREE.Mesh(edgeGeometry, material);
    pipe.applyMatrix(orientation);

    pipe.position.x = (pointY.x + pointX.x) / 2.0;
    pipe.position.y = (pointY.y + pointX.y) / 2.0;
    pipe.position.z = (pointY.z + pointX.z) / 2.0;
    return pipe;
  },

  curvedCylinderMeshes(start, end, material, thickness, points, curveHeight) {
    // Determine middle
    let dir = end.clone().sub(start);
    let len = dir.length();
    let halfVector = dir.normalize().multiplyScalar(len * 0.5);
    let middle = start.clone().add(halfVector);
    middle.y += curveHeight;

    let curve = new THREE.QuadraticBezierCurve3(
      start,
      middle,
      end
    );

    let curvePoints = curve.getPoints(points);
    let curveMeshes = [];

    // Compute meshes for curve
    for (let i = 0; i < curvePoints.length - 1; i++) {
      let curveSegment = this.cylinderMesh(curvePoints[i], curvePoints[i + 1], material, thickness);
      curveMeshes.push(curveSegment);
    }
    return curveMeshes;
  },

  addComponentToScene(component, color) {


    const foundationColor = this.get('configuration.applicationColors.foundation');
    const componentOddColor = this.get('configuration.applicationColors.componentOdd');
    const componentEvenColor = this.get('configuration.applicationColors.componentEven');
    const clazzColor = this.get('configuration.applicationColors.clazz');
    const highlightedEntityColor = this.get('configuration.applicationColors.highlightedEntity');

    this.createBox(component, color, false);

    component.set('color', color);

    const clazzes = component.get('clazzes');
    const children = component.get('children');

    clazzes.forEach((clazz) => {
      if (component.get('opened')) {
        if (clazz.get('highlighted')) {
          this.createBox(clazz, highlightedEntityColor, true);
        } else {
          this.createBox(clazz, clazzColor, true);
        }
      }
    });

    children.forEach((child) => {
      if (component.get('opened')) {
        if (child.get('highlighted')) {
          this.addComponentToScene(child, highlightedEntityColor);
        } else if (component.get('color') === foundationColor) {
          this.addComponentToScene(child, componentOddColor);
        } else if (component.get('color') === componentEvenColor) {
          this.addComponentToScene(child, componentOddColor);
        } else {
          this.addComponentToScene(child, componentEvenColor);
        }
      }
    });
  }, // END addComponentToScene

   /**
   * Adds a Box to an application, therefore also computes color, size etc.
   * @method createBox
   * @param {emberModel} boxEntity Component or clazz
   * @param {string}     color     Color for box
   * @param {boolean}    isClazz   Distinguishes between component and clazz
   */
  createBox(boxEntity, color, isClazz) {
    let centerPoint = new THREE.Vector3(boxEntity.get('positionX') +
      boxEntity.get('width') / 2.0, boxEntity.get('positionY') +
      boxEntity.get('height') / 2.0,
      boxEntity.get('positionZ') + boxEntity.get('depth') / 2.0);

    let transparent = false;
    let opacityValue = 1.0;

    // Override transparency for heatmap mode
    // TODO: bind to heatmap button
    if (!boxEntity.get('foundation') && !isClazz) {
      transparent = true;
      opacityValue = 0.15;
    }

    const material = new THREE.MeshLambertMaterial({
      opacity: opacityValue,
      transparent: transparent
    });

    // Enable face colors for the foundation to set color of individual segments
    if (boxEntity.get('foundation')) {
      material.vertexColors = THREE.FaceColors;
    }

    material.color = new THREE.Color(color);
      
    centerPoint.sub(this.get('centerAndZoomCalculator.centerPoint'));
    centerPoint.multiplyScalar(0.5);

    const extension = new THREE.Vector3(boxEntity.get('width') / 2.0,
      boxEntity.get('height') / 2.0, boxEntity.get('depth') / 2.0);

    // Create new geometry with segments if the entity is foundation.
    let cube;
    let segmentScalar = 0.25
    let widthSegments = Math.floor(extension.x * segmentScalar)
    let depthSegments = Math.floor(extension.z * segmentScalar)
    if (boxEntity.get('foundation')) {
      cube = new THREE.BoxGeometry(extension.x, extension.y, extension.z, widthSegments, 1, depthSegments);
    } else {
      cube = new THREE.BoxGeometry(extension.x, extension.y, extension.z);
    }

    const mesh = new THREE.Mesh(cube, material);

    // Set (optional) name of the mesh to the fqn of the component 
    mesh.name = boxEntity.get('fullQualifiedName')

    mesh.position.set(centerPoint.x, centerPoint.y, centerPoint.z);
    mesh.updateMatrix();

    mesh.userData.model = boxEntity;
    mesh.userData.name = boxEntity.get('name');
    mesh.userData.foundation = boxEntity.get('foundation');
    mesh.userData.type = isClazz ? 'clazz' : 'package';
    mesh.userData.opened = boxEntity.get('opened');

    // Save size of the foundation as user data
    if (boxEntity.get('foundation')) {
      mesh.userData.widthSegments = widthSegments;
      mesh.userData.depthSegments = depthSegments;
    }

    transparent = false;
    this.get('labeler').createLabel(mesh, this.get('application3D'),
      this.get('font'), transparent);

    this.get('application3D').add(mesh);
  },// END createBox

  /**
   * Draws an small black arrow
   * @param {Number} start start vector of the associated communication
   * @param {Number} end end vector of the associated communication
   * @param {Number} width thickness of the arrow
   * @method addCommunicationArrow
   */
  addCommunicationArrow(start, end, width, yOffset) {
    // Determine (almost the) middle
    let dir = end.clone().sub(start);
    let len = dir.length();
    // Do not draw precisely in the middle to leave a small gap in case of bidirectional communication
    let halfVector = dir.normalize().multiplyScalar(len * 0.51);
    let middle = start.clone().add(halfVector);

    // Normalize the direction vector (convert to vector of length 1)
    dir.normalize();

    // Arrow properties
    let origin = new THREE.Vector3(middle.x, middle.y + yOffset, middle.z);
    let headWidth = Math.max(1.2, width);
    let headLength = Math.min(2 * headWidth, 0.3 * len);
    let length = headLength + 0.00001; // body of arrow not visible
    const communicationArrowColor = this.get('configuration.applicationColors.communicationArrow');

    let arrow = new THREE.ArrowHelper(dir, origin, length, communicationArrowColor, headLength, headWidth);

    this.get('application3D').add(arrow);
  }, // END addCommunicationArrow


  resetRotation() {
    const rotationX = 0.65;
    const rotationY = 0.80;

    this.set('application3D.rotation.x', rotationX);
    this.set('application3D.rotation.y', rotationY);
  },

  initInteraction() {
    const canvas = this.get('canvas');
    const camera = this.get('camera');
    const webglrenderer = this.get('webglrenderer');

    // Init interaction objects

    this.get('interaction').setupInteraction(canvas, camera, webglrenderer,
      this.get('application3D'));

    // Set listeners
    this.set('listeners2', new Set());

    this.get('listeners2').add([
      'renderingService',
      'redrawScene',
      () => {
        this.cleanAndUpdateScene();
      }
    ]);

    // start subscriptions
    this.get('listeners2').forEach(([service, event, listenerFunction]) => {
      this.get(service).on(event, listenerFunction);
    });
  }, // END initInteraction

  applyHeatmap(clazzList){

    // console.log(this.get("application3D.children")[1])
    // console.log(this.get('application3D').children)
    // let faceIndices = [];
    // let downVector = new THREE.Vector3(0, -1, 0)
    
    // let camera = this.get('camera');
    // var helper = new THREE.CameraHelper(camera);
    // this.get('application3D').add(helper)
    
    let raycaster = new THREE.Raycaster();

    clazzList.forEach(clazz => { 
    // let clazz = clazzList[0];
      let clazzMesh = this.get('application3D').getObjectByName(clazz.fullQualifiedName);
      if (clazzMesh){
        // TODO: scale pos with application size
        let viewPos = this.get("foundationMesh.position").clone();
        viewPos.y = Math.max(this.get('camera').position.z * 0.9, 75);
        viewPos.z += this.get("foundationMesh.geometry.parameters.depth") * 0.3;
        viewPos.x -= this.get("foundationMesh.geometry.parameters.width") * 0.3;
        let clazzPos = clazzMesh.position;
        let rayVector = clazzPos.clone().sub(viewPos); 


        let material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
        let points = [];
        points.push(viewPos)
        points.push(clazzPos)
        points.push(clazzPos.clone().add(rayVector))
        let geometry = new THREE.BufferGeometry().setFromPoints(points);

        let line = new THREE.Line(geometry, material);
        this.get('application3D').add(line);

        // console.log(cameraPos)
        // console.log(rayVector)
        // console.log(clazzPos)
        // let raycaster = new THREE.Raycaster(clazzPos, downVector);
        
        raycaster.set(clazzPos, rayVector.normalize());
        let intersects = raycaster.intersectObject(this.get("foundationMesh"));

        // console.log(clazzMesh.name)
        // console.log(intersects)
        
        intersects.forEach(val => {
          // faceIndices.push(val.faceIndex);
          this.setFaces(val.faceIndex, ["red", "orange", "yellow"]);
        })
      }
    });
    console.log("####################################################################")

    // faceIndices.forEach(index => {
    //   this.setFaces(index, ["red", "orange", "yellow"])
    // });

    this.get('foundationMesh').geometry.colorsNeedUpdate = true;
  },

  // TODO: add real values 
  setFaces(index, colors) {
    let depthSegments = this.get("foundationMesh.userData.depthSegments");
    let widthSegments = this.get('foundationMesh.userData.widthSegments');

    this.get('foundationMesh').geometry.faces[index].color.set(colors[0]);
    if (index % 2 === 0){
      this.get('foundationMesh').geometry.faces[index+1].color.set(colors[0])
    } else {
      this.get('foundationMesh').geometry.faces[index-1].color.set(colors[0])
    }

    // TODO: Color surrounding tiles 



    // Compute heatmapValues
    let gradientmap = heatmapGen.generateHeatmap(depthSegments, widthSegments);
    
    // Compute face numbers of top side of the cube 
    let depthoffset = depthSegments * 4;
    let size = widthSegments * depthSegments * 2;

    // Set dummy coloring of foundation mesh
    // for (let i = 0; i < size; i += 2) {
    //   if (i % (widthSegments * 2) !== 0) {
    //     this.get('foundationMesh').geometry.faces[i+depthoffset].color.set(gradientmap[i/2])
    //     this.get('foundationMesh').geometry.faces[i+depthoffset+1].color.set(gradientmap[i/2])
    //   } 
    // }
  }
});