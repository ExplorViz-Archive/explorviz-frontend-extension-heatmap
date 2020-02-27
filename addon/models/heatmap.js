import Model, {attr, belongsTo} from '@ember-data/model';

/**
 * Ember model for a heatmap.
 */
export default class Heatmap extends Model {
  @attr('number') windowsize;
  @attr('number') timestamp;
  @attr('string') landscapeId;

  @belongsTo('landscapeMetric') aggregatedHeatmap;
  @belongsTo('landscapeMetric') windowedHeatmap;
  
  getAggregatedHeatmap() {
    return this.get("aggregatedHeatmap");
  }

  getWindowedHeatmap() {
    return this.get("windowedHeatmap");
  }

}
