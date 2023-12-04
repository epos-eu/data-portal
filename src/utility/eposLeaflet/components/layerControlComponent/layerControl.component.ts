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

import { Component, OnInit, Input } from '@angular/core';
import { Map as LMap } from 'leaflet';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MapLayer } from '../layers/mapLayer.abstract';
import { Subscription } from 'rxjs';
import { LayersService } from 'utility/eposLeaflet/services/layers.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BaseLayerOption } from '../controls/public_api';
import { baseLayerOptions } from '../controls/baseLayerControl/baseLayerOptions';
import { Style } from 'utility/styler/style';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { GeoJSONImageOverlayMapLayer } from 'utility/maplayers/geoJSONImageOverlayMapLayer';

@Unsubscriber('subscriptions')
@Component({
  selector: 'app-layer-control',
  templateUrl: './layerControl.component.html',
  styleUrls: ['./layerControl.component.scss']
})
export class LayerControlComponent implements OnInit {

  public selectedBaseLayerVal = '';


  public orderedLayers: Array<MapLayer> = [];
  public basemapToggled = true;


  protected subscriptions: Array<Subscription> = new Array<Subscription>();

  private _map: LMap;

  constructor(private layersService: LayersService) {
  }

  @Input() set map(map: LMap) {
    if (map) {
      this._map = map;
    }
  }

  ngOnInit(): void {

    this.subscriptions.push(

      this.layersService.layersChangeSourceObs.subscribe((layers: Array<MapLayer>) => {
        this.orderLayers(layers);
      }),
      this.layersService.baseLayerChangeSourceObs.subscribe((basemap: BaseLayerOption) => {
        if (null != basemap) {
          this.basemapToggled = (basemap !== baseLayerOptions[0]) ? true : false;
        }
      })

    );

    const baseMapStorage = this.layersService.getBaseLayerFromStorage();
    this.selectedBaseLayer(baseMapStorage.name);

  }

  public drop(event: CdkDragDrop<MapLayer[]>): void {

    if (event.previousContainer === event.container) {
      this.changeOrder(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  public selectedBaseLayer(selectedBaseLayer: string): void {
    this.selectedBaseLayerVal = selectedBaseLayer;
  }

  public updateEnable(event: MatSlideToggleChange): void {
    if (event.checked) {
      this.layersService.baseLayerChange(this.layersService.lastActiveBaseLayer);
      this.selectedBaseLayer((this.layersService.lastActiveBaseLayer as BaseLayerOption).name);
    } else {
      this.layersService.baseLayerChange(baseLayerOptions.find((basemap: BaseLayerOption) => basemap.name === 'None')!);
      this.selectedBaseLayer('None');
    }
  }

  /**
   * This function changes the order of layers in an array and updates their z-index on a map.
   * @param layers - An array of MapLayer objects representing the layers to be reordered.
   * @param {number} oldIndex - The index of the layer that needs to be moved from its current position.
   * @param {number} newIndex - The index where the moved layer should be placed in the array after it
   * has been moved.
   */
  protected changeOrder(layers: Array<MapLayer>, oldIndex: number, newIndex: number): void {
    if (layers.length > 0 && (oldIndex !== newIndex)) {
      const movedLayer = layers.splice(oldIndex, 1)[0];
      layers.splice(newIndex, 0, movedLayer);

      // order on map and persist order
      this.setZIndex(layers);

    }
  }

  /**
   * The function orders map layers based on their visibility and sets their z-index.
   * @param layersArray - An array of MapLayer objects that need to be ordered.
   */
  private orderLayers(layersArray: Array<MapLayer>) {

    this.orderedLayers = this.checkVisible(layersArray);
  }


  /**
   * The function `checkVisible` filters an array of `MapLayer` objects based on their visibility and
   * other conditions, and returns the filtered array.
   * @param layers - An array of MapLayer objects.
   * @returns an array of MapLayer objects that meet certain conditions.
   */
  private checkVisible(layers: Array<MapLayer>) {

    const layersImageOverlayExtra: Array<string> = [];

    const layersChecked = layers.filter((layer: MapLayer) => {

      if (layer.options.customLayerOptionPaneType.get() === 'geoJsonPane' &&
        !layer.options.customLayerOptionHasMarker.get() ||
        layer.options.pane.get() === 'tilePane') {
        return false;
      }

      // if layer is imageOverlay
      if (layer.options.customLayerOptionPaneType.get() === MapLayer.IMAGE_OVERLAY_LAYER_TYPE) {
        // add realId of layerImageOverlay to remove from list layers
        layersImageOverlayExtra.push((layer as GeoJSONImageOverlayMapLayer).getRealId());
      }

      return layer.visibleOnLayerControl.get() && layer.addedToMap.get();

    });

    return layersChecked.filter((layer: MapLayer) => {
      // remove extra imageOverlay layer
      return !layersImageOverlayExtra.includes(layer.id);
    });
  }

  /**
   * This function sets the z-index of map layers in reverse order and updates the layer's custom option
   * value.
   * @param layers - An array of MapLayer objects.
   */
  private setZIndex(layers: Array<MapLayer>): void {
    const layersOrder = this.layersService.getLayersOrderStorage();
    layers.slice().reverse().forEach((layer: MapLayer, index) => {

      if (layer !== null) {
        ++index;
        const pane = this._map.getPane(layer.id);
        if (pane !== undefined && pane !== null) {

          const zIndex = (index + Number(Style.ZINDEX_TOP)).toString();

          pane!.style.zIndex = zIndex;

          // persist zIndex value
          this.layersService.setLayerOrder(layer.id, zIndex, layersOrder);
          layer.options.customLayerOptionZIndex.set(zIndex);
          this.layersService.layerChange(layer);

        }
      }
    });
  }

}
