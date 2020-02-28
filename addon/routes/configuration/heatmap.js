import BaseRoute from 'explorviz-frontend/routes/base-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  configuration: service("configuration"),

  actions: {
    // @Override BaseRoute
    resetRoute() {
    }
  }

});