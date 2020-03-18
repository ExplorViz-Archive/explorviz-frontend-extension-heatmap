import Component from '@ember/component';
import {inject as service} from '@ember/service';
import layout from '../../templates/components/configuration/heatmap-settings';

export default Component.extend({
  
  layout,
  
  heatmapRepo: service('repos/heatmap-repository'),
  
  descriptions: null,
  selectedMode: null,
  shVisible: false,
  ahVisible: false,
  opacityValue: null,
  heatmapRadius: null,
  blurRadius: null,

  init() {
    this._super(...arguments);

    this.heatmapModes = this.heatmapModes || [
      {name: "Aggregated Heatmap", id: "aggregatedHeatmap"}, 
      {name: "Windowed Heatmap", id: "windowedHeatmap"}
    ];

    this.descriptions = this.descriptions ||  {
      heatmapMode: "Aggregated Heatmap: The previous heatmaps influence the current"  
        + " value to a certain amount. Windowed Heatmap: The landscape metrics are" 
        + " compared with the respective value of the time window specified in the backend.",
      visualizationMode: "Use a heatmap visualized with simpleheat or an array based heatmap.",
      helperLines: "Show the helper lines to determine which point on the heatmap belongs to which class.",
      shGradient: "Configure the simple heat gradient. Use either rgb, hex or css-style format.",
      ahGradient: "Configure the array heat gradient. Use either rgb, hex or css-style format.",
      opacityValue: "Set the opacity of the package boxes. Choose a value between 0 and 1.",
      showLegendValues: "Select wether the raw heatmap values or their abstractions should be shown as label.",
      heatmapRadius: "The size of each color point.",
      blurRadius: "The radius at which the colors blur together.",
    };

  },

  didReceiveAttrs(){
    this._super(...arguments);
    this.set('selectedMode', (this.get('heatmapRepo.selectedMode')==="aggregatedHeatmap")? this.heatmapModes[0] : this.heatmapModes[1]);
    this.set('opacityValue', this.get('heatmapRepo.opacityValue'));
    this.set('heatmapRadius', this.get('heatmapRepo.heatmapRadius'));
    this.set('blurRadius', this.get('heatmapRepo.blurRadius'));
  },

  actions: {

    setHeatmapMode(mapMode) {
      this.set('selectedMode', mapMode);
      this.set('heatmapRepo.selectedMode', mapMode.id);
      this.get('heatmapRepo').triggerLatestHeatmapUpdate();
    },

    onOpacityValueChange(newValue) {
      this.set('heatmapRepo.opacityValue', newValue);
    },

    onHeatmapRadiusChange(newValue) {
      this.set('heatmapRadius', newValue);
      this.set('heatmapRepo.heatmapRadius', newValue);
    },

    onBlurRadiusChange(newValue) {
      this.set('blurRadius', newValue);
      this.set('heatmapRepo.blurRadius', newValue);
    },


    resetSimpleHeatGradient() {
      this.get('heatmapRepo').resetSimpleHeatGradient();
    },

    resetArrayHeatGradient() {
      this.get('heatmapRepo').resetArrayHeatGradient();
    },
  },

});
