import Service from '@ember/service';
import { inject as service } from "@ember/service";
import Evented from '@ember/object/evented';

import debugLogger from 'ember-debug-logger';

export default class HeatmapRepository extends Service.extend(Evented) {

  @service('repos/landscape-repository') landscapeRepo;
  
  latestHeatmaps = null;
  latestApplicationHeatmap = null;
  latestClazzMetrics = null;

  metrics = null;
  selectedMetric = null;

  applicationID = null;

  // Switches used by config
  selectedMode = "aggregatedHeatmap";
  useSimpleHeat = true;
  useHelperLines = true; 

  debug = debugLogger();

  triggerLatestHeatmapUpdate() {
    this.computeClazzMetrics(this.get("applicationID"));
    this.trigger("updatedClazzMetrics", this.get("latestClazzMetrics"));
  }

  triggerMetricUpdate() { 
    this.computeClazzMetrics(this.get("applicationID"));
    this.trigger("newSelectedMetric", this.get("latestClazzMetrics"));
  }

  triggerConfigChanged() {
    this.trigger("configChanged")
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
    this.set("metrics", null);
  }

}