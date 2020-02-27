import Service from '@ember/service';
import { inject as service } from "@ember/service";
import Evented from '@ember/object/evented';

import debugLogger from 'ember-debug-logger';

// One of "aggregatedHeatmap", "windowedHeatmap"
const defaultMode = "aggregatedHeatmap"

export default class HeatmapRepository extends Service.extend(Evented) {

  @service('repos/landscape-repository') landscapeRepo;
  
  latestHeatmaps = null;
  latestApplicationHeatmap = null;
  latestClazzMetrics = null;

  metrics = null;
  selectedMetric = null;

  applicationID = null;

  selectedMode = defaultMode;

  debug = debugLogger();

  triggerLatestHeatmapUpdate() {
    this.computeClazzMetrics(this.get("applicationID"));
    this.trigger("updatedClazzMetrics", this.get("latestClazzMetrics"));
  }

  triggerMetricUpdate() { 
    this.computeClazzMetrics(this.get("applicationID"));
    this.trigger("newSelectedMetric", this.get("latestClazzMetrics"));
  }

  computeClazzMetrics(applicationID) {
    let selectedMap = this.get("latestHeatmaps")[this.get("selectedMode")];
    let clazzMetrics = null;
    if(this.get("selectedMetric") && applicationID) {
      this.set("latestApplicationHeatmap", selectedMap.getApplicationMetric(applicationID, this.get("selectedMetric")));
      clazzMetrics = this.get("latestApplicationHeatmap").getClassMetricValues();
      this.set("latestClazzMetrics", clazzMetrics);
      this.debug("Updated latest clazz metrics.")
    }
    return clazzMetrics;
  }


  /**
   * Reset all class attribute values to null;
   */
  cleanup() {
    this.set("latestHeatmaps", null);
    this.set("latestApplicationHeatmap", null);
    this.set("latestClazzMetrics", null);
    this.set("selectedMetric", null);
    this.set("applicationID", null);
    this.set("selectedMode", defaultMode);
    this.set("metrics", null);
  }

}