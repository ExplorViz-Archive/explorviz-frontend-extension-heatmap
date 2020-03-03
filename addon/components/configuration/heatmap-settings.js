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
      ahGradient: "Configure the array heat gradient. Use either rgb, hex or css-style format."
        + " The first stop value that is true for a metric is used."
    };

  },

  didReceiveAttrs(){
    this._super(...arguments);
    this.set('selectedMode', (this.get('heatmapRepo.selectedMode')==="aggregatedHeatmap")? this.heatmapModes[0] : this.heatmapModes[1]);
  },

  actions: {

    setHeatmapMode(mapMode) {
      this.set('selectedMode', mapMode);
      this.set('heatmapRepo.selectedMode', mapMode.id);
      this.get('heatmapRepo').triggerLatestHeatmapUpdate();
    },
  },

});
