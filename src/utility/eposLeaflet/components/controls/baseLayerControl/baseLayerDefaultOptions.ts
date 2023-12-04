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


/** The code defines an array called `baseLayerDefaultOptions` that contains a list of default base
layer options.Each option is an instance of the `BaseLayerOption` class and represents a different
base layer option that can be selected. */
export const baseLayerDefaultOptions = [
  new BaseLayerOption('None', () => [
  ], () => ''),
  new BaseLayerOption('Streets', () => [
    new EsriBaseLayer('Streets', 'Streets').setEsriType('Streets').toggleable.set(false),
  ], () => ''),
  new BaseLayerOption('Topographic', () => [
    new EsriBaseLayer('Topographic', 'Topographic').setEsriType('Topographic').toggleable.set(false),
  ], () => ''),
  new BaseLayerOption('National Geographic', () => [
    new EsriBaseLayer('NationalGeographic', 'National Geographic').setEsriType('NationalGeographic').toggleable.set(false),
  ], () => ''),
  new BaseLayerOption('Oceans', () => [
    new EsriBaseLayer('Oceans', 'Oceans').setEsriType('Oceans').toggleable.set(false),
    new EsriBaseLayer('OceansLabels', 'Oceans Labels').setEsriType('OceansLabels'),
  ], () => ''),
  new BaseLayerOption('Gray', () => [
    new EsriBaseLayer('Gray', 'Gray').setEsriType('Gray').toggleable.set(false),
    new EsriBaseLayer('GrayLabels', 'Gray Labels').setEsriType('GrayLabels'),
  ], () => ''),
  new BaseLayerOption('DarkGray', () => [
    new EsriBaseLayer('DarkGray', 'Dark Gray').setEsriType('DarkGray').toggleable.set(false),
    new EsriBaseLayer('DarkGrayLabels', 'DarkGray Labels').setEsriType('DarkGrayLabels'),
  ], () => ''),
  new BaseLayerOption('Imagery', () => [
    new EsriBaseLayer('Imagery', 'Imagery').setEsriType('Imagery').toggleable.set(false),
    new EsriBaseLayer('ImageryTransportation', 'Imagery Transportation').setEsriType('ImageryTransportation').hidden.set(true),
    new EsriBaseLayer('ImageryLabels', 'Imagery Labels').setEsriType('ImageryLabels'),
  ], () => ''),
  new BaseLayerOption('Imagery Clarity', () => [
    new EsriBaseLayer('ImageryClarity', 'Imagery Clarity').setEsriType('ImageryClarity').toggleable.set(false),
    new EsriBaseLayer('ImageryTransportation', 'Imagery Transportation').setEsriType('ImageryTransportation').hidden.set(true),
    new EsriBaseLayer('ImageryLabels', 'Imagery Labels').setEsriType('ImageryLabels'),
  ], () => ''),
  new BaseLayerOption('Imagery Firefly', () => [
    new EsriBaseLayer('ImageryFirefly', 'Imagery Firefly').setEsriType('ImageryFirefly').toggleable.set(false),
    new EsriBaseLayer('ImageryTransportation', 'Imagery Transportation').setEsriType('ImageryTransportation').hidden.set(true),
    new EsriBaseLayer('ImageryLabels', 'Imagery Labels').setEsriType('ImageryLabels'),
  ], () => ''),
  new BaseLayerOption('Shaded Relief', () => [
    new EsriBaseLayer('ShadedRelief', 'Shaded Relief').setEsriType('ShadedRelief').toggleable.set(false),
    new EsriBaseLayer('ShadedReliefLabels', 'Shaded Relief Labels').setEsriType('ShadedReliefLabels'),
  ], () => ''),
  new BaseLayerOption('Terrain', () => [
    new EsriBaseLayer('Terrain', 'Terrain').setEsriType('Terrain').toggleable.set(false),
    new EsriBaseLayer('TerrainLabels', 'Terrain Labels').setEsriType('TerrainLabels'),
  ], () => ''),
  new BaseLayerOption('USA Topo', () => [
    new EsriBaseLayer('USATopo', 'USA Topo').setEsriType('USATopo').toggleable.set(false),
  ], () => ''),
  new BaseLayerOption('Physical', () => [
    new EsriBaseLayer('Physical', 'Physical').setEsriType('Physical').toggleable.set(false),
    new EsriBaseLayer('TerrainLabels', 'Physical').setEsriType('TerrainLabels'),
  ], () => ''),
];
