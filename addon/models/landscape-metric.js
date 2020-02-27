import Model, {attr, hasMany} from '@ember-data/model';


export default class LandscapeMetric extends Model{

  @attr('number') timestamp;
  @attr('string') landscapeId;
  
  @hasMany('metric', { polymorphic: true }) metrics;
  @hasMany('applicationMetricCollection') applicationMetricCollections;

  getApplicationMetricCollectionById(applicationId) {
    let appCollection;
    this.get('applicationMetricCollections').forEach((tmpCollection) => {
      if (!appCollection && tmpCollection.get("appId") === applicationId) {
        appCollection = tmpCollection;
      }
    });
    return appCollection;
  }

  getApplicationMetric(applicationId, metricType){
    let appCollection = this.getApplicationMetricCollectionById(applicationId);

    let appMetrics;
    appCollection.get('metricValues').forEach((tmpMetric) => {
      if (!appMetrics && tmpMetric.get("metricType") === metricType) {
        appMetrics = tmpMetric;
      }
    });
    return appMetrics
  }

}
