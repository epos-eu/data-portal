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

/**
 * A (DDSS) distrubution can support multiple formats, those formats are represented by this interface.
 */
export interface DistributionFormat extends Usable {
  /**
   * Display label for the format.
   */
  getLabel(): string;

  /**
   * Identifier for the format.
   */
  getFormat(): string;

  /**
   * Identifier for the original format.
   */
  getOriginalFormat(): string;

  /**
   * The HREF (link) to access this format from a paticular distribition.
   */
  getUrl(): string;

  /**
   * The errr 'type' of the format whether its 'original' or 'converted'.
   */
  getType(): string;
}
