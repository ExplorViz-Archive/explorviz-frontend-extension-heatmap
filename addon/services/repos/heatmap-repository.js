import Service from '@ember/service';
import Evented from '@ember/object/evented';

export default class HeatmapRepository extends Service.extend(Evented) {
  latestHeatmap = null;
  latestApplicationHeatmap = null;

  triggerLatestHeatmapUpdate() {
    this.trigger("updated", this.get("latestHeatmap"));
  }
}