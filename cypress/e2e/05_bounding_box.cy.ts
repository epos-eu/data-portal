import { GNSS_STATIONS_WITH_PRODUCTS } from '../support/constants';

describe('Bounding box filter', () => {
  beforeEach(() => {
    cy.init();
  });

  it('Test bounding box filter', () => {
    // Intercept and mock all the requests for the GNSS_STATIONS_WITH_PRODUCTS service
    cy.interceptService(GNSS_STATIONS_WITH_PRODUCTS);

    // Click on the spatial control button (we need to specify the visibility because there is a bounding box button for each left panel tab (data, facilities))
    cy.getByDataCy('drawing-spatial-control-button').filter(':visible').click();

    // Intercept the request to filter the results by the bounding box
    cy.intercept('GET', /\/resources\/search\?q=&bbox=43\.99281%2C3\.16406%2C30\.03106%2C-3\.86719$/, { fixture: 'bbox_filtered_distributions.json' }).as('search');

    // Draw a bounding box on the map
    cy.getByDataCy('epos-leaflet-map')
      .trigger('mousedown', 'center', { which: 1 })
      .trigger('mousemove', { clientX: 800, clientY: 1000 })
      .trigger('mouseup', { force: true });

    // Wait for the results to be filtered
    cy.wait('@search');

    // There should be a "Spatial" chip in the filters
    cy.getByDataCy('search-panel-filters-mat-chip-list').contains('Spatial');

    // Check that the bounding box is visible on the map (TODO: find a way to use the data-cy attribute for this element)
    cy.get('.leaflet-resourcesspatialbbox-pane > .leaflet-zoom-animated > g').as('bbox');

    // The spatial filter should be set to coordinates
    cy.getByDataCy('spatial-filter-selector').contains('Coordinates');
    cy.getByDataCy('spatial-filter-selector').contains('Geolocation').should('not.exist');

    // Check if a string is a number, if it is empty or if it is NaN, the test will fail
    const beANumber = (val: string) => {
      expect(val).to.not.be.empty;
      expect(Number(val)).to.not.be.NaN;
    };

    // Check if the coordinates are being shown in the filter as numbers
    cy.getByDataCy('spatial-filter-north-input').invoke('val').then(beANumber);
    cy.getByDataCy('spatial-filter-east-input').invoke('val').then(beANumber);
    cy.getByDataCy('spatial-filter-south-input').invoke('val').then(beANumber);
    cy.getByDataCy('spatial-filter-west-input').invoke('val').then(beANumber);

    // Check that the number of filtered results is 46
    cy.getByDataCy('domain-list').children().first().find('[data-cy="domain-item-counter"]').should('have.text', '46');

    // Search for the fake distribution
    cy.searchForService(GNSS_STATIONS_WITH_PRODUCTS);

    // Click on the first domain
    cy.getByDataCy('domain-list').children().first().click();

    // Wait for the results list to be resized
    cy.wait(1000);  // TODO: find a better way to wait for the list to be resized

    // Select the fake distribution
    cy.getByDataCy('distribution-list-table').contains(GNSS_STATIONS_WITH_PRODUCTS.name).click();

    // Wait for requests to finish
    cy.wait(GNSS_STATIONS_WITH_PRODUCTS.bboxFilteredRequest);
    cy.wait(GNSS_STATIONS_WITH_PRODUCTS.detailsRequest);

    // Check that the markers are on the map
    cy.getLeafletPane(GNSS_STATIONS_WITH_PRODUCTS.id).children().should('have.length', 4).and('be.visible');
  });
});
