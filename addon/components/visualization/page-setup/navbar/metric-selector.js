import Component from '@ember/component';
import { inject as service } from '@ember/service';

import layout from '../../../../templates/components/visualization/page-setup/navbar/metric-selector';

var metrics = null;

const defaultChoice = {
  name: 'Select metric...',
  description: 'foo'
};

export default Component.extend({

  heatmapRepository: service('repos/heatmap-repository'),

  tagName: '',
  layout,

  metrics,
  choice: null,
  actions: {
    selectMetric(metric) {
      this.set('choice', metric)
      this.set('heatmapRepository.selectedMetric', metric.typeName)
      this.heatmapRepository.triggerMetricUpdate();
     }
  },

  didRender() {
    this._super(...arguments);
    this.set('metrics', this.get("heatmapRepository.metrics"));
    if (!this.get("choice") && this.get("metrics")){
      this.set("choice", this.get("metrics")[0])
      this.set('heatmapRepository.selectedMetric', metric.typeName)
      this.heatmapRepository.triggerMetricUpdate();
    }
  }
  
});
