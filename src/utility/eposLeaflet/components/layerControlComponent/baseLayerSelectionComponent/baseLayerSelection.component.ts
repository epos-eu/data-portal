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

/** The `BaseLayerSelectionComponent` class in TypeScript manages the selection of base layers and
communicates with the `LayersService` to update the selected base layer. */
@Unsubscriber('subscriptions')
@Component({
  selector: 'app-base-layer-selection',
  templateUrl: './baseLayerSelection.component.html',
  styleUrls: ['./baseLayerSelection.component.scss']
})
export class BaseLayerSelectionComponent {
  /** The `@Output() selectedLayer = new
  BehaviorSubject<string>(baseLayerOptions[LayersService.INDEX_DEFAULT_BASEMAP].name);` line in the
  `BaseLayerSelectionComponent` class is creating an output property named `selectedLayer` using
  Angular's `@Output` decorator. This property is an instance of `BehaviorSubject<string>` which is
  initialized with the name of the default base layer option from the `baseLayerOptions` array at the
  index specified by `LayersService.INDEX_DEFAULT_BASEMAP`. */
  @Output() selectedLayer = new BehaviorSubject<string>(baseLayerOptions[LayersService.INDEX_DEFAULT_BASEMAP].name);

  /** The line `public basemaps: Array<BaseLayerOption> = baseLayerOptions;` in the
  `BaseLayerSelectionComponent` class is initializing a public property named `basemaps` as an array
  of `BaseLayerOption` objects. It is assigning the value of the `baseLayerOptions` array to this
  property. This allows the component to have access to the base layer options defined in the
  `baseLayerOptions` array and use them for displaying and selecting base layers in the user
  interface. */
  public basemaps: Array<BaseLayerOption> = baseLayerOptions;

  /** The line `public currentSelected = this.basemaps[LayersService.INDEX_DEFAULT_BASEMAP];` in the
  `BaseLayerSelectionComponent` class is initializing a public property named `currentSelected`. It
  is assigning the value of the base layer option at the index specified by
  `LayersService.INDEX_DEFAULT_BASEMAP` in the `basemaps` array to this property. */
  public currentSelected = this.basemaps[LayersService.INDEX_DEFAULT_BASEMAP];

  /** The line `protected subscriptions: Array<Subscription> = new Array<Subscription>();` in the
  `BaseLayerSelectionComponent` class is declaring a protected property named `subscriptions` as an
  array of `Subscription` objects. */
  protected subscriptions: Array<Subscription> = new Array<Subscription>();

  /**
   * This TypeScript constructor initializes a component with a LayersService dependency, subscribes to
   * a baseLayerChangeSourceObs observable, and sets the currentSelected property based on the received
   * BaseLayerOption or from storage.
   * @param {LayersService} layersService - The `layersService` parameter is an instance of the
   * `LayersService` class, which is being injected into the constructor using Angular's dependency
   * injection mechanism. The `LayersService` class likely provides functionality related to managing
   * layers in a mapping application, such as changing base layers and retrieving base layers from
   * storage
   */
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

  /**
   * The setLayer function updates the selected layer and triggers a base layer change event.
   * @param {MatRadioChange} event - The `event` parameter in the `setLayer` function is of type
   * `MatRadioChange`, which is an event emitted when the selected radio button changes in a Material
   * Design radio button group.
   */
  public setLayer(event: MatRadioChange): void {
    this.selectedLayer.next((event.value as BaseLayerOption).name);
    this.layersService.baseLayerChange(event.value as BaseLayerOption);
  }

}
