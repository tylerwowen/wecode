module.exports = function() {
    this.Given(/^I navigate to the login page$/, function () {
        return this.launchUser(this.browser);
    });

    this.Then(/^I type in the user name$/, function () {
        return this.browser.enterText('#userName', 'test');
    });

    this.Then(/^I type in the password$/, function() {
        return this.browser.enterText('#password', '123');
    });

    this.Then(/^I click on login$/, function() {
        return this.browser.click('#login')
    });

    this.Then(/^I should see that I am logged in$/, function() {
        return this.browser.hasText('#status', 'You are logged in.', 150000);
    });
};