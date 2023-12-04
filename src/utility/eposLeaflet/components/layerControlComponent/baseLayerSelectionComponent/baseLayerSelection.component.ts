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

import { Component, Output } from '@angular/core';
import { baseLayerOptions } from '../../controls/baseLayerControl/baseLayerOptions';
import { LayersService } from 'utility/eposLeaflet/services/layers.service';
import { MatRadioChange } from '@angular/material/radio';
import { BaseLayerOption } from '../../controls/public_api';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';

@Unsubscriber('subscriptions')
@Component({
  selector: 'app-base-layer-selection',
  templateUrl: './baseLayerSelection.component.html',
  styleUrls: ['./baseLayerSelection.component.scss']
})
export class BaseLayerSelectionComponent {
  @Output() selectedLayer = new BehaviorSubject<string>(baseLayerOptions[LayersService.INDEX_DEFAULT_BASEMAP].name);

  public basemaps: Array<BaseLayerOption> = baseLayerOptions;
  public currentSelected = this.basemaps[LayersService.INDEX_DEFAULT_BASEMAP];

  protected subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(private layersService: LayersService) {
    this.subscriptions.push(
      this.layersService.baseLayerChangeSourceObs.subscribe((basemap: BaseLayerOption) => {
        if (null != basemap) {
          this.currentSelected = basemap;
        }
      })
    );

    this.currentSelected = this.layersService.getBaseLayerFromStorage();
  }

  public setLayer(event: MatRadioChange): void {
    this.selectedLayer.next((event.value as BaseLayerOption).name);
    this.layersService.baseLayerChange(event.value as BaseLayerOption);
  }

}
