/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/// <reference path="../support/commands.d.ts" />

describe('Scenario', () => {
  it('search results populated', () => {
    // cy.intercept('GET', '**/resources/search**', searchResults);
    cy.policyAccept();
    cy.welcomePopup();
    cy.visit('/');

    cy.get('#mat-chip-list-input-0').click();
    cy.get('#mat-chip-list-input-0').type('earthquake', {
      delay: 200
    });
    cy.wait(1000);
    cy.get('#mat-autocomplete-0').children().eq(0).click();
    cy.wait(1000);
    cy.get('.mat-expansion-panel-header-title').eq(0).click();
    cy.get('.mat-select-arrow').eq(0).click();
    cy.get('#mat-option-1 > .mat-option-text').click();

    cy.wait(100);
    cy.get('#selectCountry').click();
    cy.get('.mat-autocomplete-visible').children().eq(77).click();

    cy.openService('#SEI', 'Bibliography for historical earthquakes');
    cy.openService('#NFO', 'Historical earthquakes of interest for the IRPINIA NFO (FDSN-event)');
    // cy.openService('#VO', 'Mt.Etna Earthquake Parameters (2000-2019)');
    cy.openService('#ANT', 'Episode VAL D\'AGRI: water reservoir - dataset');
    cy.openService('#MSL', 'Data from analogue modelling of geological processes');
    cy.openService('#TSU', 'Italian Tsunami Effects Database - Tsunami History WFS (ITED V1)');

    cy.get('#mat-radio-3').click();

  });

});
