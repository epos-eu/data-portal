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
import { Organization } from '../data/organization.interface';
import { SearchCriteria } from './searchCriteria.enum';
import { ItemSummary } from 'api/webApi/data/itemSummary.interface';


export interface SearchApi {

  doSearch(searchCriteriaMap: Map<SearchCriteria, unknown>): Promise<Array<ItemSummary>>;

  getOrganizations(type: string): Promise<Array<Organization> | null>;

  getOrganizationById(organizationId: string): Promise<Organization | null>;
}
