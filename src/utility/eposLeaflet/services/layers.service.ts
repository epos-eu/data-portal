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
import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { baseLayerOptions } from '../components/controls/baseLayerControl/baseLayerOptions';
import { BaseLayerOption, MapLayer } from '../eposLeaflet';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';
import { Tracker } from 'utility/tracker/tracker.service';
import { TrackerAction, TrackerCategory } from 'utility/tracker/tracker.enum';

@Injectable()
export class LayersService {

  public static readonly INDEX_DEFAULT_BASEMAP = 1;


  public lastActiveBaseLayer = baseLayerOptions[LayersService.INDEX_DEFAULT_BASEMAP];

  private layersChangeSource = new BehaviorSubject<Array<MapLayer>>(new Array<MapLayer>());
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public layersChangeSourceObs = this.layersChangeSource.asObservable();

  private layerChangeSource = new BehaviorSubject<MapLayer | null>(null);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public layerChangeSourceObs = this.layerChangeSource.asObservable();

  private baseLayerChangeSource = new BehaviorSubject<BaseLayerOption | null>(null);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public baseLayerChangeSourceObs = this.baseLayerChangeSource.asObservable();

  constructor(
    private readonly localStoragePersister: LocalStoragePersister,
    private readonly tracker: Tracker,
  ) { }

  public layersChange(layers: Array<MapLayer>): void {
    this.layersChangeSource.next(layers);
  }

  public layerChange(layer: MapLayer): void {
    this.layerChangeSource.next(layer);
  }

  public baseLayerChange(layer: BaseLayerOption): void {
    this.baseLayerChangeSource.next(layer);
    this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, layer.name, false, LocalStorageVariables.LS_BASEMAP);

    this.tracker.trackEvent(TrackerCategory.MAP, TrackerAction.BASEMAP, layer.name);

    if (layer != null && layer.name !== 'None') {
      this.lastActiveBaseLayer = layer;
    }
  }

  /**
   * If the local storage has a value for the base map, return that value, otherwise return the default
   * value
   * @returns The base layer option that is stored in local storage.
   */
  public getBaseLayerFromStorage(): BaseLayerOption {
    const item = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_BASEMAP);
    const indexBasemap = baseLayerOptions.findIndex(o => { return o.name === item; });
    return baseLayerOptions[indexBasemap !== -1 ? indexBasemap : LayersService.INDEX_DEFAULT_BASEMAP];
  }


  /**
   * The function `setLayerOrder` updates the order of layers in a map and stores the updated map in
   * local storage.
   * @param {string} layerId - The `layerId` parameter is a string that represents the unique identifier
   * of a layer.
   * @param {string | undefined} zIndex - The `zIndex` parameter is a string or undefined. It represents
   * the z-index value of the layer. If it is undefined, it means that the layer should be removed from
   * the layers map.
   * @param {Map<string, string> | null} [layers=null] - The `layers` parameter is a `Map` object that
   * represents the order of layers. Each key-value pair in the `Map` represents a layer, where the key
   * is the layer ID and the value is the layer's zIndex. The `layers` parameter is optional and can be
   * `null`.
   */
  public setLayerOrder(layerId: string, zIndex: string | undefined, layers: Map<string, string> | null = null): void {

    if (layers === null) {
      layers = this.getLayersOrderStorage();
    }

    if (zIndex !== undefined) {
      layers.set(layerId, zIndex);
    } else {
      layers.delete(layerId);
    }

    this.localStoragePersister.set(
      LocalStorageVariables.LS_CONFIGURABLES,
      JSON.stringify(Array.from(layers.entries())),
      false,
      LocalStorageVariables.LS_LAYERS_ORDER
    );

  }

  /**
   * This function retrieves the order of a layer by its ID from a storage.
   * @param {string} layerId - A string representing the ID of a layer.
   * @returns a string value or undefined. The string value is the layer order associated with the
   * given layerId, which is retrieved from the layers map using the get() method. If the layerId is
   * not found in the map, the function returns undefined.
   */
  public getLayerOrderById(layerId: string): string | undefined {
    const layers = this.getLayersOrderStorage();
    return layers.get(layerId);
  }

  /**
   * This function retrieves and returns a Map of layers order from local storage in TypeScript.
   * @returns a Map object that contains the layers order stored in the localStorage. The keys of the Map
   * are strings representing the layer IDs, and the values are also strings representing the order of
   * the layers.
   */
  public getLayersOrderStorage(): Map<string, string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const layersJSon = JSON.parse(
      this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_LAYERS_ORDER) as string ?? '[]'
    );

    let layers: Map<string, string> = new Map();
    if (layersJSon !== null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      layers = new Map(layersJSon.map((obj: Map<string, string>) => [obj[0] as string, obj[1] as string]) as Map<string, string>);
    }

    return layers;
  }

  /**
   * The function `pruneLayersOrderStorage` removes any layers from local storage that are not present in
   * the `layersActive` array.
   * @param layersActive - An array of MapLayer objects representing the currently active layers.
   */
  public pruneLayersOrderStorage(layersActive: Array<MapLayer>): void {
    const layersLocalStorage = this.getLayersOrderStorage();
    layersLocalStorage.forEach((value, key) => {
      const layerFound = layersActive.find((layer: MapLayer) => {
        return layer.id === key;
      });
      if (layerFound === undefined) {
        this.setLayerOrder(key, undefined);
      }
    });
  }

}
