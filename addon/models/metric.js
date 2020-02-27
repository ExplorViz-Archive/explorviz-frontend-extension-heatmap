import Model, {attr, belongsTo} from '@ember-data/model';

export default class Metric extends Model{
  @attr('string') name;
  @attr('string') typeName;
  @attr('string') description;

  @belongsTo('landscapeMetric', {inverse:"metrics"}) parent;

  get metricAttributes(){
    return `${this.name}`
  }
}
