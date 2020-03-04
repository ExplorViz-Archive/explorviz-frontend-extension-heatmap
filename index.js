'use strict';
module.exports = {
    name: 'explorviz-frontend-extension-heatmap',
    isDevelopingAddon: function () {
        return true;
    },
    included: function (app) {
        this._super.included.apply(this, arguments);
        app.import('vendor/heatmap-style.css');
    }
};
