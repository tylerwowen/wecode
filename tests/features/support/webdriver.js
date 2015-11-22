/**
 * This module is responsible for setting up the web driver.
 *
 * It will perform the following actions
 *   1. set up a webdriver for chrome
 *
 */
process.env.PATH = './node_modules/chromedriver/bin:' + process.env.PATH;

var webdriver    = require('selenium-webdriver');
var chrome       = require('selenium-webdriver/chrome');
var windowWidth  = 1024;
var windowHeight = 768;
var waitTimeout  = 5000;
var baseUrl      = '';

// Hardcoding the baseUrl for now
baseUrl = 'http://localhost:3000';

/**
 * Adds selenium webdriver functionality to be used during features
 * @param driver - driver is a selenium webdriver object
 */
var addDriverFunctionality = function(driver) {
    /**
     * Visit a URL on the server
     */
    driver.visit = function visit(path) {
        this.inSession = false;
        return this.get(baseUrl + path);
    };

    /**
     * Helper that waits for a given element to be visible
     */
    driver.waitUntilVisible = function waitUntilVisible(selector, timeout) {
        timeout = timeout || waitTimeout;

        if(typeof(selector) === 'string') {
            selector = webdriver.By.css(selector);
        }

        return driver.wait(function() {
            return driver
                .findElement(selector)
                .then(function(element) {
                    return element
                        .isDisplayed()
                        .then(function(displayed) {
                            if(displayed) {
                                return element;
                            }
                        });
                })
                .then(null, function() {
                    // keep retrying as the element may exist but not yet be attached to the DOM
                    return undefined;
                });
        }, timeout);
    };

    /**
     * Helper that waits for an element to include some text.
     */
    driver.hasText = function hasText(selector, text, timeout) {
        timeout = timeout || waitTimeout;

        return this.waitUntilVisible(selector)
            .then(function(element) {
                return driver.wait(function() {
                    return element.getText().then(function(t) {
                        return t.indexOf(text) !== -1;
                    });
                }, timeout);
            })
    };

    /**
     * Helper that waits for an element to be visible and then types
     * text into the element.
     */
    driver.enterText = function enterText(selector, text) {
        return this.waitUntilVisible(selector).then(function(element) {
            return element.clear().then(function() {
                return element.sendKeys(text);
            });
        });
    };

    /**
     * Helper that waits for an element to be visible and then clicks
     * on the element
     */
    driver.click = function click(selector) {
        return this
            .waitUntilVisible(selector)
            .then(function(element) {
                element.click();
            });
    };
};

function WebDriver() {
    this.buildDriver = function (windowCount) {
        var options = new chrome.Options();

        // The arguments below will prevent the microphone warning from displaying
        options.addArguments(['--test-type', '--use-fake-ui-for-media-stream']);

        // Build a webdriver
        var driver = new webdriver.Builder()
            .withCapabilities(options.toCapabilities())
            .build();

        addDriverFunctionality(driver);

        // Set the screen size to 1024x768
        var window = driver.manage().window();
        window.setSize(windowWidth, windowHeight);

        var x = windowCount * windowWidth / 2,
            y = windowCount * 100;

        window.setPosition(x, y);

        return driver;
    };
}

var driver = new WebDriver();

module.exports = driver;
