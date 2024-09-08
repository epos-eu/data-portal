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

import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { Legend } from '../../controls/public_api';
import { MapLayer } from '../../layers/mapLayer.abstract';

/** The `LayerTabsControlComponent` class in TypeScript checks if a `MapLayer` has legend data to
determine if a legend tab should be displayed. */
@Component({
  selector: 'app-layer-tabs-control',
  templateUrl: './layerTabsControl.component.html',
  styleUrls: ['./layerTabsControl.component.scss']
})
export class LayerTabsControlComponent implements OnInit {

  /** The `@Input() layer: MapLayer;` line in the TypeScript code snippet is creating an input property
  named `layer` of type `MapLayer` in the `LayerTabsControlComponent` class. This input property
  allows external components to pass a `MapLayer` object into the `LayerTabsControlComponent`
  component. */
  @Input() layer: MapLayer;

  /** The line `public hasLegendTab = true;` in the TypeScript code snippet is declaring a public property
  named `hasLegendTab` with an initial value of `true` in the `LayerTabsControlComponent` class. This
  property is used to determine whether a legend tab should be displayed based on whether the
  associated `MapLayer` object has legend data available. */
  public hasLegendTab = true;

  /**
   * The constructor function initializes a private property http of type HttpClient.
   * @param {HttpClient} http - The `http` parameter in the constructor is of type `HttpClient`. This
   * parameter is used for making HTTP requests in Angular applications.
   */
  constructor(
    private http: HttpClient
  ) {
  }

  /**
   * The function `ngOnInit` sets the `hasLegendTab` property based on the presence of legend data
   * retrieved asynchronously.
   */
  ngOnInit(): void {

    void this.layer.getLegendData(this.http).then((legendArray: Array<Legend>) => {
      if (legendArray !== null) {
        this.hasLegendTab = true;
      } else {
        this.hasLegendTab = false;
      }
    });
  }

}
