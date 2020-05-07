import Component from '@ember/component';
import {inject as service} from '@ember/service';
import layout from '../templates/components/heatmap-legend';
import $ from 'jquery';
import debugLogger from 'ember-debug-logger';

export default Component.extend({
  layout,
  tagName: '',

  debug: debugLogger(),

  heatmapRepo: service('repos/heatmap-repository'),
  renderingService: service(''),

  descriptions: null,
  listeners: null,
  destroyed: true,

  init() {
    this._super(...arguments);

    this.descriptions = this.descriptions || {
      "aggregatedHeatmap": "Aggregates subsequent heatmaps by adding a part of the previous metric score to the new value.",
      "windowedHeatmap": "Compares the latest metric score by difference to a previous one. The heatmap to be compared to is defined by the windowsize in the backend."
    }

    this.set('destroyed', false);
  },

  didRender(){
    this._super(...arguments);
    this.initHeader();
    this.initLegend();
    this.initLabel();
    this.updateLabel();
    this.initListeners()
  },

  willDestroyElement() {
    this.cleanup();
    this._super(...arguments);
  },

  initHeader(){
    let header = "Header";
    let subheader = "Subheader";
    if (this.get("heatmapRepo.selectedMode") === "aggregatedHeatmap") {
      header = "Aggregated Heatmap";
      subheader = "Aggregated score:"
    } else if (this.get("heatmapRepo.selectedMode") === "windowedHeatmap") {
      header = "Windowed Heatmap";
      subheader = "Value difference:";
    }

    $('#legend-header-content').text(header);
    $('#legend-subheader').text(subheader)
    
  },

  initLegend(){
    const canvas = $('#legend-canvas').get(0);
    canvas.width = $('#heatmap-legend').innerWidth();
    canvas.height = $('#heatmap-legend').innerHeight();
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0,canvas.height,0,0);

    if (this.get("heatmapRepo.useSimpleHeat")){
      let heatmapGradient = this.heatmapRepo.getSimpleHeatGradient();
      Object.keys(heatmapGradient).forEach(key => {
        grad.addColorStop(key, heatmapGradient[key]);
      });
    } else {
      let heatmapGradient = this.heatmapRepo.getArrayHeatGradient();
      Object.keys(heatmapGradient).forEach(key => {
        grad.addColorStop(Number(key)+0.50, heatmapGradient[key]);
      });
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0,0, canvas.width, canvas.height);
  },

  initLabel(){
    const canvas = $('#legend-canvas-label').get(0)
    canvas.width = $('#heatmap-legend-label').innerWidth();
    canvas.height = $('#heatmap-legend-label').innerHeight();
  },

  initListeners() {
    this.set('listeners', new Set());
    
    this.get('listeners').add([
      'heatmapRepo',
      'newSelectedMetric',
      () => {
        this.updateLabel();
      }
    ]);

    this.get('listeners').add([
      'heatmapRepo',
      'updatedClazzMetrics',
      () => {
        this.updateLabel();
      }
    ]);

    this.get('listeners').add([
      'renderingService',
      'resizeCanvas',
      () => {
        this.cleanAndUpdate();
      }
    ]);

    // start subscriptions
    this.get('listeners').forEach(([service, event, listenerFunction]) => {
      this.get(service).on(event, listenerFunction);
    });
  
  },

  cleanup() {
    this.debug('Cleaning legend listeners.')
    this.get('listeners').forEach(([service, event, listenerFunction]) => {
      this.get(service).off(event, listenerFunction);
    });
    this.set('listeners', null);
    this.set('destroyed', true);
  },

  cleanAndUpdate(){
    const canvas = $('#legend-canvas').get(0);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    
    this.initHeader();
    this.initLegend();
    this.initLabel();
    this.updateLabel();
  },

  updateLabel() {
    if (this.get("destroyed")) {
      return;
    }

    const canvas = $('#legend-canvas-label').get(0)
    const ctx = canvas.getContext("2d");

    let minLabel = "min";
    let midLabel = "mid";
    let maxLabel = "max";

    if (this.get("heatmapRepo.showLegendValues")) {
      let largestValue = Math.round(this.get("heatmapRepo.largestValue"))+2;
      if (this.get("heatmapRepo.selectedMode") === "aggregatedHeatmap") {
        minLabel = 0;
        midLabel = largestValue/4;
        maxLabel = largestValue/2;
      } else {
        minLabel = -largestValue/2;
        midLabel = 0;
        maxLabel = largestValue/2;
      }
    } else {
      if (this.get("heatmapRepo.selectedMode") === "aggregatedHeatmap") {
        minLabel = 0;
      } else {
        midLabel = 0;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `1.5vh Arial`;
    ctx.textAlign = "center";
    ctx.fillText(maxLabel, canvas.width/2, canvas.height*0.05);
    ctx.fillText(midLabel, canvas.width/2, canvas.height*0.525);
    ctx.fillText(minLabel, canvas.width/2, canvas.height*0.99);
  }
});
