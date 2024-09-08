/// <reference types="cypress" />
/// <reference path="../support/commands.d.ts" />

describe('Welcome Popup accept', () => {

  // Open the page, accept the policies and check if the welcome popup is shown
  it('Shows Welcome Popup', () => {
    // Open the page and accept the policies
    cy.visit('/');
    cy.policyAccept();
    // Check if the welcome popup is shown
    cy.get('h1')
      .contains('Welcome to the EPOS Data Portal!');
  });

  // Open the page, accept the policies, close the welcome popup and check if the landing page is shown
  it('Accept to continue & show landing page', () => {
    cy.visit('/');
    cy.policyAccept();
    cy.welcomePopup();
  });
});
