/**
 * This module is responsible for setting up the hooks for cucumber.
 *
 * It will perform the following actions
 *   1. add some helper functions to the helper for easier testing
 *   2. at the end of the tests it will close the browser session
 *
 */
process.env.PATH = './node_modules/chromedriver/bin:' + process.env.PATH;

var _ = require('lodash');

module.exports = function() {
    var world;

    this.setDefaultTimeout(20 * 1000);

    /**
     * Before the feature features starts, import all functions and vars
     * into the world variable
     */
    this.Before(function() {
        world = this;
    });

    /**
     * After each scenario close the browser windows if required
     */
    this.After(function(scenario) {
        var closeBrowser = false;
        if(scenario.getTags) {
            if(scenario.isFailed()) {
                closeBrowser = true;
            }
        } else {
            closeBrowser = true;
        }

        if(closeBrowser) {
            return world.closeBrowserWindows();
        }
    });

    /**
     * Runs after all the features are finished, it closes all open
     * selenium browser windows
     */
    this.registerHandler('AfterFeatures', function(event, callback) {
        world.closeBrowserWindows()
            .then(callback.bind(this, null), callback.fail);
    });
};

