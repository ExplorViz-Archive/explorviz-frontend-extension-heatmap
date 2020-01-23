'use strict';

module.exports = {
  name: 'explorviz-frontend-extension-heatmap',

  isDevelopingAddon() {
    return true;
  }

  included: function(app) {
    this._super.included.apply(this, arguments);    
    app.import('vendor/style.css');
  }
};
