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
import { Facet } from './facet.interface';

export interface FacetModel<T> {
  /**
   * Get the root facets.
   */
  roots(): Array<Facet<T>>;

  /**
   * Get a specific root.
   * @param identifier
   */
  root(identifier: string): null | Facet<T>;

  /**
   * Get the root facet identifiers.
   */
  rootIdentifiers(): Array<string>;

  /**
   * Flatten the data from all roots facet and their child facets into a flat list.
   */
  getFlatData(): Array<T>;
}
