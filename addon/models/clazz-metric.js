import Model, {attr} from '@ember-data/model';

export default class ClazzMetric extends Model{
  @attr('string') clazzName;
  @attr('number') value;
}
