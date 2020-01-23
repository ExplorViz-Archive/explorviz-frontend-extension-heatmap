import Router from "explorviz-frontend/router";

export function initialize(appInstance) {

  const service = appInstance.lookup("service:page-setup");

  if(service){
    service.get("navbarRoutes").push("Heatmap");
  }

  Router.map(function() {
    this.route("Heatmap");
  });
}

export default {
  name: 'explorviz-frontend-extension-heatmap',
  initialize
};