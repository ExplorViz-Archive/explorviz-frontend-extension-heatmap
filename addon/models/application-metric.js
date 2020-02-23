import Model, {attr, hasMany} from '@ember-data/model';

export default class ApplicationMetric extends Model{
  @attr('string') metricName;

  @hasMany('clazzMetric') classMetricValues;
}
