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
 * Display element representing a {@link Facet} item.
 */
export abstract class FacetDisplayItem {
    /** Whether it is hidden or not. */
    public isHidden = false;
    /** Reference to the item's parent. */
    private parent: FacetDisplayItem;

    /** Constructor. */
    constructor(
        /** Whether it is a leaf or not. */
        public readonly isLeaf: boolean,
        /** Identifier */
        public readonly id: string,
        /** Display label. */
        public readonly label: string,
        /** How deep in the facet tree it sits. */
        public readonly depth: number,
    ) { }

    /**
     * Sets its hidden status
     */
    public setHidden(hidden: boolean): void {
        this.isHidden = hidden;
    }

    /** Sets its parent object. */
    public setParent(parent: FacetDisplayItem): void {
        this.parent = parent;
    }
    /** Retrieves its parent object. */
    public getParent(): FacetDisplayItem {
        return this.parent;
    }
}
