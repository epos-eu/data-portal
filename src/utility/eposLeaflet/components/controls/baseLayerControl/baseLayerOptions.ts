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

  new BaseLayerOption('Imagery', () => [
    new EsriBaseLayer('Imagery', 'Imagery')
      .setEsriType('Imagery')
      .toggleable.set(false),
  ], () => './assets/img/baseLayer/imagery.png'),

  new BaseLayerOption('Imagery Labels', () => [
    new EsriBaseLayer('Imagery', 'Imagery')
      .setEsriType('Imagery')
      .toggleable.set(false),
    new EsriBaseLayer('Imagery Labels', 'Imagery Labels')
      .setEsriType('ImageryLabels')
      .toggleable.set(false),
  ], () => './assets/img/baseLayer/imageryLabels.png'),

  new BaseLayerOption('Gray', () => [
    new EsriBaseLayer('gray', 'Gray')
      .setEsriType('Gray')
      .toggleable.set(false),
  ], () => './assets/img/baseLayer/gray.png'),

  new BaseLayerOption('Dark Gray', () => [
    new EsriBaseLayer('darkgray', 'DarkGray')
      .setEsriType('DarkGray')
      .toggleable.set(false),
  ], () => './assets/img/baseLayer/darkGray.png'),

  new BaseLayerOption('Streets', () => [
    new EsriBaseLayer('streets', 'Streets')
      .setEsriType('Streets')
      .toggleable.set(false),
  ], () => './assets/img/baseLayer/streets.png'),

  new BaseLayerOption('Shaded Relief', () => [
    new EsriBaseLayer('shadedrelief', 'ShadedRelief')
      .setEsriType('ShadedRelief')
      .toggleable.set(false),
  ], () => './assets/img/baseLayer/shadedRelief.png'),

  new BaseLayerOption('Shaded Relief Labels', () => [
    new EsriBaseLayer('shadedrelief', 'ShadedRelief')
      .setEsriType('ShadedRelief')
      .toggleable.set(false),
    new EsriBaseLayer('ShadedReliefLabels', 'ShadedReliefLabels')
      .setEsriType('ShadedReliefLabels')
      .toggleable.set(false),
  ], () => './assets/img/baseLayer/shadedReliefLabels.png'),

  new BaseLayerOption('Topographic', () => [
    new EsriBaseLayer('topographic', 'Topographic')
      .setEsriType('Topographic')
      .toggleable.set(false),
  ], () => './assets/img/baseLayer/topographic.png'),

  new BaseLayerOption('Oceans', () => [
    new EsriBaseLayer('Oceans', 'Oceans')
      .setEsriType('Oceans')
      .toggleable.set(false),
  ], () => './assets/img/baseLayer/oceans.png'),

  new BaseLayerOption('Oceans Labels', () => [
    new EsriBaseLayer('Oceans', 'Oceans')
      .setEsriType('Oceans')
      .toggleable.set(false),
    new EsriBaseLayer('Oceans Labels', 'Oceans Labels')
      .setEsriType('OceansLabels')
      .toggleable.set(false),
  ], () => './assets/img/baseLayer/oceansLabels.png'),
];
