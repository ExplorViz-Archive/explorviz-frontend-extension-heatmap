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
      this.controller.send('resetView');
      this.controller.set('landscapeRepo.latestApplication', null);
    },

  actions: {
    // @Override BaseRoute
    resetRoute() {
      this.controller.send('resetView');
      this.controller.set('landscapeRepo.latestApplication', null);
    },

    // @Override
    didTransition() {
      this.controller.hideVersionbar();
      this.controller.showTimeline();
    }
  }
});
