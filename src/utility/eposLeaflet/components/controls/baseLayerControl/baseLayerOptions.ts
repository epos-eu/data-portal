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
import { EsriBaseLayer } from '../../layers/esriBaseLayer';
import { BaseLayerOption } from './baseLayerOption';

/**
 * Single place for defining leaflet map baselayers used on all maps
 */
export const baseLayerOptions = [
  new BaseLayerOption('None', () => [
  ], () => ''),

  new BaseLayerOption('Open Street Map', () => [
    new EsriBaseLayer('EPOS', 'EPOS')
      .setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
      .toggleable.set(false)
      .setAttr('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'),
  ], () => './assets/img/baseLayer/osm.png'),

  new BaseLayerOption('Open Street Map - Topographic', () => [
    new EsriBaseLayer('EPOS topo', 'EPOS')
      .setUrl('https://tile.opentopomap.org/{z}/{x}/{y}.png')
      .setAttr('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
      .toggleable.set(false),
  ], () => './assets/img/baseLayer/osm-topo.png'),
];
