Feature: Test
  Scenario: Searching Google
    Given I navigate to the login page
    Then I type in the user name
    Then I type in the password
    Then I click on login
    Then I should see that I am logged in