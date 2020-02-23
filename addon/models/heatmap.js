import Model, {attr, belongsTo} from '@ember-data/model';

/**
 * Ember model for a heatmap.
 */
export default class Heatmap extends Model {
  @attr('number') windowsize;
  @attr('number') timestamp;
  @attr('string') landscapeId;

  @belongsTo('landscapeMetrics') aggregatedHeatmap;
  @belongsTo('landscapeMetrics') windowedHeatmap;
}
