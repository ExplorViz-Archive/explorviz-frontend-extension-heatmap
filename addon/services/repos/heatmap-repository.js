import Service from '@ember/service';
import Evented from '@ember/object/evented';

import debugLogger from 'ember-debug-logger';

export default class HeatmapRepository extends Service.extend(Evented) {
  
  latestHeatmap = null;
  latestApplicationHeatmap = null;
  latestClazzMetrics = null;

  metrics = null;
  selectedMetric = null;

  applicationID = null;

  // One of "aggregatedHeatmap", "windowedHeatmap"
  selectedMode = "aggregatedHeatmap";

  debug = debugLogger();

  triggerLatestHeatmapUpdate() {
    this.debug("Updated latest heatmap.")
    let selectedMap = this.get("selectedMode");
    this.get("latestHeatmap").get(selectedMap).then((aggregatedHeatmap) => {
      if(this.get("selectedMetric") !== null) {
        this.set("latestApplicationHeatmap", aggregatedHeatmap.getApplicationMetric(this.get("applicationID"), this.get("selectedMetric")));
        this.set("latestClazzMetrics", this.get("latestApplicationHeatmap").getClassMetricValues());
        this.trigger("updatedClazzMetrics", this.get("latestClazzMetrics"));
      }
    });
  }

  triggerMetricUpdate() { 
    this.debug(`Updating selected metric to ${this.selectedMetric}`);
    this.trigger("newSelectedMetric", this.get("selectedMetric"));
  }

  /**
   * Reset all class attribute values to null;
   */
  cleanup() {
    this.set("latestHeatmap", null);
    this.set("latestApplicationHeatmap", null);
    this.set("latestClazzMetrics", null);
    this.set("metrics", null);
    this.set("selectedMetric", null);
    this.set("applicationID", null);
    this.set("selectedMode", "aggregatedHeatmap");
  }

}