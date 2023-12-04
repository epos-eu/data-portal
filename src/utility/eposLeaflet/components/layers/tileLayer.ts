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

import * as L from 'leaflet';
import { MapLayer } from './mapLayer.abstract';

// options: http://leafletjs.com/reference-1.2.0.html#tilelayer
export class TileLayer extends MapLayer {
  public url: string;

  constructor(id: string, name?: string) {
    super(id, name);
    // Default options
    this.options.setOptions({
      pane: 'tilePane',
    });
  }

  public setUrl(url: string): this {
    this.url = url;
    return this;
  }

  public getLeafletLayer(): Promise<null | L.Layer> {
    return Promise.resolve(new L.TileLayer(this.url, this.options.getAll()));
  }
}
