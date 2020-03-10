import { getOwner } from '@ember/application';
import Service from '@ember/service';
import { inject as service } from "@ember/service";
import Evented from '@ember/object/evented';
import {set} from '@ember/object';

import simpleHeatHelper from "../../utils/simple-heatmap";
import arrayHeatHelper from "../../utils/array-heatmap";
import heatmapGenerator from "../../utils/heatmap-generator";

import ModelUpdater from 'explorviz-frontend/utils/model-update';
import AlertifyHandler from 'explorviz-frontend/utils/alertify-handler';

import debugLogger from 'ember-debug-logger';

export default class HeatmapRepository extends Service.extend(Evented) {

  @service('repos/landscape-repository') landscapeRepo;
  @service('store') store;
  modelUpdater = null;

  constructor() {
    super(...arguments);
    if (!this.modelUpdater) {
      set(this, 'modelUpdater', ModelUpdater.create(getOwner(this).ownerInjection()));
    }
  }
  
  // Switch for the legend
  legendActive = true;

  // Heatmap data for rendering 
  latestHeatmaps = null;
  latestApplicationHeatmap = null;
  latestClazzMetrics = null;
  largestValue = null;

  metrics = null;
  selectedMetric = null;

  applicationID = null;

  // Switches and models used by config
  selectedMode = "aggregatedHeatmap";
  useSimpleHeat = true;
  useHelperLines = true; 
  opacityValue = 0.01;
  simpleHeatGradient = simpleHeatHelper.getDefaultGradient();
  arrayHeatGradient = arrayHeatHelper.getDefaultGradient();


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

  toggleLegend() {
    this.set("legendActive", !this.get("legendActive"));
  }

  computeClazzMetrics(applicationID) {
    if (this.get("latestHeatmaps")){
      let selectedMap = this.get("latestHeatmaps")[this.get("selectedMode")];
      let clazzMetrics = null;
      if(this.get("selectedMetric") && applicationID) {
        this.set("latestApplicationHeatmap", selectedMap.getApplicationMetric(applicationID, this.get("selectedMetric")));
        clazzMetrics = this.get("latestApplicationHeatmap").getClassMetricValues();
        this.set("latestClazzMetrics", clazzMetrics);
        this.set("largestValue", this.get("latestApplicationHeatmap.largestValue"));
        this.debug("Updated latest clazz metrics.")
      }
      return clazzMetrics;
    }
  }

  /**
   * Update the latest heatmap entry and trigger update.
   * @param {*} heatmap 
   */
  updateLatestHeatmap(heatmap) {
    
    heatmap.get('aggregatedHeatmap').then((aggMap)=>{
      heatmap.get('windowedHeatmap').then((windMap)=>{
        this.set('latestHeatmaps', {"landscapeId": heatmap.landscapeId,"aggregatedHeatmap": aggMap, "windowedHeatmap": windMap});
        if (heatmap.landscapeId === this.get('landscapeRepo.latestLandscape.id')) {
          this.triggerLatestHeatmapUpdate();
        } else {
          this.debug("Landscape and heatmap ids do not match. Requesting new landscape...")
          this.requestLandscape(heatmap.timestamp);
          this.triggerLatestHeatmapUpdate();
        }
      })
    })
  }


  /**
   * Return a gradient where the '_' character in the keys is replaced with '.'.
   */
  getSimpleHeatGradient(){
    return heatmapGenerator.revertKey(this.get("simpleHeatGradient"));
  }

  /**
   * Return a gradient where the '_' character in the keys is replaced with '.'.
   */
  getArrayHeatGradient(){
    return heatmapGenerator.revertKey(this.get("arrayHeatGradient"));
  }

  requestLandscape(timestamp) {
    const self = this;

    self.store.queryRecord('landscape', { timestamp: timestamp }).then(success, failure).catch(error);

    function success(landscape) {
      self.modelUpdater.addDrawableCommunication();
      set(self.landscapeRepo, 'latestLandscape', landscape);
      self.landscapeRepo.triggerLatestLandscapeUpdate();
      self.triggerLatestHeatmapUpdate();
    }

    function failure(e){
      self.cleanup();
      set(self.landscapeRepo, 'latestLandscape', null);
      AlertifyHandler.showAlertifyMessage("Model couldn't be requested!" +
        " Backend offline?");
      self.debug("Model couldn't be requested!", e);
    }
  
    function error(e) {
      self.cleanup();
      set(self.landscapeRepo, 'latestLandscape', null);
      self.debug("Error when fetching model: ", e);
    }
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
    this.set("largestValue", null);
  }

}