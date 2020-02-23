import Model, {attr, hasMany} from '@ember-data/model';

export default class ApplicationMetricCollection extends Model{

  @attr('string') appName;
  @attr('string') appId;

  @hasMany('applicationMetric') metricValues;
}
