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
import { DataSearchConfigurablesService } from 'pages/dataPortal/services/dataSearchConfigurables.service';
import { MapInteractionService } from 'utility/eposLeaflet/services/mapInteraction.service';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { Subject } from 'rxjs';
import { BasicItem } from '../resultsPanel.component';
import { DataConfigurableDataSearch } from 'utility/configurablesDataSearch/dataConfigurableDataSearch';

@Component({
  selector: 'app-visible-on',
  templateUrl: './visibleOn.component.html',
  styleUrls: ['./visibleOn.component.scss'],
  animations: [
  ],
})
export class VisibleOnComponent {

  @Input() item: BasicItem;

  public readonly VIEW_TYPE_ENUM = ViewType;
  public centerMapBBox = new Subject<BoundingBox>();

  constructor(
    private readonly panelsEvent: PanelsEmitterService,
    private readonly configurables: DataSearchConfigurablesService,
    private readonly mapInteractionService: MapInteractionService,
  ) {
  }

  /**
   * If the selected item is not the same as the item passed in, then select the item and emit the
   * tablePanelToggle event
   * @param {BasicItem} item - The item that was clicked.
   */
  public tablePanelToggle(item: BasicItem): void {
    let newSelected = false;
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
   * @param {BasicItem} item - The item that was clicked.
   */
  public graphPanelToggle(item: BasicItem): void {
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
   * @param {BasicItem} item - BasicItem
   */
  public centerOnMap(item: BasicItem): void {

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

  private selectItem(item: BasicItem): Promise<void> {
    return Promise.resolve((() => {
      return this.panelsEvent.selectItem(item.id);
    })());
  }

}

