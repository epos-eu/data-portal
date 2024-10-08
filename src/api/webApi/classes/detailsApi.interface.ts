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
import { DistributionSummary } from '../data/distributionSummary.interface';
import { DistributionDetails } from '../data/distributionDetails.interface';

/**
 * API for accessing the detail information of an item in the catalogue.
 */
export interface DetailsApi {
  /**
   * Get details.
   */
  getDetails(summary: DistributionSummary, context: string): Promise<null | DistributionDetails>;

  getDetailsById(id: string, context: string): Promise<null | DistributionDetails>;
}
