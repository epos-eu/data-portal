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

/**
 * Display element representing a {@link Facet} item that has children.
 */
export class FacetParentItem extends FacetDisplayItem {
    /** Collapsed status. */
    public isCollapsed = false;
    /** Count of descendant leaves. */
    public leafCount = 0;
    /** References to children. */
    public readonly children = new Array<FacetDisplayItem>();
    /** Calls the inherited {@link FacetDisplayItem} constructor with isLeaf=false. */
    constructor(
        /** How deep in the facet tree it sits. */
        depth: number,
        /** Identifier */
        id: string,
        /** Display label. */
        name: string,
    ) {
        super(false, id, name, depth);
    }

    /**
     * Sets its collapsed status.
     * Also:
     *  - collapses any descendant {@link FacetParentItem}s
     *  - hides and descendant {@link FacetLeafItem}s
     */
    public setCollapsed(collapsed: boolean): void {
        this.isCollapsed = collapsed;
        this.children.forEach((child: FacetDisplayItem) => {
            child.setHidden(collapsed);
            if (child instanceof FacetParentItem) {
                child.setCollapsed(collapsed);
            }
        });
    }

    /**
     * Adds a child to this item, setting itself as its parent at the same time.
     * {@link #leafCount} is incremented if child is a leaf.
     * @param child The child item to add.
     */
    public addChild(child: FacetDisplayItem): void {
        this.children.push(child);
        child.setParent(this);
        this.leafCount += (child instanceof FacetParentItem) ? child.leafCount : 1;
    }
}
