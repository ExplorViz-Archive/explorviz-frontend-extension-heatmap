import Component from '@ember/component';
import { inject as service } from '@ember/service';
import $ from 'jquery';

import layout from '../../../../templates/components/visualization/page-setup/navbar/metric-selector';

export default Component.extend({

  heatmapRepository: service('repos/heatmap-repository'),

  tagName: '',
  layout,

  metrics: null,
  choice: null,
  actions: {
    selectMetric(metric) {
      this.set('choice', metric)
      this.set('heatmapRepository.selectedMetric', metric.typeName)
      this.heatmapRepository.triggerMetricUpdate();
     }
  },

  didReceiveAttrs(){
    this._super(...arguments);
    this.set('metrics', this.get("heatmapRepository.metrics"));
    this.set('choice', this.get('metrics')[0]);
    this.set('heatmapRepository.selectedMetric', this.get('choice.typeName'));
  },

  didRender(){
    this._super(...arguments);
    this.addStatusIcon();
  },

  addStatusIcon(){
    $(".metric-selector").first().append("<span class='ember-power-select-status-icon'></span>");
  }
});
