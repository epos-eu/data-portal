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
import { EposLeafletComponent, MapLayer } from 'utility/eposLeaflet/eposLeaflet';
import { ParameterValue } from 'api/webApi/data/parameterValue.interface';
import { Stylable } from 'utility/styler/stylable.interface';
import { ParameterDefinitions } from 'api/webApi/data/parameterDefinitions.interface';

/**
 * <D> is the input data type
 * <L> is the type of layers created by the factories
 */
export class CompositeMapLayerFactory<D, L extends MapLayer> implements MapLayerFactory<D, MapLayer> {

  constructor(private readonly factories: Array<MapLayerFactory<D, L>>) { }

  createMapLayers(
    mapConfig: EposLeafletComponent,
    id: string,
    name: string,
    stylable: Stylable,
    parameterDefs: ParameterDefinitions,
    parameters: Array<ParameterValue>,
    getDataFunction: () => Promise<D>,
  ): Array<MapLayer> {

    let allLayers: Array<MapLayer> = [];

    this.factories.forEach(factory => {
      const layers: Array<MapLayer> = factory.createMapLayers(mapConfig, id, name, stylable, parameterDefs, parameters, getDataFunction);
      allLayers = allLayers.concat(layers);
    });

    return allLayers;
  }
}

