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
import { MapLayer } from 'utility/eposLeaflet/eposLeaflet';

@Component({
  selector: 'app-arctic-overlay-selection',
  templateUrl: './overlayArticLayer.component.html',
  styleUrls: ['./overlayArticLayer.component.scss']
})
export class OverlayArcticComponent {

  /**
   * Receives the array of Arctic layers to display,
   * passed from the parent component (LayerControlComponent).
   */
  @Input() layers: Array<MapLayer> = [];

  constructor() { }

}
