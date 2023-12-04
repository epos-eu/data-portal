/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/member-ordering */
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
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { DistributionLevel } from 'api/webApi/data/distributionLevel.interface';
import { DistributionSummary } from 'api/webApi/data/distributionSummary.interface';
import { Facet } from 'api/webApi/data/facet.interface';
import { FacetModel } from 'api/webApi/data/facetModel.interface';
import { Subscription } from 'rxjs';
import { ResultsPanelService } from 'pages/dataPortal/services/resultsPanel.service';
import { DomainInfo } from '../../links';
import { FacetSelectionPersistorService } from './facetSelectionPersistor.service';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';

@Unsubscriber('subscriptions')
@Component({
  selector: 'app-facet-dropdown',
  templateUrl: './facetDropdown.component.html',
  styleUrls: ['./facetDropdown.component.scss']
})
export class FacetDropdownComponent {

  private rawFacetModel: FacetModel<DistributionSummary>;
  public activeDomain: DomainInfo;
  @Input()
  set rawTreeData(distFacetModelSource: FacetModel<DistributionSummary> | null) {
    if (null != distFacetModelSource) {
      this.rawFacetModel = distFacetModelSource;
    }
    if (null != this.activeDomain) {
      this.checklistSelection.clear();
      this.createNestedTreeObjectArray(this.rawFacetModel);
    }
  }

  @Input()
  set activeDomainData(active: DomainInfo | null) {
    if (null != active) {
      this.activeDomain = active;
    }
    if (null != this.rawFacetModel) {
      this.createNestedTreeObjectArray(this.rawFacetModel);
    }
  }

  @Input() public facetExpansionHidden: boolean;
  @Output() setSelectedFacets = new EventEmitter<Array<FacetFlatNode>>();

  public hasChild = (_: number, node: FacetFlatNode): boolean => node.expandable;

  private getLevel = (node: FacetFlatNode): number => node.level;

  private isExpandable = (node: FacetFlatNode): boolean => node.expandable;

  private getChildren = (node: DistributionLevel): DistributionLevel[] => node.children!;

  public checklistSelection = new SelectionModel<FacetFlatNode>(true);

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  private flatNodeMap = new Map<FacetFlatNode, DistributionLevel>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  private nestedNodeMap = new Map<DistributionLevel, FacetFlatNode>();

  private transformer = (node: DistributionLevel): FacetFlatNode => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode: FacetFlatNode =
      existingNode && existingNode.name === node.value ? existingNode : new FacetFlatNode();
    flatNode.name = node.value;
    flatNode.level = node.level!;
    flatNode.expandable = !!node.children?.length;
    flatNode.count = node.count!;
    flatNode.distId = node.distId!;
    flatNode.parentName = node.parentName!;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  public treeControl: FlatTreeControl<FacetFlatNode>;

  private treeFlattener: MatTreeFlattener<DistributionLevel, FacetFlatNode>;

  public dataSource: MatTreeFlatDataSource<DistributionLevel, FacetFlatNode>;

  private subscriptions: Array<Subscription> = [];

