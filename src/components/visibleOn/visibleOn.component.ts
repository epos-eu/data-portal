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
import { Component, Input } from '@angular/core';
import { BoundingBox } from 'api/webApi/data/boundingBox.interface';
import { SimpleBoundingBox } from 'api/webApi/data/impl/simpleBoundingBox';
import { SpatialRange } from 'api/webApi/data/spatialRange.interface';
import { ViewType } from 'api/webApi/data/viewType.enum';
import { MapInteractionService } from 'utility/eposLeaflet/services/mapInteraction.service';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { Subject } from 'rxjs';
import { DataConfigurableDataSearch } from 'utility/configurablesDataSearch/dataConfigurableDataSearch';
import { DistributionItem } from 'api/webApi/data/distributionItem.interface';
import { DataSearchConfigurablesService } from 'pages/dataPortal/services/dataSearchConfigurables.service';

@Component({
  selector: 'app-visible-on',
  templateUrl: './visibleOn.component.html',
  styleUrls: ['./visibleOn.component.scss'],
  animations: [
  ],
})
export class VisibleOnComponent {

  @Input() item: DistributionItem;
  @Input() configurables: DataSearchConfigurablesService;

  public readonly VIEW_TYPE_ENUM = ViewType;
  public centerMapBBox = new Subject<BoundingBox>();

  constructor(
    protected readonly panelsEvent: PanelsEmitterService,
    protected readonly mapInteractionService: MapInteractionService,
  ) {
  }

  /**
   * If the selected item is not the same as the item passed in, then select the item and emit the
   * tablePanelToggle event
   * @param {DistributionItem} item - The item that was clicked.
   */
  public tablePanelToggle(item: DistributionItem): void {
    let newSelected = false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (this.configurables.getSelected()?.id !== item.id) {
      void this.selectItem(item).then(res => {
        newSelected = true;
        this.panelsEvent.tablePanelToggle(item.id, newSelected);
      });
    } else {
      this.panelsEvent.tablePanelToggle(item.id, newSelected);
    }
  }

  /**
   * *This function is used to toggle the right bottom sidenav.*
   * @param {DistributionItem} item - The item that was clicked.
   */
  public graphPanelToggle(item: DistributionItem): void {
    let newSelected = false;
    if (this.configurables.getSelected()?.id !== item.id) {
      void this.selectItem(item).then(res => {
        newSelected = true;
        this.panelsEvent.graphPanelToggle(item.id, newSelected);
      });
    } else {
      this.panelsEvent.graphPanelToggle(item.id, newSelected);
    }
  }

  /**
   * *Center the map on the bounding box of the selected item.*
   *
   * It calls the `selectItem` function to select the item, and then it
   * calls the `centerMapOnBoundingBox` function to center the map on the bounding box of the selected
   * item
   * @param {DistributionItem} item - DistributionItem
   */
  public centerOnMap(item: DistributionItem): void {

    // select item
    void this.selectItem(item);

    setTimeout(() => {
      const selected = this.configurables.getSelected();
      if (selected instanceof DataConfigurableDataSearch) {
        const spatialRange: SpatialRange | undefined = selected?.getDistributionDetails().getSpatialRange();

        if (spatialRange !== undefined) {
          const spatialFeatures = spatialRange.getFeatures();
          spatialFeatures.forEach(feature => {
            this.mapInteractionService.centerMapOnBoundingBox(SimpleBoundingBox.makeBBox(feature));
          });
        }
      }
    }, 1000);
  }

  private selectItem(item: DistributionItem): Promise<void> {
    return Promise.resolve((() => {
      return this.panelsEvent.selectItem(item.id);
    })());
  }

}

