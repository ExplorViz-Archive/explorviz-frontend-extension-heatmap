import Model, {attr, hasMany} from '@ember-data/model';


export default class LandscapeMetrics extends Model{

  @attr('number') timestamp;
  @attr('string') landscapeId;
  
  @hasMany('metric') metrics;
  @hasMany('applicationMetricCollection') applicationMetricCollections;
}
