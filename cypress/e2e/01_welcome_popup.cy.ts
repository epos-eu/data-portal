/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/// <reference path="../support/commands.d.ts" />

describe('Welcome Popup accept', () => {
  it('Shows Welcome Popup', () => {
    cy.policyAccept();
    cy.visit('/');
    cy.get('h1').contains('Welcome to the EPOS Data Portal!');
  });
  it('Accept to continue & show landing page', () => {
    cy.policyAccept();
    cy.visit('/');
    cy.get('.confirm').click();
    cy.get('.domain-item > p > span').contains('All');
  });
});
