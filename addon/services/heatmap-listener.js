import Service from '@ember/service';
import config from 'explorviz-frontend/config/environment';
import { inject as service } from "@ember/service";
// import { getOwner } from '@ember/application';
import Evented from '@ember/object/evented';
// import ModelUpdater from 'explorviz-frontend/utils/model-update';
import debugLogger from 'ember-debug-logger';
import { set, computed } from '@ember/object';

/*global EventSourcePolyfill*/
export default class HeatmapListener extends Service.extend(Evented
){
  // https://github.com/segmentio/sse/blob/master/index.js

  @service('session') session;
  @service('store') store;
  @service('landscape-listener') landscapeListener;
  @service('repos/heatmap-repository') heatmapRepo;
  @service('repos/landscape-repository') landscapeRepo;
  
  es = null;

  @computed('landscapeListener.pauseVisualizationReload')
  get pauseVisualizationReload() {
    return this.get('landscapeListener.pauseVisualizationReload');
  }

  debug = debugLogger();

  initSSE() {
    set(this, 'content', []);

    const url = config.APP.API_ROOT;
    // const { access_token } = this.session.data.authenticated;

    // Close former event source. Multiple (>= 6) instances cause the ember store to no longer work
    let es = this.es;
    if (es) {
      es.close();
    }

    // ATTENTION: This is a polyfill (see vendor folder)
    // Replace if original EventSource API allows HTTP-Headers
    set(this, 'es', new EventSourcePolyfill(`${url}/v1/heatmap/broadcast/`, {
      // headers: {
      //   Authorization: `Bearer ${access_token}`
      // }
    }));

    es = this.es;

    set(es, 'onmessage', (event) => {
      const jsonHeatmap = JSON.parse(event.data);
      
      if (jsonHeatmap && jsonHeatmap.hasOwnProperty('data')) {
        
        this.debug(`Received new Heatmap.`);
        if (!this.pauseVisualizationReload) {

          // this.store.unloadAll('heatmap');
          // this.store.unloadAll('landscape-metric-collection');
          // this.store.unloadAll('landscape-metric');
          // this.store.unloadAll('application-metric');
          // this.store.unloadAll('clazz-metric');
          
          const heatmapRecord = this.store.push(jsonHeatmap);
  
          // Register the metrics the first time they are pushed.
          if (!this.get('heatmapRepo.metrics')) {
            let metrics = [];
  
            jsonHeatmap.data.attributes.metricTypes.forEach(type => {
              let metric = this.store.peekAll(type).objectAt(0);
              metrics.push({
                name: metric.name,
                typeName: metric.typeName,
                description: metric.description
              })
            })
  
            set(this.heatmapRepo, "metrics", metrics);
            set(this.heatmapRepo, "windowsize", jsonHeatmap.data.attributes.windowsize);
            this.debug("Updated metric list.");
          }
  
          this.get('heatmapRepo').updateLatestHeatmap(heatmapRecord);
        } else {
            // visualization is paused
            this.debug("Visualization update paused");
        }
      }
    });
  }

  subscribe(url, fn) {
    let source = new EventSource(url);

    source.onmessage = (event) => {
      fn(event.data);
    };

    source.onerror = (event) => {
      if (source.readyState !== EventSource.CLOSED)
        // eslint-disable-next-line no-console
        console.error(event);
    };

    return source.close.bind(source);
  }
}