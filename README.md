ExplorViz-Frontend-Extension-Heatmap
==============================================================================

This extension adds a new route to the ExplorViz frontend to visualize dynamicities, i.e. the progress, of certain metrics. The metrics arre added as a heatmap to the application visualization in the application perspective. The related backend extension can be found [here](https://github.com/ExplorViz/explorviz-backend-extension-heatmap).


Compatibility
------------------------------------------------------------------------------

* Ember.js v3.4 or above
* Ember CLI v2.13 or above
* Node.js v8 or above
* [ExplorViz Backend Version 1.5.0](https://github.com/ExplorViz/explorviz-backend/tree/1.5.0)
* [ExplorViz Frontend Version 1.5.0](https://github.com/ExplorViz/explorviz-frontend/tree/1.5.0)
* [EplorViz Backend Extension Heatmap](https://github.com/ExplorViz/explorviz-backend-extension-heatmap)

Installation
------------------------------------------------------------------------------

1. Setup and start the [ExplorViz Backend](https://github.com/ExplorViz/explorviz-backend/tree/1.5.0) and the [ExplorViz Backend Extension Heatmap](https://github.com/ExplorViz/explorviz-backend-extension-heatmap).

2. Follow the installation guide of the [ExplorViz Frontend](https://github.com/ExplorViz/explorviz-frontend#development).

3. Install this extension via `ember install https://github.com/ExplorViz/explorviz-frontend-extension-heatmap.git`.

4. Start the ExplorViz frontend either locally with `ember serve` or use `ember build --environment=production` and configure the `API.ROOT` environment variable to your machines IP address.

Usage
------------------------------------------------------------------------------

The extension adds the `/heatmap` route to the visualizaion of ExplorViz, which can be called from the navbar on the left. Metrics can be selected in the toolbar using the dropdown menu. 
Depending on the chosen heatmap type, which can be configured in the *heatmap* tab of the configuration route, the colors of the heatmap either show the difference to a previous heatmap or an aggregated value of former heatmaps.
For better comprehension of the represented color values we added a legend to the visualization, which can be toggled on and off with the new button below the `Back to Landscape` button. 

In the configuration we provide the selection of the individual heatmap types and visualization styles.
Furthermore, we added some preferences to customize the visualization.
The users can configure the used color gradients by changing the corresponding color values.
Color values can be insterted as rgb, hex or other css compliant strings.
They can, for instance be obtained from this [color picker](https://www.w3schools.com/colors/colors_picker.asp).

In order to provide information about the different metrics and configuration options we added tooltips to all new features.


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
