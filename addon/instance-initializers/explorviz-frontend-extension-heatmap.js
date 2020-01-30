import Router from "explorviz-frontend/router";

export function initialize(appInstance) {

  const service = appInstance.lookup("service:page-setup");

  if(service){
    service.get("navbarRoutes").push("heatmap");
  }

  Router.map(function() {
    this.route("heatmap");
  });
}

export default {
  name: 'explorviz-frontend-extension-heatmap',
  initialize
};