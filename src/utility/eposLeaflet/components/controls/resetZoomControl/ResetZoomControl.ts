/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/*
         Copyright 2024 EPOS ERIC

 Licensed under the Apache License, Version 2.0 (the License); you may not
 use this file except in compliance with the License.  You may obtain a copy
 of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an AS IS BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint-disable @typescript-eslint/member-ordering */

import * as L from 'leaflet';
import { AbstractControl } from '../abstractControl/abstractControl';
import { LayersService } from 'utility/eposLeaflet/services/layers.service';

export class ResetZoomControl extends AbstractControl {
  // Europe (as before)
  private readonly europeCenter: L.LatLngExpression = [54.0, -5.0];
  private readonly europeZoom = 4;

  // Arctic (EPSG:3995)
  private readonly arcticCenter: L.LatLngExpression = [90.0, 0.0];
  private readonly arcticZoom = 3; // tweak if you prefer tighter/wider view

  constructor(private readonly layersService: LayersService) {
    super({ position: 'topright' });
  }

  private isEPSG3995(crs: any): boolean {
    if (!crs) { return false; }
    if (typeof crs === 'string') { return crs.includes('3995'); }
    const code = (crs as any).code ?? (crs as any).options?.code;
    return typeof code === 'string' && code.toUpperCase() === 'EPSG:3995';
  }

  public onAdd(map: L.Map): HTMLElement {
    const controlContainer: HTMLElement = this.getControlContainerForActionOnly(
      'reset-zoom-control',
      'fa fa-compress',
      'Reset zoom and extent',
      () => {
        const crs = this.layersService.getStoredCRS?.();
        const isArctic = this.isEPSG3995(crs);

        const center = isArctic ? this.arcticCenter : this.europeCenter;
        const zoom = isArctic ? this.arcticZoom : this.europeZoom;

        map.flyTo(center, zoom, {
          animate: true,
          duration: 1.5,
          easeLinearity: 0.25,
        });
      }
    );

    return controlContainer;
  }
}
