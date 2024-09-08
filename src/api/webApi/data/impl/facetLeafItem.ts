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
/**
 * Display element representing a {@link Facet} item that has no children.
 */

import { FacetDisplayItem } from './facetDisplayItem';

export class FacetLeafItem extends FacetDisplayItem {
  /** Calls the inherited {@link FacetDisplayItem} constructor with isLeaf=true. */
  constructor(
    /** How deep in the facet tree it sits. */
    depth: number,
    /** Identifier */
    id: string,
    /** Display label. */
    name: string,
    /** Whether it is selected or not. */
    public isSelected: boolean,
  ) {
    super(true, id, name, depth);
  }

  /**
   * Sets its selected status
   */
  public setSelected(selected: boolean): void {
    this.isSelected = selected;
  }

}
