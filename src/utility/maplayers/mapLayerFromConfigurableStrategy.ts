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
import { MapLayer, EposLeafletComponent } from 'utility/eposLeaflet/eposLeaflet';
import { Configurable } from 'api/webApi/data/configurable.interface';
import { DataConfigurable } from 'utility/configurables/dataConfigurable.abstract';
import { MapLayerFactory } from './mapLayerFactory.interface';
import { Stylable } from 'utility/styler/stylable.interface';
import { MapLayerStrategy } from './mapLayerStrategy.interface';

/** The MapLayerFromConfigurableStrategy class creates map layers based on configurable input. */
export class MapLayerFromConfigurableStrategy implements MapLayerStrategy<Configurable> {
  public static make(): MapLayerStrategy<Configurable> {
    return new MapLayerFromConfigurableStrategy();
  }

  /**
   * The function creates map layers based on the input data and configuration using a factory.
   * @param {DataConfigurable} input - The `input` parameter is of type `DataConfigurable`, which is an
   * interface or class that represents a configurable data source for the map layers. It likely has
   * properties such as `id`, `name`, and `currentParamValues`, and methods such as
   * `getParameterDefinitions()`.
   * @param {EposLeafletComponent} mapConfig - The `mapConfig` parameter is an instance of the
   * `EposLeafletComponent` class, which represents the configuration settings for the map.
   * @param factory - A factory function that creates map layers. It takes in the following parameters:
   * @param dataFunction - A function that returns a Promise of type D. This function is responsible
   * for fetching the data that will be used to create the map layers.
   * @returns an array of MapLayer objects.
   */
  createMapLayersFrom<D, L extends MapLayer>(
    input: DataConfigurable,
    mapConfig: EposLeafletComponent,
    factory: MapLayerFactory<D, L>,
    dataFunction: () => Promise<D>,
  ): Array<MapLayer> {
    let layers: Array<MapLayer> = [];
    if (factory != null && dataFunction != null) {
      const id = input.id;
      const name = input.name;
      const stylable = input as Stylable;
      const paramDefs = input.getParameterDefinitions();
      const params = input.currentParamValues.slice();
      // get the style
      layers = factory.createMapLayers(mapConfig, id, name, stylable, paramDefs, params, dataFunction);
    }
    return layers;
  }
}
