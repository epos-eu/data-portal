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
import { DetailsApi } from '../../classes/detailsApi.interface';
import { SearchCriteria } from '../../classes/searchCriteria.enum';
import { DictionaryType } from '../../classes/dictionaryType.enum';
import { DictionaryApi } from '../../classes/dictionaryApi.interface';
import { Api } from '../../classes/api.interface';
import { SearchApi } from '../../classes/searchApi.interface';
import { ItemSummary } from '../../data/itemSummary.interface';
import { Dictionary } from '../../data/dictionary.interface';
import { ExecutionApi } from '../../classes/executionApi.interface';
import { DiscoverApi, DiscoverResponse, DiscoverRequest } from '../../classes/discoverApi.interface';
import { DistributionSummary } from 'api/webApi/data/distributionSummary.interface';
import { DistributionDetails } from '../../data/distributionDetails.interface';
import { ParameterValue } from '../../data/parameterValue.interface';
import { AaaiApi } from 'api/webApi/classes/aaaiApi.interface';
import { DistributionFormat } from 'api/webApi/data/distributionFormat.interface';
import { Organization } from 'api/webApi/data/organization.interface';
import { Domain } from 'api/webApi/data/domain.interface';
import { ShareApi } from 'api/webApi/classes/shareApi.interface';

export class DevCompositeApi implements Api {

  constructor(
    private readonly discoverApi: DiscoverApi,
    private readonly aaaiApi: AaaiApi,
    private readonly dictionaryApi: DictionaryApi,
    private readonly searchApi: SearchApi,
    private readonly detailsApi: DetailsApi,
    private readonly executionApi: ExecutionApi,
    private readonly shareApi: ShareApi,
  ) { }

  // ---------------------------

  discover(request: DiscoverRequest): Promise<null | DiscoverResponse> {
    return this.discoverApi.discover(request);
  }

  getFilters(context: string): Promise<null | DiscoverResponse> {
    return this.discoverApi.getFilters(context);
  }

  getDomains(context: string): Promise<null | Array<Domain>> {
    return this.discoverApi.getDomains(context);
  }

  // ---------------------------

  getDetails(summary: DistributionSummary, context: string): Promise<null | DistributionDetails> {
    return this.detailsApi.getDetails(summary, context);
  }

  getDetailsById(id: string, context: string): Promise<null | DistributionDetails> {
    return this.detailsApi.getDetailsById(id, context);
  }

  // ---------------------------

  doSearch(searchCriteriaMap: Map<SearchCriteria, unknown>): Promise<Array<ItemSummary>> {
    return this.searchApi.doSearch(searchCriteriaMap);
  }

  // ---------------------------

  getDictionary(type: DictionaryType): Promise<Dictionary> {
    return this.dictionaryApi.getDictionary(type);
  }

  getOrganizations(type: string): Promise<Organization[] | null> {
    return this.searchApi.getOrganizations(type);
  }

  getOrganizationById(organizationId: string): Promise<Organization | null> {
    return this.searchApi.getOrganizationById(organizationId);
  }

  // ---------------------------

  // Configuration

  executeAuthenticatedUrl(
    url: string,
  ): Promise<Blob> {
    return this.executionApi.executeAuthenticatedUrl(url);
  }

  executeUrl(
    url: string,
  ): Promise<Blob> {
    return this.executionApi.executeUrl(url);
  }

  executeDistributionFormat(
    format: DistributionFormat,
    params: null | Array<ParameterValue>,
    asBlob: boolean,
  ): Promise<Record<string, unknown> | Blob> {
    return this.executionApi.executeDistributionFormat(format, params, asBlob);
  }

  getExecuteUrl(
    format: DistributionFormat,
    params: null | Array<ParameterValue>,
  ): string {
    return this.executionApi.getExecuteUrl(format, params);
  }


  /**
   * Not for execution, just for reference to the originator (TCS)
   */
  getOriginatorUrl(
    distribution: DistributionSummary,
    params: Array<ParameterValue>
  ): Promise<string> {
    return this.executionApi.getOriginatorUrl(distribution, params);
  }


  /**
   * The function `saveConfigurables` saves a string value using the `shareApi` and returns a Promise
   * with the saved value.
   * @param {string} value - The `value` parameter in the `saveConfigurables` function is a string that
   * represents the configuration data that needs to be saved.
   * @returns The `saveConfigurables` function returns a Promise that resolves to a string value.
   */
  saveConfigurables(value: string): Promise<string> {
    return this.shareApi.saveConfigurables(value);
  }

  /**
   * The function `retrieveConfigurables` retrieves configurable settings based on a given key
   * asynchronously.
   * @param {string} key - The `key` parameter is a string that is used to retrieve configurable
   * settings from the `shareApi`.
   * @returns The `retrieveConfigurables` function is returning a Promise that resolves to a string or
   * null value.
   */
  retrieveConfigurables(key: string): Promise<string | null> {
    return this.shareApi.retrieveConfigurables(key);
  }

}
