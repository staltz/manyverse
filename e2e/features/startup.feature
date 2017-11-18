Feature: App opens properly

  Scenario: As a user I first see the Central screen with tabs
    Then I press "Private Tab Button"
    Then I see the text "Private"
    Then I press "Notifications Tab Button"
    Then I see the text "Notifications"
    Then I press "Sync Tab Button"
    Then I see the text "Peers around you"
