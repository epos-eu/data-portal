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

@Component({
  selector: 'app-layer-tabs-control',
  templateUrl: './layerTabsControl.component.html',
  styleUrls: ['./layerTabsControl.component.scss']
})
export class LayerTabsControlComponent implements OnInit {

  @Input() layer: MapLayer;

  public hasLegendTab = true;

  constructor(
    private http: HttpClient
  ) {
  }

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