  constructor(
    private readonly resultPanelService: ResultsPanelService,
    private readonly facetSelectionPersistor: FacetSelectionPersistorService,
  ) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren,
    );
    this.treeControl = new FlatTreeControl<FacetFlatNode>(this.getLevel, this.isExpandable);
    this.subscriptions.push(
      this.checklistSelection.changed.subscribe(() => {
        this.storeDomainSpecificFacetSelection(this.activeDomain);
        this.setSelectedFacets.emit(this.checklistSelection.selected);
      }),
      this.resultPanelService.clearFacetSelectionObs.subscribe(() => {
        this.checklistSelection.clear();
      }),
      this.resultPanelService.triggerFacetSelectionObs.subscribe((facet: string) => {
        const facetFlatNodeArr = this.treeControl.dataNodes;
        const selectedfacetFlatNode = facetFlatNodeArr.find((node: FacetFlatNode) => node.name === facet);
        if (null != selectedfacetFlatNode) {
          this.facetItemSelectionSelect(selectedfacetFlatNode);
        }
      }),
    );
  }

  /* Filters Data for correct domain then creates tree object array to display */
  private createNestedTreeObjectArray(distFacetModelSource: FacetModel<DistributionSummary> | null): void {
    const treeData = new Array<DistributionLevel>();
    if (distFacetModelSource != null) {
      distFacetModelSource.roots().forEach((root: Facet<DistributionSummary>) => {
        root.getChildren().filter((rootDomain) => rootDomain.getName() === this.activeDomain.title).forEach((rootChild) => {
          const distributionLevel = this.recursiveNestedTreeObjectArray(rootChild, 0);
          treeData.push(distributionLevel);
        });
      });
    }
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = treeData;
    this.retrieveDomainSpecificFacetSelection();
  }


  private recursiveNestedTreeObjectArray(facet: Facet<DistributionSummary>, levelNum: number): DistributionLevel {

    const newlevel: DistributionLevel = {
      id: levelNum,
      value: facet.getName(),
      level: levelNum,
      count: facet.getFlatData().length,
      children: [],
      distId: facet.getIdentifier(),
      parentName: facet.getName(),
    };

    levelNum++;

    let count = 0;
    facet.getChildren().forEach((levelItem: Facet<DistributionSummary>) => {

      count += levelItem.getFlatData().length;
      const child = this.recursiveNestedTreeObjectArray(levelItem, levelNum);
      if (child !== null && newlevel.children !== undefined) {
        newlevel.children.push(child);
      }

    });

    if (count < facet.getFlatData().length && newlevel.children!.length > 0) {
      const levelNo: DistributionLevel = {
        id: levelNum,
        value: '',
        level: levelNum,
        count: facet.getFlatData().length - count,
        children: [],
        distId: facet.getIdentifier(),
        parentName: facet.getName(),
      };
      if (newlevel.children !== undefined) {
        newlevel.children.unshift(levelNo);
      }
    }
    return newlevel;
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  private checkAllParentsSelection(node: FacetFlatNode): void {
    let parent: FacetFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Stores facets to retrieve when respective domain is selected again.
   * Needs timeout to allow for output to emit changes and facet selection to clear when changing domain.
   */
  private storeDomainSpecificFacetSelection(domain: DomainInfo): void {
    setTimeout(() => {
      if (this.activeDomain === domain) {
        this.facetSelectionPersistor.setFacets(domain.title, this.checklistSelection.selected);
      }
    });
  }

  /** Retrives facets accosociated to active domain out of storage and applies them */
  private retrieveDomainSpecificFacetSelection(): void {
    const persistedNodes = this.facetSelectionPersistor.getFacets(this.activeDomain.title);
    if (null != persistedNodes) {
      const facetFlatNodeArr = this.treeControl.dataNodes;
      const selectedfacetFlatNode = facetFlatNodeArr.filter(({ name: initialNode }) =>
        persistedNodes.some(({ name: persistedNode }) => persistedNode === initialNode));
      if (null != selectedfacetFlatNode) {
        this.checklistSelection.select(...selectedfacetFlatNode);
        if (selectedfacetFlatNode.length === 0) {
          this.setSelectedFacets.emit(this.checklistSelection.selected);
        }
      }
    }
  }

  /** Check root node checked state and change it accordingly */
  private checkRootNodeSelection(node: FacetFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every(child => {
        return this.checklistSelection.isSelected(child);
      });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  private getParentNode(node: FacetFlatNode): FacetFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }


  /** Toggle the facet item selection. Select/deselect all the descendants node */
  public facetItemSelectionToggle(node: FacetFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Select the facet item selection. Select/deselect all the descendants node */
  public facetItemSelectionSelect(node: FacetFlatNode): void {
    this.checklistSelection.select(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf facet item selection. Check all the parents to see if they changed */
  public facetLeafItemSelectionToggle(node: FacetFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /** Whether all the descendants of the node are selected. */
  public descendantsAllSelected(node: FacetFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every(child => {
        return this.checklistSelection.isSelected(child);
      }) &&
      node.count === descendants.reduce((sum, child) =>
        sum + child.count, 0
      );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  public descendantsPartiallySelected(node: FacetFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

}
export class FacetFlatNode {
  name: string;
  level: number;
  expandable = false;
  count: number;
  distId: string;
  parentName: string;
}
