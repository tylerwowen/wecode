/**
 * World is the testing world that cucumber will be
 * running on, so the step definitions will inherit
 * all the functions in the world.js file that are
 * defined within the world function
 */
var webdriver = require('./webdriver');
var users = [];
process.env.CUCUMBER = true;


var World = function World() {
    var self = this;
    self.users = users;

    self.visit = function(url) {
        return self.browser.visit(url);
    };

    /**
     * Uses the user browser window to navigate to the login user
     * page
     */
    self.launchUser = function(driver) {
        return driver.visit('/users')
            .then(function() {
                return driver.waitUntilVisible('#userName');
            })
            .then(function() {
                driver.inSession = true;
            });
    };

    /**
     * Close any opened user windows by navigating away from the session
     * first, to allow the session to be cleanly left.
     */
    self.closeBrowserWindows = function() {
        var promises = [];
        users.forEach(function(user) {
            promises.push(user.visit('/').then(user.close.bind(user)));
        });

        return Promise.all(promises)
            .then(function() {
                while(users.length) { users.pop(); }
            });
    };

    /**
     * Build a webdriver for a user to use
     */
    self.addUser = function() {
        var windowCount = users.length;
        var driver = webdriver.buildDriver(windowCount);
        users.push(driver);
        return driver;
    };

    // Set one browser for use in the tests
    self.browser = users[0] || self.addUser();
};

module.exports = function() {
    this.World = World;
};