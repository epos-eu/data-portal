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
import { Usable } from './usable';
import { DistributionFormat } from './distributionFormat.interface';
import { DistributionIdentifiable } from './distributionIdentifiable.interface';

/**
 * A (DDSS) distrubution, with default format return when default URL queried.
 */
export interface DistributionSummary extends DistributionIdentifiable, Usable {
  getFormats(): Array<DistributionFormat>;
  getMappableFormats(): Array<DistributionFormat>;
  getGraphableFormats(): Array<DistributionFormat>;
  getDownloadableFormats(): Array<DistributionFormat>;
  getTabularableFormats(): Array<DistributionFormat>;
  getStatus(): number;
  getStatusTimestamp(): string;
}
