/*
         Copyright 2021 EPOS ERIC

 Licensed under the Apache License, Version 2.0 (the License); you may not
 use this file except in compliance with the License.  You may obtain a copy
 of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an AS IS BASIS, WITHOUT
 WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 License for the specific language governing permissions and limitations under
 the License.
 */
import { FacetModel } from '../../data/facetModel.interface';
import { ObjectAccessUtility } from '../../utility/objectAccessUtility';
import { DistributionSummary } from '../../data/distributionSummary.interface';
import { Rest } from 'api/webApi/classes/rest.interface';
import { BaseUrl } from 'api/webApi/classes/baseurl.interface';
import { DiscoverApi, DiscoverResponse, DiscoverRequest } from 'api/webApi/classes/discoverApi.interface';
import { UrlBuilder } from 'api/webApi/classes/urlBuilder.interface';
import { Facet } from 'api/webApi/data/facet.interface';
import { SimpleFacet } from 'api/webApi/data/impl/simpleFacet';
import { SimpleFacetModel } from 'api/webApi/data/impl/simpleFacetModel';
import { JSONDistributionFactory } from 'api/webApi/data/impl/jsonDistributionFactory';
import { Optional } from 'api/webApi/utility/optional';

/**
 * Responsible for triggering calls to the webApi module "discover" endpoint.
 * - Accepts criteria from caller
 * - Triggers the webApi call via the {@link Rest} class
 * - Processes response data into internal objects
 * - Returns the appropriate response to the caller
 */
export class DevDiscoverApi implements DiscoverApi {

  constructor(
    private readonly baseUrl: BaseUrl,
    private readonly rest: Rest,
  ) { }

  discover(request: DiscoverRequest): Promise<null | DiscoverResponse> {
    const bulider: UrlBuilder = this.baseUrl.urlBuilder();
    bulider.addPathElements('search');

    // QUERY
    const query = request.getQuery();
    if (query != null) {
      bulider.addParameter('q', query);
    }

    const momentFormat = 'YYYY-MM-DDThh:mm:ssZ';

    // START
    const start = request.getStartDate();
    if (start != null) {
      bulider.addParameter('startDate', start.format(momentFormat));
    }

    // END
    const end = request.getEndDate();
    if (end != null) {
      bulider.addParameter('endDate', end.format(momentFormat));
    }

    // BBOX
    const bbox = request.getBBox();
    if (bbox.isBounded()) {
      // order: epos:northernmostLatitude , epos:easternmostLongitude, epos:southernmostLatitude, epos:westernmostLongitude
      // (north,east,south,west)
      // const value: string = '' + bbox[0] + ',' + bbox[1] + ',' + bbox[2] + ',' + bbox[3] + '';
      const value: string = bbox.asArray().join(',');
      bulider.addParameter('bbox', value);
    }

    // keywords
    const keywords = request.getKeywordIds();
    if (keywords != null && keywords.length > 0) {
      const value: string = keywords.join(',');
      bulider.addParameter('keywords', value);
    }

    // organisations
    const organisations = request.getOrganisationIds();
    if (organisations != null && organisations.length > 0) {
      const value: string = organisations.join(',');
      bulider.addParameter('organisations', value);
    }


    // the search URL
    const url = bulider.build();

    return this.fetchAndParse(url);
  }

  private fetchAndParse(url: string): Promise<null | DiscoverResponse> {

    return this.rest.get(url)
      .then((json: Record<string, unknown>) => {

        const response = this.parseJSON(json);

        return response.orNull();
      });
  }

