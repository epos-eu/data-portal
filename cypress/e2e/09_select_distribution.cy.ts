import { GNSS_STATIONS_WITH_PRODUCTS, NFO_Marmara_VP_VS } from '../support/constants';

describe('Test select distribution', () => {
  beforeEach(() => {
    cy.init();
  });

  it('Check marker popup (GeoJson)', () => {
    // Intercept and mock all the requests for the GNSS_STATIONS_WITH_PRODUCTS service
    cy.interceptService(GNSS_STATIONS_WITH_PRODUCTS);

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

    // Search for the fake distribution
    cy.searchForService(GNSS_STATIONS_WITH_PRODUCTS);

    // Select the distribution
    cy.getByDataCy('results-panel-item-name')
      .contains(GNSS_STATIONS_WITH_PRODUCTS.name)
      .click();

    // Wait for the request to finish
    cy.wait(GNSS_STATIONS_WITH_PRODUCTS.dataRequest);

    // The loading spinner should not be visible anymore
    cy.get('.mat-progress-spinner')
      .should('not.exist');

    // Check that the markers are on the map
    cy.getLeafletPane(GNSS_STATIONS_WITH_PRODUCTS.id)
      .children()
      .should('have.length', 10)
      .and('be.visible');

    // Click on the first marker
    cy.getLeafletPane(GNSS_STATIONS_WITH_PRODUCTS.id)
      .children()
      .first()
      .click({ force: true });  // This is probably not the best way to do it

    // The popup should be visible
    cy.getLeafletPane('popup')
      .find('.paginated-features')
      .as('popup')
      .should('be.visible');

    // Check the content of the popup
    cy.get('@popup')
      .find('.popup-title')
      .should('contain', GNSS_STATIONS_WITH_PRODUCTS.name);
    cy.get('@popup')
      .find('.showOnTable')
      .should('contain', ' View on Table');

    // Check the content of the table in the popup
    cy.get('@popup')
      .find('tr')
      .each(($row) => {
        let th = $row.find('th').text();
        let td = $row.find('td').text();
        switch (th) {
          case 'GNSS Station ID':
            expect(td).to.eq('AGDE00FRA');
            break;
          case 'Country':
            expect(td).to.eq('France');
            break;
          case 'City':
            expect(td).to.eq('Cap D\'Agde - Agde');
            break;
          case 'Latitude':
            expect(td).to.eq('43.2964');
            break;
          case 'Longitude':
            expect(td).to.eq('3.4664');
            break;
          case 'Installed at':
            expect(td).to.eq('2006-09-04 12:00:00');
            break;
          case 'Data Providers':
            expect(td).to.eq('Observatoire de Recherche Méditerranéen de l’Environnement');
            break;
          case 'Networks':
            expect(td).to.eq('RENAG');
            break;
          case 'AGDE TS Image':
            expect(td).to.eq('AGDE TS Image');
            break;
        }
      });

    // Check that it is only one slide
    cy.get('@popup')
      .find('.slide-navigation')
      .find('.nav-text')
      .should('contain', '1 of 1');

    // See the marker on the table
    cy.get('@popup')
      .find('.showOnTable')
      .click({ force: true });   // This is probably not the best way to do it

    // The table panel should be open
    cy.getByDataCy('table-panel')
      .as('tablePanel')
      .should('be.visible');

    // The row that contains the marker should be highlighted
    cy.get('@tablePanel')
      .find('tr')
      .filter(':contains("AGDE00FRA")')
      .children()
      .should('have.class', 'expand-row');

    // Close the popup
    cy.get('@popup')
      .find('.leaflet-popup-close-button')
      .click({ force: true });

    // The popup should not be visible
    cy.getLeafletPane('popup')
      .should('not.be.visible');
  });

  it('Check marker popup (CovJson)', () => {
    // Intercept and mock all the requests for the NFO_Marmara_VP_VS service
    cy.interceptService(NFO_Marmara_VP_VS);

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

    // Search for the fake distribution
    cy.searchForService(NFO_Marmara_VP_VS);

    // Select the distribution
    cy.getByDataCy('results-panel-item-name')
      .contains(NFO_Marmara_VP_VS.name)
      .click();

    // Wait for the request to finish
    cy.wait(NFO_Marmara_VP_VS.dataRequest);

    // The loading spinner should not be visible anymore
    cy.get('.mat-progress-spinner')
      .should('not.exist');

    // Check that the markers are on the map
    cy.getLeafletPane(NFO_Marmara_VP_VS.id)
      .children()
      .should('have.length', 1)
      .and('be.visible');

    // Click on the first marker
    cy.getLeafletPane(NFO_Marmara_VP_VS.id)
      .children()
      .first()
      .click({ force: true });  // This is probably not the best way to do it

    // The popup should be visible
    cy.getLeafletPane('popup')
      .find('.paginated-features')
      .as('popup')
      .should('be.visible');

    // Check the content of the popup
    cy.get('@popup')
      .find('.popup-title')
      .should('contain', NFO_Marmara_VP_VS.name);
    cy.get('@popup')
      .find('.showOnGraph')
      .should('contain', ' View on Graph');

    // Check the content of the table in the popup
    cy.get('@popup')
      .find('tr')
      .each(($row) => {
        let th = $row.find('th').text();
        let td = $row.find('td').text();
        switch (th) {
          case 'Latitude':
            expect(td).to.eq('40.4478');
            break;
          case 'Longitude':
            expect(td).to.eq('28.7258');
            break;
        }
      });

    // Check that it is only one slide
    cy.get('@popup')
      .find('.slide-navigation')
      .find('.nav-text')
      .should('contain', '1 of 1');

    // See the marker on the graph
    cy.get('@popup')
      .find('.showOnGraph')
      .click({ force: true });   // This is probably not the best way to do it

    // The graph panel should be opened
    cy.getByDataCy('graph-panel')
      .as('graphPanel')
      .should('be.visible');
  });
});
