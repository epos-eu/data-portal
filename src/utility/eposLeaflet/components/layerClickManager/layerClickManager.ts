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

import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { EposLeafletComponent } from '../eposLeaflet.component';
import { MapLayer } from '../layers/mapLayer.abstract';
import { FeatureDisplayItem } from '../featureDisplay/featureDisplayItem';
import { PaginatedFeatures } from '../featureDisplay/paginatedFeatures';
import { PopupCloseHeader } from '../featureDisplay/popupCloseHeader';
import moment from 'moment-es6';
import 'jquery';
import { DataConfigurableDataSearch } from 'utility/configurablesDataSearch/dataConfigurableDataSearch';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { Injector } from '@angular/core';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { GeoJSONHelper } from 'utility/maplayers/geoJSONHelper';

export class LayerClickManager {
  protected leafletMapObj: L.Map;
  protected http: HttpClient;
  protected eposLeaflet: EposLeafletComponent;

  protected currentPopup: null | L.Popup;

  private panelEvent: PanelsEmitterService;
  private localStoragePersister: LocalStoragePersister;

  constructor(protected injector: Injector,) {
    this.panelEvent = injector.get<PanelsEmitterService>(PanelsEmitterService);
    this.localStoragePersister = injector.get<LocalStoragePersister>(LocalStoragePersister);
  }

  public init(leafletMapObj: L.Map, http: HttpClient, eposLeaflet: EposLeafletComponent): this {
    this.leafletMapObj = leafletMapObj;
    this.http = http;
    this.eposLeaflet = eposLeaflet;
    return this;
  }

  public click(clickEvent: L.LeafletMouseEvent): void {
    if (!this.leafletMapObj) {
      console.warn('"init" method needs calling before "click" method!');
    }
    const itemsPromise = new Promise<Array<FeatureDisplayItem>>((resolve) => {
      // ensure taken out of flow
      setTimeout(() => {
        const promiseArray = new Array<Promise<Array<FeatureDisplayItem>>>();

        this.eposLeaflet.getLayersOrdered().forEach((layer: MapLayer) => {
          if (!layer.hidden.get()
            // layer != bbox spatial
            && (layer.id !== MapLayer.BBOX_LAYER_ID && layer.id !== MapLayer.BBOX_EDITABLE_LAYER_ID)) {
            layer.click(clickEvent);

            promiseArray.push(layer.getLayerClickFeatureItem(clickEvent, this.http));
          }
        });
        resolve(
          Promise.all(promiseArray).then((featureItemArrayArray: Array<Array<FeatureDisplayItem>>) => {
            // merge arrays to single array
            return new Array<FeatureDisplayItem>().concat(...featureItemArrayArray);
          }),
        );
      });
    });

    this.displayFeatures(itemsPromise, [clickEvent.latlng.lat, clickEvent.latlng.lng]);
  }

  /**
   * Override to use the FeatureDisplayItems in a way other than using the leaflet popup.
   * You could use the PaginatedFeatures like this default implementation does.
   * @param featureItemsPromise A Promise of an array of FeatureDisplayItems.
   */
  public displayFeatures(featureItemsPromise: Promise<Array<FeatureDisplayItem>>, latLng: [number, number]): void {
    const popup = this.createPopup(latLng);

    popup.on('remove', () => this.closePopup(popup));

    void new PaginatedFeatures(this.leafletMapObj, featureItemsPromise, this.injector)
      .getDisplayItem()
      .then((content: HTMLElement) => {
        if (null == content) {
          this.cancelPopup(popup);
        } else {
          this.showPopup(popup, content);
        }
      });
  }

  protected setPopupContent(popup: L.Popup, content: HTMLElement): void {

    const showOnTableContent: Element[] = Array.from(content.getElementsByClassName('showOnTable'));
    if (showOnTableContent.length > 0) {
      showOnTableContent.forEach((e: Element) => {
        e.addEventListener('click', (event) => { this.showOnTable(content, event); });
      });
    }

    const showOnGraphContent: Element[] = Array.from(content.getElementsByClassName('showOnGraph'));
    if (showOnGraphContent.length > 0) {
      showOnGraphContent.forEach((e: Element) => {
        e.addEventListener('click', (event) => { this.showOnGraph(content, event); });
      });
    }

    popup.setContent(
      PopupCloseHeader.addToContentElement(content, () => {
        this.cancelPopup(popup);
      }),
    );
  }
  protected createPopup(latLng: [number, number]): L.Popup {
    const popup = L.popup({
      className: PaginatedFeatures.WRAPPER_CSS_CLASS,
    }).setLatLng(latLng);
    // show loading element
    this.setPopupContent(
      popup,
      jQuery(
        `<div class="${PaginatedFeatures.CSS_CLASS} loading"><i class="spinner fas fa-spinner fa-pulse"></i></div>`,
      )[0],
    );

    this.currentPopup = popup;

    // small delay on showing the popup so that if the data is available
    // but there is nothing to show, not even the loading is displayed
    setTimeout(() => {
      this.showPopup(popup);
    }, 250);

    return popup;
  }