  private parseJSON(json: Record<string, unknown>): Optional<null | DiscoverResponse> {

    if (json == null) {
      return Optional.empty();
    }

    // FILTERS
    const idToFilterFacets: Map<string, Facet<void>> = new Map();
    const filterArrayJSONArray = ObjectAccessUtility.getObjectArray<Record<string, unknown>>(json, 'filters', true);
    if (filterArrayJSONArray != null) {
      filterArrayJSONArray.forEach(filterRoot => {
        if (filterRoot != null) {
          this.recurseThroughFiltersJSON(null, filterRoot).ifPresent((root: Facet<void>) => {
            idToFilterFacets.set(root.getIdentifier(), root);
          });
        }
      });
    }

    // filters as facets
    const filters: FacetModel<void> = new SimpleFacetModel<void>(idToFilterFacets);

    // ----------------------------------------------------------------------------------

    // RESULTS
    const idToDistributionFacets: Map<string, Facet<DistributionSummary>> = new Map();
    const resultsRoot = ObjectAccessUtility.getObjectValue<Record<string, unknown>>(json, 'results', true);
    if (resultsRoot != null) {
      this.recurseThroughResultsJSON(null, resultsRoot).ifPresent((root: Facet<DistributionSummary>) => {
        idToDistributionFacets.set(root.getIdentifier(), root);

      });
    }

    // results as facets
    const results: FacetModel<DistributionSummary> = new SimpleFacetModel<DistributionSummary>(idToDistributionFacets);

    // ----------------------------------------------------------------------------------

    // Anon DiscoverResponse
    const response: DiscoverResponse = {
      filters: (): FacetModel<void> => filters,
      results: (): FacetModel<DistributionSummary> => results
    };


    return Optional.ofNullable(response);
  }

  /**
   *  Recurse through the filters
   * @param parent
   * @param filter
   */
  private recurseThroughFiltersJSON(parent: null | Facet<void>, filterJSON: Record<string, unknown>): Optional<null | Facet<void>> {
    const facetName = ObjectAccessUtility.getObjectValueString(filterJSON, 'name', false);
    const facetID = ObjectAccessUtility.getObjectValueString(filterJSON, 'id', false, facetName);


    // If there is no facet name or id - abort
    if (facetName == null || facetID == null) {
      return Optional.empty();
    } else {

      // ... continue to create facet and children

      const facet: Facet<void> = SimpleFacet.make(parent, facetID, facetName);

      if (parent != null) {
        parent.addChild(facet);
      }

      // If there are child filters
      const childrenJSONArray = ObjectAccessUtility.getObjectArray<Record<string, unknown>>(filterJSON, 'children', false);
      if (childrenJSONArray != null) {
        childrenJSONArray.forEach(childJSON => {
          if (childJSON != null) {
            this.recurseThroughFiltersJSON(facet, childJSON);
          }
        });
      }


      return Optional.ofNonNullable(facet);
    }
  }

  private appendToByName(resultJSON, distributionsAppendTo: Array<DistributionSummary>, name: string): void {

    const distributionsJSONArray = ObjectAccessUtility.getObjectArray<Record<string, unknown>>(resultJSON as Record<string, unknown>, name, false);

    // If there is a distributions array iterate over it
    if (distributionsJSONArray != null) {
      distributionsJSONArray.forEach(distJSON => {
        if (distJSON != null) {
          const distSummary = JSONDistributionFactory.jsonToDistributionSummary(distJSON);
          if (distSummary != null) {
            distSummary.ifPresent((dist: DistributionSummary) => distributionsAppendTo.push(dist));
          }
        }
      });
    }
  }

  private recurseThroughResultsJSON(
    parent: null | Facet<DistributionSummary>,
    resultJSON: Record<string, unknown>,
  ): Optional<null | Facet<DistributionSummary>> {

    const facetName = ObjectAccessUtility.getObjectValueString(resultJSON, 'name', false);

    // if there is no id - use name as id
    const facetID = ObjectAccessUtility.getObjectValueString(resultJSON, 'id', false, facetName);

    const distributionsAppendTo: Array<DistributionSummary> = [];

    // DISTRIBUTIONS
    this.appendToByName(resultJSON, distributionsAppendTo, 'distributions');

    // FACILITIES
    this.appendToByName(resultJSON, distributionsAppendTo, 'facilities');

    // If there is no facet name or id - abort
    if (facetName == null || facetID == null) {
      return Optional.empty();
    } else {

      // ... continue to create facet and children

      // Create the facet - on success
      const facet: Facet<DistributionSummary> = SimpleFacet.make(parent, facetID, facetName, distributionsAppendTo);

      // Add facet to parent if there is a parent (roots have null parent)
      if (parent != null) {
        parent.addChild(facet);
      }

      // If there are child facets - recurse into them
      const childrenJSONArray = ObjectAccessUtility.getObjectArray<Record<string, unknown>>(resultJSON, 'children', false);
      if (childrenJSONArray != null) {
        childrenJSONArray.forEach(childJSON => {
          if (childJSON != null) {
            this.recurseThroughResultsJSON(facet, childJSON);
          }
        });
      }

      return Optional.ofNonNullable(facet);
    }
  }
}

