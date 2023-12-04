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
import { ExecutionService } from 'services/execution.service';
import * as GeoJSON from 'geojson/../geojson';
import { DistributionFormatType } from 'api/webApi/data/distributionFormatType';
import { DataConfigurable } from '../configurables/dataConfigurable.abstract';
import { MapLayerStrategy } from './mapLayerStrategy.interface';
import { Configurable } from 'api/webApi/data/configurable.interface';
import { GeoJSONMapLayerFactory } from './geoJSONMapLayerFactory';
import { WMSMapLayerFactory } from './wmsMapLayerFactory';
import { DistributionFormat } from 'api/webApi/data/distributionFormat.interface';
import { MapLayerFactory } from './mapLayerFactory.interface';
import { MapLayerFromConfigurableStrategy } from './mapLayerFromConfigurableStrategy';
import { CompositeMapLayerFactory } from './compositeMapLayerFactory';
import { GeoJSONImageOverlayMapLayerFactory } from './geoJSONImageOverlayMapLayerFactory';
import { Injector } from '@angular/core';
import { CovJSONMapLayerFactory } from './covJSONMapLayerFactory';

/** The `MapLayerGenerator` class is responsible for generating map layers based on configurable data
and map configurations. */
export class MapLayerGenerator {
  private readonly executionService: ExecutionService;

  private constructor(
    injector: Injector,
    private readonly fromConfigurable: MapLayerStrategy<Configurable>, //
    private readonly factoryMap: Map<string, MapLayerFactory<unknown, MapLayer>>
  ) {
    this.executionService = injector.get<ExecutionService>(ExecutionService);
  }

  /**
   * The function creates a MapLayerGenerator object with various MapLayerFactory objects based on
   * different distribution format types.
   * @param {Injector} injector - The `injector` parameter is an instance of the `Injector` class. It
   * is used for dependency injection, which allows you to provide instances of classes or values to be
   * used by other classes.
   * @returns an instance of the `MapLayerGenerator` class.
   */
  public static make(
    injector: Injector,
  ): MapLayerGenerator {
    const fromConfigurable: MapLayerStrategy<Configurable> = MapLayerFromConfigurableStrategy.make();

    const factoryMap = new Map<string, MapLayerFactory<unknown, MapLayer>>();
    const geoJSONCompositeFactory = new CompositeMapLayerFactory<GeoJSON.GeoJsonObject, MapLayer>([
      new GeoJSONMapLayerFactory(injector),
      new GeoJSONImageOverlayMapLayerFactory(injector),
    ]);

    const covJSONCompositeFactory = new CompositeMapLayerFactory<GeoJSON.GeoJsonObject, MapLayer>([
      new CovJSONMapLayerFactory(injector),
    ]);

    factoryMap.set(DistributionFormatType.APP_GEOJSON, geoJSONCompositeFactory);
    factoryMap.set(DistributionFormatType.APP_EPOS_GEOJSON, geoJSONCompositeFactory);
    factoryMap.set(DistributionFormatType.APP_EPOS_MAP_GEOJSON, geoJSONCompositeFactory);
    factoryMap.set(DistributionFormatType.APP_OGC_WMS, new WMSMapLayerFactory(injector));
    factoryMap.set(DistributionFormatType.APP_COV_JSON, covJSONCompositeFactory);

    return new MapLayerGenerator(injector, fromConfigurable, factoryMap);
  }

  /**
   * The function creates map layers based on a configurable data source and map configuration.
   * @param {DataConfigurable} dataConfigurable - The `dataConfigurable` parameter is an object of type
   * `DataConfigurable`. It contains the configuration details for the data that will be used to create
   * map layers.
   * @param {EposLeafletComponent} mapConfig - The `mapConfig` parameter is of type
   * `EposLeafletComponent`. It is an object that contains the configuration settings for the map
   * component.
   * @returns An array of MapLayer objects.
   */
  public createMapLayersFromConfigurable(
    dataConfigurable: DataConfigurable,
    mapConfig: EposLeafletComponent,
  ): Array<MapLayer> {
    const dist = dataConfigurable.getDistributionDetails();
    const format = dist.getMappableFormats()[0];
    const formatString: string = format.getFormat();

    const factory = this.factoryMap.get(formatString);
    if (null == factory) {
      return new Array<MapLayer>();
    } else {
      // Switch on format
      switch (true) {
        case (DistributionFormatType.in(formatString, [
          DistributionFormatType.APP_GEOJSON,
          DistributionFormatType.APP_EPOS_GEOJSON,
          DistributionFormatType.APP_EPOS_MAP_GEOJSON,
          DistributionFormatType.APP_COV_JSON,
        ])):
          return this.createGeoJSONLayers(dataConfigurable, mapConfig, factory, format);
        case (DistributionFormatType.is(formatString, DistributionFormatType.APP_OGC_WMS)):
          return this.fromConfigurable.createMapLayersFrom(
            dataConfigurable,
            mapConfig,
            factory,
            () => Promise.resolve(this.executionService.getExecuteUrl(format)),
          );
        default: return new Array<MapLayer>();
      }
    }
  }

  private createGeoJSONLayers(
    dataConfigurable: DataConfigurable, //
    mapConfig: EposLeafletComponent, factory: MapLayerFactory<unknown, MapLayer>, //
    format: DistributionFormat,
  ): Array<MapLayer> {
    return this.fromConfigurable.createMapLayersFrom(
      dataConfigurable,
      mapConfig,
      factory,
      this.makeTheDataFunctionForGeoJSON(dataConfigurable, format),
    );
  }

  private makeTheDataFunctionForGeoJSON(
    dataConfigurable: DataConfigurable,
    format: DistributionFormat,
  ): () => Promise<GeoJSON.GeoJsonObject> {
    let returnPromise: Promise<GeoJSON.GeoJsonObject>;
    return () => {
      if (null == returnPromise) {
        returnPromise = new Promise((resolve) => {
          resolve(
            this.executionService.executeDistributionFormat(
              dataConfigurable.getDistributionDetails(),
              format,
              dataConfigurable.getParameterDefinitions(),
              dataConfigurable.currentParamValues.slice(),
            ) as Promise<GeoJSON.GeoJsonObject>);
        });
      }
      return returnPromise;
    };
  }
}
