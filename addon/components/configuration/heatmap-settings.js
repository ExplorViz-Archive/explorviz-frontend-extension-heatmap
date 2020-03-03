import Component from '@ember/component';
import {inject as service} from '@ember/service';
import layout from '../../templates/components/configuration/heatmap-settings';




export default Component.extend({

  layout,

  heatmapRepo: service('repos/heatmap-repository'),

  selectedMode: null,
  useSimpleHeat: null,
  useHelperLines: null,
  simpleHeatGradient: null,
  shCollapsed: true,

  init() {
    this._super(...arguments);

    this.heatmapModes = this.heatmapModes || [
      {name: "Aggregated Heatmap", id: "aggregatedHeatmap"}, 
      {name: "Windowed Heatmap", id: "windowedHeatmap"}
    ];

    this.dropdownOptions = this.dropdownOptions || ["Enable", "Disable"];

    this.simpleHeatGradient = this.simpleHeatGradient || {};
  },

  didReceiveAttrs(){
    this._super(...arguments);
    this.set('selectedMode', (this.get('heatmapRepo.selectedMode')==="aggregatedHeatmap")? this.heatmapModes[0] : this.heatmapModes[1]);
    this.set('useSimpleHeat', this.get('heatmapRepo.useSimpleHeat')? "Enable" : "Disable");
    this.set('useHelperLines', this.get('heatmapRepo.useHelperLines')? "Enable" : "Disable");
  },

  actions: {

    setHeatmapMode(mapMode) {
      this.set('selectedMode', mapMode);
      this.set('heatmapRepo.selectedMode', mapMode.id);
      this.get('heatmapRepo').triggerLatestHeatmapUpdate();
    },

    setUseSimpleHeat(selection) {
      this.set('useSimpleHeat', selection);
      this.set('heatmapRepo.useSimpleHeat', !this.get('heatmapRepo.useSimpleHeat'));
      this.get('heatmapRepo').triggerConfigChanged();
    },

    setUseHelperLines(selection) {
      this.set('useHelperLines', selection);
      this.set('heatmapRepo.useHelperLines', !this.get('heatmapRepo.useHelperLines'));
      this.get('heatmapRepo').triggerConfigChanged();
    },

  },
});
