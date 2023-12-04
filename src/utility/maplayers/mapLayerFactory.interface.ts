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
import { Stylable } from 'utility/styler/stylable.interface';
import { MapLayer, EposLeafletComponent } from 'utility/eposLeaflet/eposLeaflet';
import { ParameterValue } from 'api/webApi/data/parameterValue.interface';
import { ParameterDefinitions } from 'api/webApi/data/parameterDefinitions.interface';

/** The `MapLayerFactory` interface is defining a generic interface that takes two type parameters `D`
and `L`. */
export interface MapLayerFactory<D, L extends MapLayer> {

  /** The `createMapLayers` method is a function that takes several parameters and returns an array of map
layers. */
  createMapLayers(
    mapConfig: EposLeafletComponent,
    id: string,
    name: string,
    stylable: Stylable,
    parameterDefs: ParameterDefinitions,
    parameters: Array<ParameterValue>,
    getDataFunction: () => Promise<D>,
  ): Array<L>;
}
