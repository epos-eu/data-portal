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
import { SearchCriteria } from './webApi/classes/searchCriteria.enum';
import { Api } from './webApi/classes/api.interface';
import { DictionaryType } from './webApi/classes/dictionaryType.enum';
import { Dictionary } from './webApi/data/dictionary.interface';
import { ItemSummary } from './webApi/data/itemSummary.interface';
import { DistributionSummary } from './webApi/data/distributionSummary.interface';
import { DistributionDetails } from './webApi/data/distributionDetails.interface';
import { ParameterValue } from './webApi/data/parameterValue.interface';
import { DiscoverResponse, DiscoverRequest } from './webApi/classes/discoverApi.interface';
import { DistributionFormat } from './webApi/data/distributionFormat.interface';

export class ApiService implements Api {

  private delegate: null | Api = null;
  private delegateName: null | string = null;

  private constructor(
    private readonly apiMap: Map<string, Api>,
    private readonly selectionEnabled: boolean,
    private readonly selectionVisible: boolean,
  ) {
  }

  public static make(api: Api, apiName: string, selectionEnabled = true, selectionVisible = true): ApiService {
    const map = new Map();
    map.set(apiName, api);
    const as = new ApiService(map as Map<string, Api>, selectionEnabled, selectionVisible);
    as.selectApi(apiName);
    return as;
  }

  public static makeSelectable(
    apis: Map<string, Api>,
    nameOfDefaultApi: string,
    selectionEnabled = true,
    selectionVisible = true,
  ): ApiService {

    // check map
    if (!apis) {
      console.log('Invalid API map');
      throw new Error('Invalid API map');
    }

    // check map has at least one
    if (apis.size === 0) {
      console.log('Zero APIs in map');
      throw new Error('Zero APIs in map');
    }

    // check map contains default
    const temp = apis.get(nameOfDefaultApi);
    if (!temp) {
      console.log('Default API not found: ' + nameOfDefaultApi);
      throw new Error('Default API not found: ' + nameOfDefaultApi);
    }

    const as = new ApiService(apis, selectionEnabled, selectionVisible);
    as.selectApi(nameOfDefaultApi);
    return as;
  }


  // -----------------

  public isSelectionEnabled(): boolean {
    return this.apiMap.size > 1 && this.selectionEnabled;
  }

  public isSelectionVisible(): boolean {
    return this.selectionVisible;
  }

  public selectApi(apiName: string): void {
    const temp = this.apiMap.get(apiName);
    if (!temp) {
      console.log('couldn\'t find an API called: ' + apiName + ' continue to use: ' + this.delegateName);
      return;
    }
    this.delegateName = apiName;
    this.delegate = temp;
  }

  public getSelectedApiName(): string {
    return this.delegateName ?? '';
  }

  public getApiNames(): Array<string> {
    return Array.from(this.apiMap.keys());
  }

  // -----------------

  public discover(request: DiscoverRequest): Promise<null | DiscoverResponse> {
    this.checkApiBeforeCall();
    return this.delegate!.discover(request);
  }

  // -----------------


  public getDictionary(type: DictionaryType): Promise<Dictionary> {
    this.checkApiBeforeCall();
    return this.delegate!.getDictionary(type);
  }

  public doSearch(searchCriteriaMap: Map<SearchCriteria, unknown>): Promise<Array<ItemSummary>> {
    this.checkApiBeforeCall();
    return this.delegate!.doSearch(searchCriteriaMap);
  }

  public getDetails(summary: DistributionSummary): Promise<null | DistributionDetails> {
    this.checkApiBeforeCall();
    return this.delegate!.getDetails(summary);
  }
  public getDetailsById(id: string): Promise<null | DistributionDetails> {
    this.checkApiBeforeCall();
    return this.delegate!.getDetailsById(id);
  }

  // exectution
  public executeAuthenticatedUrl(
    url: string,
  ): Promise<Blob> {
    this.checkApiBeforeCall();
    return this.delegate!.executeAuthenticatedUrl(url);
  }

  public executeUrl(
    url: string,
  ): Promise<Blob> {
    this.checkApiBeforeCall();
    return this.delegate!.executeUrl(url);
  }

  public executeDistributionFormat(
    format: DistributionFormat,
    params: null | Array<ParameterValue>,
    asBlob: boolean,
  ): Promise<Record<string, unknown> | Blob> {
    this.checkApiBeforeCall();
    return this.delegate!.executeDistributionFormat(format, params, asBlob);
  }

  public getExecuteUrl(
    format: DistributionFormat,
    params: null | Array<ParameterValue>,
  ): string {
    this.checkApiBeforeCall();
    return this.delegate!.getExecuteUrl(format, params);
  }

  public getOriginatorUrl(distribution: DistributionSummary, params: null | Array<ParameterValue>): Promise<string> {
    this.checkApiBeforeCall();
    return this.delegate!.getOriginatorUrl(distribution, params);
  }

  private checkApiBeforeCall() {
    if (!this.delegate) {
      console.log('Throw: delegate API not selected');
      throw new Error('delegate API not selected');
    }
  }


}
