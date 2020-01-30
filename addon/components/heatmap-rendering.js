  
import Component from '@ember/component';
import { inject as service } from '@ember/service';
// import Evented from '@ember/object/evented';
import THREE from "three";
import layout from '../templates/components/heatmap-rendering';
import debugLogger from 'ember-debug-logger';
import $ from jquery;

export default Component.extend({

  debug: debugLogger(),

  history: service(),
  broadcast: service(),

  scene: null,
  camera: null,
  webglrenderer: null,

  camera: null,
  canvas: null,
  geometry: null,
  material: null,

  animationFrameId: null,

  isDestroyed: null,

  // init() {
  //   this._super(...arguments);
  //   this.set('appCondition', []);
  // },

  didRender() {
    this._super(...arguments);
    this.initRendering();
    // this.initListener();
  },

  initRendering() {
    const self = this;

    const height = $('#rendering').innerHeight();
    const width = $('#rendering').innerWidth();

    const canvas = $('#threeCanvas')[0];

    this.set('canvas', canvas);

    this.set('scene', new THREE.Scene());

    //backgroundcolor?
    
    this.set('camera', new THREE.PerspectiveCamera(75, width/height, 0.1, 1000));

    this.set('webglrenderer', new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas
    }));
    this.get('webglrenderer').setPixelRatio(window.devicePixelRatio);
    this.get('webglrenderer').setSize(width, heigth);


    // Dummy model

    let geometry = new THREE.BoxGeometry(1,2,1);
    let material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    let cube = new THREE.Mesh(geometry, material);
    this.get('scene').add(cube);

    // Rendering loop
    function render() {
      if (self.get('isDestroyed')) {
        return;
      }

      const animationId = requestAnimationFrame(render);
      self.set('animationFrameId', animationId);

      self.get('webglrenderer').render(self.get('scene'), self.get('camera'));
    }
    
    render();
  }








});
