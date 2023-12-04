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
import * as esri from 'esri-leaflet';
// import * as vector from 'esri-leaflet-vector';

import { TileLayer } from './tileLayer';

export type EsriBaseMapsOverride = esri.Basemaps | 'ImageryFirefly' | 'Physical';

export class EsriBaseLayer extends TileLayer {
  public esriBasemapType: EsriBaseMapsOverride;

  constructor(id: string, name?: string) {
    super(id, name);
  }

  public getLeafletLayer(): Promise<L.Layer> {
    // return Promise.resolve(vector.vectorBasemapLayer(this.esriBasemapType as esri.Basemaps, this.options.getAll()) as esri.BasemapLayer);
    return Promise.resolve(esri.basemapLayer(this.esriBasemapType as esri.Basemaps, this.options.getAll()));
  }

  public setEsriType(esriBasemapType: EsriBaseMapsOverride): this {
    this.esriBasemapType = esriBasemapType;
    return this;
  }
}
