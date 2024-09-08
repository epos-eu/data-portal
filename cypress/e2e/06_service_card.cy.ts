import { GNSS_STATIONS_WITH_PRODUCTS } from '../support/constants';

describe('Service card', () => {
  beforeEach(() => {
    cy.init();
  });

  it('Test service card content', () => {
    cy.searchForService(GNSS_STATIONS_WITH_PRODUCTS);

    // Click on the first domain
    cy.getByDataCy('domain-list')
      .children()
      .first()
      .click();

    // Wait for the results list to be resized
    cy.wait(1000);  // TODO: find a better way to wait for the list to be resized

    // Then the distribution list should be visible
    cy.getByDataCy('distribution-list-table')
      .should('be.visible');

    // Select the fake distribution
    cy.getByDataCy('distribution-list-table')
      .contains(GNSS_STATIONS_WITH_PRODUCTS.name).click();

    // Check that the service card has the correct title
    cy.getByDataCy('results-panel-item-name')
      .should('contain.text', GNSS_STATIONS_WITH_PRODUCTS.name)
      .and('be.visible');

    // Check that service has the right categories
    cy.getByDataCy('results-panel-item-breadcrumb')
      .filter(':visible')
      .should('have.text', ' GNSS Data and Products  >  Products  >  Station Information ')
      .and('be.visible');

    // Check that the service has the right "visible on" options
    cy.getByDataCy('results-panel-item-visible-on')
      .should('have.text', 'Map Table ')
      .and('be.visible');

    // Check that the Table button works
    cy.getByDataCy('results-panel-item-visible-on')
      .contains('Table')
      .click();

    // The table should be visible
    cy.getByDataCy('table-panel')
      .should('be.visible');

    // Click on the Map button
    cy.getByDataCy('results-panel-item-visible-on')
      .contains('Map')
      .click();

    // Check that the map has been zoomed correctly
    // There probably is a better way to do this check
    cy.get('.leaflet-proxy.leaflet-zoom-animated')
      .should('have.attr', 'style', 'transform: translate3d(4167.68px, 2978.77px, 0px) scale(16);');
  });
});
