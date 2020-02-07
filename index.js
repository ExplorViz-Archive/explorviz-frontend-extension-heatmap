'use strict';
module.exports = {
    name: 'explorviz-frontend-extension-heatmap',
    isDevelopingAddon: function () {
        return true;
    },
    included: function (app) {
        this._super.included.apply(this, arguments);
        app.import('vendor/style.css');
        app.import('vendor/landscape.json');
    }
};
