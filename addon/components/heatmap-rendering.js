  
import Component from '@ember/component';
// import { inject as service } from '@ember/service';
// import Evented from '@ember/object/evented';
import THREE from "three";
import layout from '../templates/components/heatmap-rendering'
import $ from 'jquery';
import heatmapGen from '../utils/heatmap-generator'

export default Component.extend({

  didRender(){
    this._super(...arguments);
    // eslint-disable-next-line no-console
    // console.log(this.element);
    // eslint-disable-next-line no-console
    // console.log($('#threeCanvas')[0]);
    // eslint-disable-next-line no-console
    // console.log(layout);
      this.initRendering();
  },
  // history: service(),
  // broadcast: service(),
  name: "asd",
  scene: null,
  camera: null,
  webglrenderer: null,

  canvas: null,

  animationFrameId: null,

  // isDestroyed: null,

  initRendering() {

    const self = this;

    const height = $('#rendering').innerHeight();
    const width = $('#rendering').innerWidth();

    const canvas = $('#threeCanvas')[0];

    this.set('canvas', canvas);

    this.set('scene', new THREE.Scene());

  //   //backgroundcolor?
    
    this.set('camera', new THREE.PerspectiveCamera(75, width/height, 0.1, 1000));

    this.set('webglrenderer', new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas
    }));

    this.get('webglrenderer').setPixelRatio(window.devicePixelRatio);
    this.get('webglrenderer').setSize(width, height);
    

    let objectHeight = 100;
    let objectWidth = 100;
    let heightSegments = Math.floor(objectHeight/10);
    let widthSegments = Math.floor(objectWidth/10);

    let geometry = new THREE.PlaneGeometry(objectHeight, objectWidth, heightSegments, widthSegments);
    let material = new THREE.MeshBasicMaterial( {vertexColors: THREE.FaceColors} );
    let wireMaterial = new THREE.MeshBasicMaterial({ color: "black", wireframe: true});
    let object = new THREE.Mesh(geometry, material);
    let wireObject = new THREE.Mesh(geometry, wireMaterial);

    this.get('scene').add(object);
    // object.add(wireObject);
    
    console.log(object);
    
    let gradientmap = heatmapGen.generateHeatmap(heightSegments, widthSegments);

    for (var i = 0; i<object.geometry.faces.length; i+=2) {
        object.geometry.faces[i].color.set(gradientmap[i/2])
        object.geometry.faces[i+1].color.set(gradientmap[i/2])
    }
    object.geometry.colorsNeedUpdate = true;

    this.get('camera').position.z = 150;

    // Rendering loop
    function render() {
      // if (self.get('isDestroyed')) {
      //   return;
      // }

      const animationId = requestAnimationFrame(render);
      self.set('animationFrameId', animationId);

      // object.rotation.x += 0.01;
      // object.rotation.y += 0.01;

      self.get('webglrenderer').render(self.get('scene'), self.get('camera'));
    }
    render();
  },
  layout
});