  protected showPopup(popup: L.Popup, newContent?: HTMLElement): void {
    // only if it's the current one
    if (popup === this.currentPopup) {
      if (null != newContent) {
        this.setPopupContent(popup, newContent);
      }
      if (!popup.isOpen()) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        popup['openedAt'] = moment();
        popup.openOn(this.leafletMapObj);
      }
    }
  }
  protected cancelPopup(popup: L.Popup): void {
    if (popup === this.currentPopup) {
      this.currentPopup = null;
      if (popup.isOpen()) {
        // close the popup after a delay if it's not been visible for long, so that it doesn't just flash up
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/dot-notation
        const openedAt = popup['openedAt'];
        const minDisplayMs = 500;
        const timoutMs = Math.min(minDisplayMs - moment().diff(openedAt as moment.MomentInput), minDisplayMs);

        setTimeout(() => {
          this.closePopup(popup);
        }, timoutMs);
      }
    }
  }

  protected closePopup(popup: L.Popup): void {

    // reset timeseries popup layerId
    const layerId = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_TS_POPUP_LAYER_ID) as string;
    if (layerId !== null && layerId !== '') {
      this.panelEvent.setTimeSeriesPopupLayerIdUrl(layerId, null);
      this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, '', false, LocalStorageVariables.LS_TS_POPUP_LAYER_ID);
    }

    this.leafletMapObj.closePopup(popup);
    this.eposLeaflet.clearRowOnTablePanel();
  }

  protected showOnTable(content: HTMLElement, event: Event): void {

    // check popup position and move if over panel table
    const wh = window.innerHeight;
    const py = (event as PointerEvent).y;

    if (wh / 2 > py) {
      this.eposLeaflet.moveToPoint(0, wh / 2 - (py - 100));
    }

    // get current slide on popup
    const slide = content.getElementsByClassName('selected');

    // get title h5 element
    const slideTitleContent = slide[0].getElementsByClassName('popup-title');
    // get feature Id
    const featureId = slideTitleContent[0].getAttribute('data-id');
    if (slideTitleContent.length > 0) {
      const layerTitle: string = slideTitleContent[0].innerHTML;

      if (featureId !== null && layerTitle !== null) {

        let layer = this.eposLeaflet.getLayers().find((l: MapLayer) => { return l.name === layerTitle; });

        // if layer is imageOverlay => get its geoJson layer
        if (layer !== undefined && layer.options.customLayerOptionPaneType.get() === MapLayer.IMAGE_OVERLAY_LAYER_TYPE) {

          if (layer.id.endsWith(GeoJSONHelper.IMAGE_OVERLAY_ID_SUFFIX)) {
            const layerId = layer.id.slice(0, -(GeoJSONHelper.IMAGE_OVERLAY_ID_SUFFIX.length));
            layer = this.eposLeaflet.getLayers().find((l: MapLayer) => { return l.id === layerId; });
          }
        }

        if (layer !== undefined) {

          const dataConfigurable = layer.getStylable() as DataConfigurableDataSearch | undefined;

          if (dataConfigurable !== undefined && dataConfigurable.isTabularable) {

            // open table panel on layer and feature
            this.eposLeaflet.selectRowOnTablePanel(layer.id, featureId);
          }
        }
      }

    }
  }

  protected showOnGraph(content: HTMLElement, event: Event): void {

    // check popup position and move if over panel graph
    const wh = window.innerHeight;
    const py = (event as PointerEvent).y;

    if (wh / 2 < py) {
      this.eposLeaflet.moveToPoint(0, wh / 2 - (py + 100));
    }

    // get current slide on popup
    const slide = content.getElementsByClassName('selected');

    // get title h5 element
    const slideTitleContent = slide[0].getElementsByClassName('popup-title');

    if (slideTitleContent.length > 0) {
      const layerTitle = slideTitleContent[0].innerHTML;

      // get feature Id
      const featureId = slideTitleContent[0].getAttribute('data-id');

      if (featureId !== null && layerTitle !== null) {

        const layer = this.eposLeaflet.getLayers().find((l: MapLayer) => { return l.name === layerTitle; });

        if (layer !== undefined) {

          const dataConfigurable = layer.getStylable() as DataConfigurableDataSearch | undefined;

          if (dataConfigurable !== undefined && dataConfigurable.isGraphable) {

            // open graph panel on layer and feature
            this.panelEvent.graphPanelOpen(layer.id, false);
          }
        }
      }

    }
  }
}
