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
import { FacetModel } from '../data/facetModel.interface';
import { DistributionSummary } from '../data/distributionSummary.interface';
import { Moment } from 'moment';
import { BoundingBox } from '../data/boundingBox.interface';

export interface DiscoverApi {
  discover(request: DiscoverRequest): Promise<null | DiscoverResponse>;
}

export interface DiscoverResponse {
  filters(): FacetModel<void>;
  results(): FacetModel<DistributionSummary>;
}

export interface DiscoverRequest {

  getQuery(): null | string;
  /**
   * yyyy-MM-ddThh:mm:ssZ
   */
  getStartDate(): null | Moment;
  /**
   * yyyy-MM-ddThh:mm:ssZ
   */
  getEndDate(): null | Moment;
  /**
   * 4 numbers in an array,
   * order: epos:northernmostLatitude , epos:easternmostLongitude, epos:southernmostLatitude, epos:westernmostLongitude
   * (north,east,south,west)
   */
  getBBox(): BoundingBox;
  getKeywordIds(): null | Array<string>;
  getOrganisationIds(): null | Array<string>;
}
