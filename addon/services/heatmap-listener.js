import Service from '@ember/service';
import config from 'explorviz-frontend/config/environment';
import { inject as service } from "@ember/service";
// import { getOwner } from '@ember/application';
import Evented from '@ember/object/evented';
// import ModelUpdater from 'explorviz-frontend/utils/model-update';
import debugLogger from 'ember-debug-logger';
import { set } from '@ember/object';

/*global EventSourcePolyfill*/
export default class HeatmapListener extends Service.extend(Evented) {

  // https://github.com/segmentio/sse/blob/master/index.js

  // content null;
  @service('session') session;
  @service('store') store;
  @service('repos/heatmap-repository') heatmapRepo;
  // @service('repos/timestamp-repository') timestampRepo!;
  @service('repos/landscape-repository') landscapeRepo;
  latestJsonHeatmap = null;
  // modelUpdater = null;
  es = null;

  pauseVisualizationReload = false;

  debug = debugLogger();

  constructor() {
    super(...arguments);
  }

  initSSE() {
    set(this, 'content', []);

    const url = config.APP.API_ROOT;
    const { access_token } = this.session.data.authenticated;

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
        console.dir(jsonHeatmap, {depth:null});
        this.debug(`Received Heatmap ${jsonHeatmap.data.id} for landscape ${jsonHeatmap.data.attributes.landscapeId}.`)
        // let ls = this.store.peekRecord('landscape', jsonHeatmap.data.attributes.landscapeId);
        // console.dir(ls, {depth:null});

        set(this, 'latestJsonHeatmap', jsonHeatmap);
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

          set(this.heatmapRepo, "metrics", metrics)
          this.debug("Updated metric list.")
        }

        set(this.heatmapRepo, 'latestHeatmap', heatmapRecord);
        this.heatmapRepo.triggerLatestHeatmapUpdate();
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
        console.error(event);
    };

    return source.close.bind(source);
  }
}