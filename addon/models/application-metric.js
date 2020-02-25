import Model, {attr, hasMany} from '@ember-data/model';

export default class ApplicationMetric extends Model{
  @attr('string') metricType;

  @hasMany('clazzMetric') classMetricValues;


  getClassMetricValues() {
    let classMetrics = new Map();
    this.get("classMetricValues").forEach(element => {
      classMetrics.set(element.clazzName, element.value)
    });

    return classMetrics;
  }
}
