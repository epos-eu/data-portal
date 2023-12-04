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
import { Rest } from 'api/webApi/classes/rest.interface';
import { BaseUrl } from 'api/webApi/classes/baseurl.interface';
import { ItemSummary } from 'api/webApi/data/itemSummary.interface';
import { SearchApi } from 'api/webApi/classes/searchApi.interface';
import { SearchCriteria } from 'api/webApi/classes/searchCriteria.enum';

/**
 * **NOT CURRENTLY IN USE. It was originally created when we had an infrastructure search**
 * Responsible for triggering calls to the webApi module "search" endpoint.
 * - Accepts criteria from caller
 * - Triggers the webApi call via the {@link Rest} class
 * - Processes response data into internal objects
 * - Returns the appropriate response to the caller
 */
export class DevSearchApi implements SearchApi {

  constructor(private readonly baseUrl: BaseUrl, private readonly rest: Rest) { }

  doSearch(searchCriteriaMap: Map<SearchCriteria, unknown>): Promise<Array<ItemSummary>> {
    throw new Error('API 1.3 - Method not implemented.');
  }

}
