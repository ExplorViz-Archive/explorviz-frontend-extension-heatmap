import Controller from '@ember/controller';
import {inject as service} from '@ember/service';
import { computed, action, get, set, observer } from '@ember/object';

export default class HeatmapController extends Controller.extend({

  // eslint-disable-next-line ember/no-observers
  timelineResetObserver: observer('landscapeListener.pauseVisualizationReload', function() {
    // reset highlighting and selection in timeline, if unpause was clicked
    if(!get(this, "landscapeListener.pauseVisualizationReload")) {
      set(this, "selectedTimestampRecords", []);
      get(this, 'plotlyTimelineRef').resetHighlighting();
    }
  })

}) 
{

  @service("rendering-service") renderingService;
  @service("repos/landscape-repository") landscapeRepo;
  @service("repos/heatmap-repository") heatmapRepo;
  @service("landscape-listener") landscapeListener;
  @service("heatmap-listener") heatmapListener;
  @service("additional-data") additionalData;
  @service("repos/timestamp-repository") timestampRepo;
  @service("heatmap-reload-handler") heatmapReloadHandler;

  state = null;

  type = 'heatmap';

  plotlyTimelineRef = null;

  selectedTimestampRecords = [];

  @computed('landscapeRepo.latestApplication', 'heatmapRepo.metrics')
  get showLandscape() {
    return (!get(this, 'landscapeRepo.latestApplication')) || (!get(this, 'heatmapRepo.metrics'));
  }

  @action
  resize() {
    get(this, 'renderingService').resizeCanvas();
  }

  @action
  resetView() {
    get(this, 'renderingService').reSetupScene();
    get(this, 'plotlyTimelineRef').continueTimeline(get(this, "selectedTimestampRecords"));
  }

  @action
  openLandscapeView() {
    set(this, 'landscapeRepo.latestApplication', null);
    set(this, 'landscapeRepo.replayApplication', null);
  }

  @action
  toggleTimeline() {
    get(this, 'renderingService').toggleTimeline();
  }

  @action
  timelineClicked(timestampRecordArray) {
    set(this, "selectedTimestampRecords", timestampRecordArray);
    get(this, 'heatmapReloadHandler').loadModelByTimestamp(timestampRecordArray[0].get("timestamp"));
  }

  @action
  getTimelineReference(plotlyTimelineRef) {
    // called from within the plotly timeline component
    set(this, 'plotlyTimelineRef', plotlyTimelineRef);
  }

  showTimeline() {
    set(this, 'renderingService.showTimeline', true);
  }

  hideVersionbar(){
    set(this, 'renderingService.showVersionbar', false);
  }

  initRendering() {
    get(this, 'landscapeListener').initSSE();
    get(this, 'heatmapListener').initSSE();
  }

  // @Override
  cleanup() {
    this._super(...arguments);
  }
}