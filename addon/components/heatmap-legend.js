import Component from '@ember/component';
import {inject as service} from '@ember/service';
import layout from '../templates/components/heatmap-legend';
import $ from 'jquery';

export default Component.extend({
  layout,

  heatmapRepo: service('repos/heatmap-repository'),

  didRender(){
    this._super(...arguments);
    this.initLegend();
  },

  willDestroy() {
    this._super(...arguments);
    // TODO: Remove canvas to avoid memory leak?
  },

  initLegend(){
    const canvas = $('#legend-canvas').get(0)
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

});
