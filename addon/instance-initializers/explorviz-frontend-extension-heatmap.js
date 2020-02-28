import Router from "explorviz-frontend/router";

export function initialize(appInstance) {

  const service = appInstance.lookup("service:page-setup");
  const configService = appInstance.lookup("service:configuration");
  
  // Set description for heatmap extension configuration route.
  const extensionDescription = {
    id: 'heatmap',
    title: 'Heatmap',
    link: 'configuration.heatmap',
    nestedRoute: 'heatmap',
    paneName: 'heatmapPane'
  };
  
  if(service){
    service.get("navbarRoutes").push("heatmap");
  }

  Router.map(function() {
    this.route("heatmap");
  });

  // Add the heatmap extension configuration route.
  configService.get('configurationExtensions').addObject(extensionDescription);
  Router.configurationRouteExtensions.push('heatmap');
}

export default {
  name: 'explorviz-frontend-extension-heatmap',
  after: 'router',
  initialize
};