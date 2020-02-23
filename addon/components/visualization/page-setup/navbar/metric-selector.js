import Component from '@ember/component';
import layout from '../../../../templates/components/visualization/page-setup/navbar/metric-selector';

var metrics = [
  {name: 'dummy1', description: 'dummyDesc1'},
  {name: 'dummy2', description: 'dummyDesc2'},
  {name: 'dummy3', description: 'dummyDesc3'},
  {name: 'dummy4', description: 'dummyDesc4'},
];

const defaultChoice = {
  name: 'Select metric...',
  description: 'foo'
};

export default Component.extend({

  tagName: '',
  layout,

  metrics,
  choice: defaultChoice,
  actions: {
    selectMetric(metric) {
      this.set('choice', metric)
     }
  }
});
