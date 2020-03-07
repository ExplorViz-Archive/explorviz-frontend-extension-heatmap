import { getOwner } from '@ember/application';
import Evented from '@ember/object/evented';
import {set} from '@ember/object';
import Service from '@ember/service';
import {inject as service} from '@ember/service'
import debugLogger from 'ember-debug-logger';
import AlertifyHandler from 'explorviz-frontend/utils/alertify-handler';
import ModelUpdater from 'explorviz-frontend/utils/model-update';


export default class HeatmapReloadHandler extends Service.extend(Evented){

  @service('store') store;
  @service('repos/heatmap-repository') heatmapRepo;
  @service('repos/landscape-repository') landscapeRepo;
  @service('landscape-listener') landscapeListener;
  @service('heatmap-listener') heatmapListener;


  debug = debugLogger();
  modelUpdater = null;

  constructor() {
    super(...arguments);
    if (!this.modelUpdater) {
      set(this, 'modelUpdater', ModelUpdater.create(getOwner(this).ownerInjection()));
    }
  }

  /**
   * Loads a landscape from the backend and invokes a reload of the heatmap.
   * @param {*} timestamp 
   */
  loadModelByTimestamp(timestamp) {
    const self = this;

    self.debug("Start import landscape-request");

    self.store.queryRecord('landscape', { timestamp: timestamp }).then(success, failure).catch(error);

    function success(landscape) {
      // Pause the visualization
      self.landscapeListener.stopVisualizationReload();

      self.modelUpdater.addDrawableCommunication();
      set(self.landscapeRepo, 'latestLandscape', landscape);
      self.landscapeRepo.triggerLatestLandscapeUpdate();

      self.debug("end import landscape-request");

      self.loadHeatmapByTimestamp(timestamp, self);
    }

    function failure(e){
      self.heatmapRepo.cleanup();
      set(self.landscapeRepo, 'latestLandscape', null);
      AlertifyHandler.showAlertifyMessage("Model couldn't be requested!" +
        " Backend offline?");
        self.debug("Model couldn't be requested!", e);
    }
  
    function error(e) {
      self.heatmapRepo.cleanup();
      set(self.landscapeRepo, 'latestLandscape', null);
      self.debug("Error when fetching model: ", e);
    }
  }


  /**
   * Loads a heatmap from the backend and triggers a visualization reload.
   * @param {*} timestamp 
   */
  loadHeatmapByTimestamp(timestamp, self) {
    self.debug("Start import heatmap-request");
    
    self.store.queryRecord('heatmap', {timestamp: timestamp}).then(success, failure).catch(error);

    function success(heatmap){
      self.heatmapRepo.updateLatestHeatmap(heatmap);
      self.debug("End import heatmap-request")
    }

    function failure(e){
      self.heatmapRepo.cleanup();
      set(self.landscapeRepo, 'latestLandscape', null);
      AlertifyHandler.showAlertifyMessage("Model couldn't be requested!" +
        " Backend offline?");
        self.debug("Model couldn't be requested!", e);
    }

    function error(e) {
      self.heatmapRepo.cleanup();
      set(self.landscapeRepo, 'latestLandscape', null);
      self.debug("Error when fetching model: ", e);
    }
  }
}
