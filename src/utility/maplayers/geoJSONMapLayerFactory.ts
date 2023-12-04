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

import { MapLayerFactory } from './mapLayerFactory.interface';
import {
  GeoJsonLayer, EposLeafletComponent
} from 'utility/eposLeaflet/eposLeaflet';
import { ParameterValue } from 'api/webApi/data/parameterValue.interface';
import { Stylable } from 'utility/styler/stylable.interface';
import { ParameterDefinitions } from 'api/webApi/data/parameterDefinitions.interface';
import { Injector } from '@angular/core';
import { GeoJSONMapLayer } from './geoJSONMapLayer';


/** The GeoJSONMapLayerFactory class is a TypeScript class that implements the MapLayerFactory interface
and is responsible for creating GeoJsonLayer objects based on the provided parameters. */
export class GeoJSONMapLayerFactory implements MapLayerFactory<GeoJSON.GeoJsonObject, GeoJsonLayer> {

  /**
   * The constructor function takes an injector as a parameter and assigns it to the protected injector
   * property.
   * @param {Injector} injector - The `injector` parameter is an instance of the `Injector` class. The
   * `Injector` class is responsible for creating instances of classes and resolving their
   * dependencies. It is commonly used in Angular applications for dependency injection.
   */
  constructor(
    protected injector: Injector,
  ) {
  }

  /**
   * The function creates map layers using the provided configuration and data.
   * @param {EposLeafletComponent} mapConfig - The `mapConfig` parameter is of type
   * `EposLeafletComponent`. It is used to configure the Leaflet map component.
   * @param {string} id - The `id` parameter is a string that represents the unique identifier for the
   * map layer. It is used to distinguish between different map layers when working with multiple
   * layers in the application.
   * @param {string} name - The `name` parameter is a string that represents the name of the map layer.
   * @param {Stylable} stylable - The "stylable" parameter is an object that contains information about
   * how the map layer should be styled. It likely includes properties such as color, opacity, and line
   * width.
   * @param {ParameterDefinitions} parameterDefs - The parameterDefs parameter is of type
   * ParameterDefinitions, which is an object that defines the parameters for the map layers. It
   * contains information such as the name, type, and default value of each parameter.
   * @param parameters - The `parameters` parameter is an array of `ParameterValue` objects. Each
   * `ParameterValue` object represents a specific parameter for the map layer.
   * @param getDataFunction - The `getDataFunction` parameter is a function that returns a Promise that
   * resolves to a GeoJSON object. This function is responsible for fetching the data that will be used
   * to create the map layer.
   * @returns An array of GeoJsonLayer objects.
   */
  public createMapLayers(
    mapConfig: EposLeafletComponent,
    id: string,
    name: string,
    stylable: Stylable,
    parameterDefs: ParameterDefinitions,
    parameters: Array<ParameterValue>,
    getDataFunction: () => Promise<GeoJSON.GeoJsonObject>,
  ): Array<GeoJsonLayer> {
    return [new GeoJSONMapLayer(this.injector, id, name, stylable, getDataFunction, mapConfig)];

  }
}
