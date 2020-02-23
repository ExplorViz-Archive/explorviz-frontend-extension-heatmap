import BaseRoute from 'explorviz-frontend/routes/base-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';


export default BaseRoute.extend(AuthenticatedRouteMixin, {

    // @Override
    setupController(controller, model) {
      // Call _super for default behavior
      this._super(controller, model);
  
      controller.initRendering();
    },
  
    resetRoute() {
      this.controllerFor('heatmap').send('resetView');
      this.controllerFor('heatmap').set('landscapeRepo.latestApplication', null);
    },

  actions: {
    // @Override BaseRoute
    resetRoute() {
      this.controllerFor('heatmap').send('resetView');
      this.controllerFor('heatmap').set('landscapeRepo.latestApplication', null);
    },

    // @Override
    didTransition() {
      this.controllerFor('heatmap').hideVersionbar();
      this.controllerFor('heatmap').showTimeline();
    }
  }
});
