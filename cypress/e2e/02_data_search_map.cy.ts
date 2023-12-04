/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/// <reference path="../support/commands.d.ts" />
import { FeatureCollectionGenerator } from '../fixtures/featureCollectionGenerator';
import { SearchResultsGenerator } from '../fixtures/searchResultsGenerator';

const searchResultDomains = 10;
const searchResultSubDomainsPerDomain = 5;
const searchResultDistributionPerSubDomain = 5;
const searchResultFilterChildCount = 50;

const geoJsonFeatureCount = 1000;

const searchResults = new SearchResultsGenerator(
  searchResultDomains,
  searchResultFilterChildCount,
  searchResultSubDomainsPerDomain,
  searchResultDistributionPerSubDomain).create();
const testFeatureCollection = new FeatureCollectionGenerator().create(geoJsonFeatureCount);

describe('Shows results All', () => {
  it('search results populated', () => {
    // cy.intercept('GET', '**/resources/search**', searchResults);
    cy.policyAccept();
    cy.welcomePopup();
    cy.visit('/');

    cy.wait(1500);
    cy.get('.domain-box').first().click();
    cy.get('.results-container').find('table[id=distributionListTable]');
    // cy.get('.search-results-count').invoke('text').then(parseFloat)
    //   .should('equal', searchResultDomains * searchResultSubDomainsPerDomain * searchResultDistributionPerSubDomain);
  });


  it.skip(`selects first result and displays map ${geoJsonFeatureCount} markers within 1000 milliseconds`, () => {
    cy.intercept('GET', '**/resources/search**', searchResults);
    cy.intercept('GET', '**/resources/details**', { fixture: 'distribution_details' });
    // "exampleGeoJsonUrl" is the href property specified in the
    // mock distribution details geojson format
    cy.intercept('GET', '**exampleGeoJsonUrl**', testFeatureCollection);
    cy.policyAccept();
    cy.visit('/');
    cy.get('.search-results .parent-row').first().click();
    cy.get('.search-results .leaf-row').first().click();
    // if this fails (and it's not the timeout) check that
    // the mock distribution details id is the same as the first
    // distribution id from the results, which we're selecting above.
    cy.get('app-data-visualization-map .leaflet-marker-pane>*', { timeout: 1000 }).should('have.length', geoJsonFeatureCount);
  });
});
