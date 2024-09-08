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

import {
  Component,
  Input,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  OnInit,
  Injector,
  HostListener,
} from '@angular/core';
import { Subscription, Subject, Observable, BehaviorSubject } from 'rxjs';
import { MapLayer } from './layers/mapLayer.abstract';
import moment from 'moment-es6';

import * as L from 'leaflet';

import { HttpClient } from '@angular/common/http';
import { LayerClickManager } from './layerClickManager/layerClickManager';
import { BoundingBox } from './boundingBox';
import { MoveMethod } from './moveMethod.enum';
import { Watchable } from '../objects/configAttributes/configAttributeInterfaces';
import { LayersService } from '../services/layers.service';
import { BaseLayerOption, EsriBaseLayer } from '../eposLeaflet';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { Style } from 'utility/styler/style';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';
import { MapInteractionService } from 'utility/eposLeaflet/services/mapInteraction.service';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { LeafletLoadingService } from '../services/leafletLoading.service';

@Unsubscriber('subscriptions')
@Component({
  selector: 'app-epos-leaflet-map',
  templateUrl: 'eposLeaflet.component.html',
  styleUrls: [
    'eposLeaflet.component.scss',
    './marker/faMarker/faMarker.scss',
    './featureDisplay/paginatedFeatures.scss',
    './controls/abstractControl/abstractControl.scss',
    './controls/baseLayerControl/baseLayerControl.scss',
    './controls/drawBBoxControl/drawBBoxControl.scss',
    './controls/customLayerControl/customLayerControl.scss',
    './controls/searchControl/searchControl.scss',
  ]
})
export class EposLeafletComponent implements OnInit, AfterViewInit {

  public static readonly ZINDEX_TOP_LAYER = '500';

  @Input() initialLatLng: [number, number] = [52.8, -1.0];
  @Input() initialZoom = 4;
  @Input() minZoom = 2;
  @Input() maxZoom = 12;
  @Input() crs = L.CRS.EPSG3857;
  @Input() zoomable = true;
  @Input() dragable = true;

  @Output() onload = new EventEmitter<EposLeafletComponent>();

  @ViewChild('mapElement', { static: true }) protected mapElement: ElementRef<HTMLElement>;

  public leafletMapObj: L.Map;
  /**
   * The `showLoader` property is a boolean flag that determines whether a loading spinner is displayed. It should not
   * be set directly, but rather through the `showLoading` method that will emit the value to the observer.
   */
  public showLoader = false;

  public layerControlOpened = new Subject<boolean>();
  public layers = new Array<MapLayer>();

  protected LOADER_DELAY_MS = 200; // delay before loader is shown.

  protected movingMap = false;

  protected layersChangeTimeout: NodeJS.Timeout;
  protected layersChangeSource = new Subject<Array<MapLayer>>();
  protected loadingLayerCount = 0;
  protected loaderCheckInterval: NodeJS.Timeout;

  protected layerClickManager: null | LayerClickManager;

  protected layerRedrawQueues = new Map<string, Array<MapLayer | string>>();
  protected redrawQueueProcessing = new Map<string, boolean>();

  protected layerOrderChangeQueue = new Array<[string, boolean]>();

  protected layersOrderTimer: NodeJS.Timeout;

  protected layerPositionMonitorFront = new Map<string, Subscription>();
  protected layerPositionMonitorBack = new Map<string, Subscription>();
  protected layerSetNotHiddenMonitor = new Map<string, Subscription>();

  private latLngSource = new BehaviorSubject<[number, number] | null>(null);
  private zoomSource = new BehaviorSubject<number | null>(null);

  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(
    protected elRef: ElementRef<HTMLElement>,
    protected http: HttpClient,
    protected layersService: LayersService,
    protected panelsEvent: PanelsEmitterService,
    protected injector: Injector,
    protected localStoragePersister: LocalStoragePersister,
    protected mapInteractionService: MapInteractionService,
    protected loaderService: LeafletLoadingService,
  ) {
  }

  @HostListener('click', ['$event'])
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  public openTimeSeriesGraphButton(event: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (event.target.id === 'timeseries_button') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const button = event.target as HTMLElement;
      const layerId = button.dataset.layerid;
      const url = button.dataset.url;
      if (url !== undefined && layerId !== undefined) {
        this.panelsEvent.setTimeSeriesPopupLayerIdUrl(layerId, url);

        // check popup position and move if over panel graph
        this.moveMapEventPoint(event as Event, 100, 150, true);
      }
    }
  }

  public ngOnInit(): void {
    this.leafletMapObj = L.map(this.getMapElement(), {
      wheelPxPerZoomLevel: 1000,
      worldCopyJump: true,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      zoomControl: false,
      crs: this.crs,
    } as L.MapOptions);

    this.zoomSource.next(this.initialZoom);
    this.latLngSource.next(this.initialLatLng);
  }

  /* after html generated */
  public ngAfterViewInit(): void {

    this.leafletMapObj.on('load', () => this.onload.emit(this));

    // get initialLatLng from localStorage
    void this.localStoragePersister.get(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_MAP_ZOOM).then((val: string) => {
      if (val !== null) {
        const initialZoom = Number(val);
        this.zoomSource.next(initialZoom);
      }
    });

    void this.localStoragePersister.get(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_MAP_POSITION).then((val: string) => {
      if (val !== null) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const latLng = JSON.parse(val as string || '[]');
        this.latLngSource.next(latLng as [number, number]);
      }
    });

    if (!this.zoomable) {
      this.leafletMapObj.removeControl(L.control.zoom());
      this.leafletMapObj.touchZoom.disable();
      this.leafletMapObj.doubleClickZoom.disable();
      this.leafletMapObj.scrollWheelZoom.disable();
      this.leafletMapObj.boxZoom.disable();
      this.leafletMapObj.keyboard.disable();
    }

    if (!this.dragable) {
      this.leafletMapObj.dragging.disable();
    }

    this.leafletMapObj.on('zoomend', () => {
      this.saveMapZoomAndPosition();
    });

    this.leafletMapObj.on('mousemove', () => {
      this.movingMap = true;
    });

    this.leafletMapObj.on('moveend', () => {
      this.saveMapZoomAndPosition();
    });

    this.leafletMapObj.on('click', (clickEvent: L.LeafletMouseEvent) => {
      if (null != this.layerClickManager) {
        this.layerClickManager.click(clickEvent);
      }
    });

    this.subscriptions.push(

      this.zoomSource.subscribe((val: number) => {
        if (val !== null) {
          this.leafletMapObj.setZoom(val);
          this.initialZoom = val;
        }
      }),

      this.latLngSource.subscribe((val: [number, number]) => {
        if (val !== null) {
          this.leafletMapObj.setView(L.latLng(val), this.initialZoom);
        }
      }),

      this.layersService.baseLayerChangeSourceObs.subscribe((layer: BaseLayerOption | null) => {
        if (null != layer) {
          this.updateBasemap(layer);
        }
      }),

      this.mapInteractionService.overlayPane.subscribe((createOverlayPane: boolean) => {
        if (null != createOverlayPane) {
          if (createOverlayPane === true) {
            this.showPaneById('overlayPane');
          } else {
            this.hidePaneById('overlayPane');
          }
        }
      })
    );

    this.leafletMapObj.invalidateSize();

    this.layers = this.getLayersOrdered();

    // prune layerOrder in localStorage
    setTimeout(() => {
      this.layersService.pruneLayersOrderStorage(this.layers);
    }, 2000);

  }

  /**
   * The function getElement() returns the native element of the current component.
   * @returns The `getElement()` method is returning an `HTMLElement`.
   */
  public getElement(): HTMLElement {
    return this.elRef.nativeElement;
  }


  /**
   * The function "watchLayers" returns an Observable that emits an array of MapLayer objects whenever
   * there is a change in the layers.
   * @returns The method is returning an Observable of an array of MapLayer objects.
   */
  public watchLayers(): Observable<Array<MapLayer>> {
    return this.layersChangeSource.asObservable();
  }

  /**
   * The function "getLayers" returns a copy of the "layers" array.
   * @returns An array of MapLayer objects.
   */
  public getLayers(): Array<MapLayer> {
    return this.layers.slice();
  }

  /**
   * The function `getLayersOrdered` returns an array of `MapLayer` objects sorted based on their zIndex
   * values retrieved from a layers service.
   * @returns an array of MapLayer objects.
   */
  public getLayersOrdered(): Array<MapLayer> {
    const layers = this.layersService.getLayersOrderStorage();
    return this.getLayers().sort((a: MapLayer, b: MapLayer) => {

      const zIndexA = layers.get(a.id);
      const zIndexB = layers.get(b.id);

      if (zIndexA !== undefined && zIndexB !== undefined) {
        return (zIndexA < zIndexB) ? 1 :
          ((zIndexB < zIndexA) ? -1 : 0);
      }
      return 0;
    });
  }

  /**
   * The addControl function adds a control to a map component and sets the map component for the control
   * if it has a setMapComponent function.
   * @param control - The `control` parameter is of type `L.Control`, which is a control object that can
   * be added to a Leaflet map.
   * @returns The method `addControl` returns `this`, which refers to the current instance of the class.
   */
  public addControl(control: L.Control): this {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    if (typeof control['setMapComponent'] === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/dot-notation
      control['setMapComponent'](this);
    }
    control.addTo(this.leafletMapObj);
    return this;
  }

  /**
   * The function `getMapExtent` returns the bounding box of a Leaflet map object.
   * @returns a BoundingBox object.
   */
  public getMapExtent(): BoundingBox {
    const bounds = this.leafletMapObj.getBounds();
    const mapExtent = new BoundingBox(
      Math.min(bounds.getNorth(), 90),
      bounds.getEast(),
      Math.max(bounds.getSouth(), -90),
      bounds.getWest()
    );
    return mapExtent;
  }

  /**
   * The function returns the Leaflet map object.
   * @returns The `getLeafletObject` method is returning an object of type `L.Map`.
   */
  public getLeafletObject(): L.Map {
    return this.leafletMapObj;
  }

  // ****START LAYER MANIPULATION */

  /**
   * The function "addLayers" takes an array of MapLayer objects and adds each layer to the map.
   * @param layers - An array of MapLayer objects.
   */
  public addLayers(layers: Array<MapLayer>): void {
    layers.forEach((layer: MapLayer) => {
      this.addLayer(layer);
    });
  }

  /**
   * The addLayer function adds a MapLayer to the redraw queue and starts the redraw processing.
   * @param {MapLayer} layer - The parameter `layer` is of type `MapLayer`.
   * @returns The method is returning the instance of the class that the method is being called on.
   */
  public addLayer(layer: MapLayer): this {
    this.getRedrawQueue(layer.id).push(layer);
    this.tryStartRedrawProcessing(layer.id);
    return this;
  }

  /**
   * The function removes a layer from a map and performs some additional actions.
   * @param {string} layerId - The layerId parameter is a string that represents the unique identifier of
   * a layer.
   * @returns The method is returning the instance of the class that it belongs to.
   */
  public removeLayerById(layerId: string): this {
    this.getRedrawQueue(layerId).push(layerId);
    this.tryStartRedrawProcessing(layerId);
    this.closePopup();
    this.layersService.setLayerOrder(layerId, undefined);
    this.removePaneById(layerId);
    return this;
  }

  /**
   * The function removes a pane from a Leaflet map by setting its z-index to the top.
   * @param {string} paneId - The `paneId` parameter is a string that represents the ID of the pane you
   * want to remove.
   * @returns The method is returning the instance of the class (`this`) to allow for method chaining.
   */
  public removePaneById(paneId: string): this {
    const pane = this.leafletMapObj.getPane(paneId);
    if (pane !== undefined) {
      pane!.style.zIndex = Style.ZINDEX_TOP;
    }
    return this;
  }

  /**
   * The function hides a pane on a Leaflet map by setting its display style to 'none'.
   * @param {string} paneId - The `paneId` parameter is a string that represents the ID of the pane you
   * want to hide.
   * @returns The method is returning the current instance of the class.
   */
  public hidePaneById(paneId: string): this {
    const pane = this.leafletMapObj.getPane(paneId);
    if (pane !== undefined) {
      pane.style.display = 'none';
    }
    return this;
  }

  /**
   * The function `showPaneById` displays a pane on a Leaflet map based on its ID.
   * @param {string} paneId - The `paneId` parameter is a string that represents the ID of the pane you
   * want to show.
   * @returns The method is returning the current instance of the class (this).
   */
  public showPaneById(paneId: string): this {
    const pane = this.leafletMapObj.getPane(paneId);

    if (pane !== undefined) {
      pane.style.display = '';
    }
    return this;
  }

  // redraw (or just add or remove) a layer
  public redrawLayer(layer: MapLayer | string): Promise<void> {
    const layerId = (typeof layer === 'string') ? layer : layer.id;
    const layerToAdd = (typeof layer === 'string') ? null : layer;

    this.triggerLayerLoader();
    // in case that layer has changed (same id) get a ref of current one
    const layerToRemove = this.layers.find((thisLayer: MapLayer) => thisLayer.id === layerId);
    return ((layerToRemove == null)
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
        resolve(layerToRemove.removeSelfFromMap());
      })
    ).then(() => {
      // update layers
      const currentIndex = this.layers.findIndex((thisLayer: MapLayer) => thisLayer.id === layerId);
      // adding
      if (null != layerToAdd) {
        // new
        if (currentIndex === -1) {
          this.layers.push(layerToAdd);
        } else { // If replace, put back in the same place
          // Check if style params set on new layer and if not, copy across from old.
          if (layerToAdd.options.customLayerOptionOpacity.get() == null) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            layerToAdd.options.customLayerOptionOpacity.set(layerToRemove!.options.customLayerOptionOpacity.get());
          }
          this.layers.splice(currentIndex, 1, layerToAdd);
        }
      } else if (currentIndex > -1) { // just remove
        this.layers.splice(currentIndex, 1);
      }

      return ((null == layerToAdd)
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
          resolve(layerToAdd.addSelfToMap(this));
        })
      )
        .then(() => {
          // order layer on map
          this.orderLayerOnMap();
          this.broadcastLayerChange();
          this.triggerLayerLoader(true);
        });
    });
  }

  public fitBounds(bounds: L.LatLngBoundsExpression, options?: L.FitBoundsOptions): this {
    this.leafletMapObj.fitBounds(bounds, options);
    return this;
  }

  public moveView(
    lat: number,
    lon: number,
    method = MoveMethod.PAN,
    zoom = 10,
    latOffset = 0.0, // used to offset map so that popup is visible on point view
    lonOffset = 0.0, // used to offset map so that popup is visible on point view
  ): this {
    this.reallyMoveView(lat, lon, method, zoom, latOffset, lonOffset);
    // do it again to make sure it happened
    setTimeout(() => {
      this.reallyMoveView(lat, lon, method, zoom, latOffset, lonOffset);
    }, 400);
    return this;
  }

  public resized(): void {
    if (this.leafletMapObj) {
      setTimeout(() => {
        this.leafletMapObj.invalidateSize(false);
      }, 0);
    }
  }

  public closePopup(): void {
    if (this.leafletMapObj) {
      this.leafletMapObj.closePopup();
    }
  }

  public getMapSize(): { widthPx: number; heightPx: number } {
    return {
      widthPx: this.leafletMapObj.getSize().x,
      heightPx: this.leafletMapObj.getSize().y,
    };
  }

  public enableLayerClickManager(manager?: LayerClickManager): this {
    manager = (null == manager) ? new LayerClickManager(this.injector) : manager;
    manager.init(this.leafletMapObj, this.http, this);
    this.layerClickManager = manager;
    return this;
  }
  public disableLayerClickManager(): this {
    this.layerClickManager = null;
    return this;
  }
  public getLayerClickManager(): null | LayerClickManager {
    return this.layerClickManager;
  }

  public openLayerControl(): void {
    this.layerControlOpened.next(true);
  }

  public closeLayerControl(): void {
    this.layerControlOpened.next(false);

    // change custom marker icon color
    this.leafletMapObj.getContainer()!.querySelector('#custom-layer-control')!.classList.remove('control-expanded');
  }

  public selectRowOnTablePanel(id: string, feature: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.panelsEvent.selectRowOnTablePanel(id, feature);
  }

  public clearRowOnTablePanel(): void {
    this.panelsEvent.clearRowOnTablePanel();
  }

  public moveToPoint(x: number, y: number): void {
    const centerPoint = this.leafletMapObj.getSize().divideBy(2);
    const targetPoint = centerPoint.subtract([x, y]);
    const targetLatLng = this.leafletMapObj.containerPointToLatLng(targetPoint);
    this.leafletMapObj.panTo(targetLatLng);
  }


  /**
   * The function `moveMapEventPoint` adjusts the position of a map based on a pointer event's
   * y-coordinate and specified deltas.
   * @param {Event} event - The `event` parameter is of type `Event`, but it is cast to `PointerEvent`
   * within the function using TypeScript syntax.
   * @param [deltaCheckPy=0] - The `deltaCheckPy` parameter is used to adjust the y-coordinate of the
   * event pointer by a specified amount before calculating the final position.
   * @param [deltaPy=100] - The `deltaPy` parameter is used to determine the amount by which the `py`
   * value is adjusted in the `moveMapEventPoint` function. It is added to or subtracted from the `py`
   * value based on the value of `checkSecondHalf`.
   * @param [checkSecondHalf=false] - The `checkSecondHalf` parameter is a boolean flag that determines
   * whether to add or subtract `deltaPy` from the calculated `extraPy` value. If `checkSecondHalf` is
   * `true`, `deltaPy` will be added to `py`, otherwise it will be subtracted.
   */
  public moveMapEventPoint(event: Event, deltaCheckPy = 0, deltaPy = 100, checkSecondHalf = false): void {
    const wh = window.innerHeight;
    const py = (event as PointerEvent).y + deltaCheckPy;
    const extraPy = checkSecondHalf ? py + deltaPy : py - deltaPy;

    this.moveToPoint(0, wh / 2 - extraPy);
  }

  /**
   * This function sets the z-index style property of each layer in a Leaflet map based on its Stylable
   * object's z-index value.
   */
  public orderLayerOnMap(): void {

    const layers = this.layersService.getLayersOrderStorage();

    this.layers.forEach((layer: MapLayer) => {

      // get zIndex setted on localStorage
      const zIndex = layers.get(layer.id);

      // set zIndex on map pane
      const pane = this.leafletMapObj.getPane(layer.id);
      if (zIndex !== undefined && pane !== undefined) {
        pane!.style.zIndex = zIndex;
      }
    });

  }

  /**
   * This function ensures that a pane exists in a Leaflet map and sets its z-index.
   * @param {string} paneId - A string representing the ID of the pane that needs to be ensured to
   * exist.
   */
  public ensurePaneExists(paneId: string): void {
    let zIndex: string | undefined = Style.ZINDEX_TOP;
    const map = this.getLeafletObject();

    // get zIndex from localStorage if zIndex undefined => set max parsing map
    let zIndexLayer = this.layersService.getLayerOrderById(paneId);
    if (zIndexLayer === undefined) {
      // found greatest ZIndex on map pane list
      const panes = Object.values(map.getPanes());
      panes.forEach((paneElem: HTMLElement) => {
        const zIndexVal = paneElem.style.getPropertyValue('z-index');
        if (zIndexVal !== '' && Number(zIndexVal) > Number(zIndex)) {
          zIndex = String(zIndexVal);
        }
      });
      if (zIndex === undefined) {
        zIndex = Style.ZINDEX_TOP;
      }
      zIndex = String(Number(zIndex) + 1);
      zIndexLayer = zIndex;

      // set zIndex on localStorage
      this.layersService.setLayerOrder(paneId, zIndexLayer);
    }

    // set zIndex to map
    const pane = map.getPane(paneId);
    if (pane == null) {
      const newPane = map.createPane(paneId);
      newPane.style.zIndex = zIndexLayer;
    } else {
      pane.style.zIndex = zIndexLayer;
    }
  }

  public getLocalStoragePersister(): LocalStoragePersister {
    return this.localStoragePersister;
  }

  protected broadcastLayerChange(): void {
    this.layersService.layersChange(this.getLayersOrdered());
  }

  protected getRedrawQueue(layerId: string): Array<MapLayer | string> {
    if (!this.layerRedrawQueues.has(layerId)) {
      this.layerRedrawQueues.set(layerId, []);
    }
    return this.layerRedrawQueues.get(layerId)!;
  }

  // recursive function for synchronously processing layerId redraw queues
  protected redrawNextLayer(layerId: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const queue = this.getRedrawQueue(layerId);
      let redrawItem: undefined | string | MapLayer;
      while (queue.length > 0) { redrawItem = queue.shift(); }
      if (null != redrawItem) {
        resolve(
          this.redrawLayer(redrawItem)
            .then(() => this.redrawNextLayer(layerId))
        );
      } else {
        // all done
        resolve();
      }
    });
  }

  protected tryStartRedrawProcessing(layerId: string): void {
    // only kick it off if it's not already running
    if (!this.redrawQueueProcessing.get(layerId)) {
      this.redrawQueueProcessing.set(layerId, true);
      void this.redrawNextLayer(layerId)
        .then(() => {
          this.redrawQueueProcessing.delete(layerId);
        });
    }
  }

  protected postLayerManipulationNormalization(layersRedrawn: boolean): void {
    if (Array.from(this.redrawQueueProcessing.values()).length === 0) {

      if (layersRedrawn) {
      }

    }
  }

  protected removeLayerMonitor(
    watchable: Watchable<MapLayer, unknown>,
    subscriptionMap: Map<string, Subscription>,
  ): void {
    const layerId = watchable.context().id;
    const currentSubscription = subscriptionMap.get(layerId);
    if (currentSubscription != null) {
      currentSubscription.unsubscribe();
    }
    subscriptionMap.delete(layerId);
  }
  protected addLayerMonitor(
    watchable: Watchable<MapLayer, unknown>,
    subscriptionMap: Map<string, Subscription>,
    observerFunction: () => void,
  ): void {
    const layerId = watchable.context().id;
    this.removeLayerMonitor(watchable, subscriptionMap);
    subscriptionMap.set(layerId, watchable.watch().subscribe(observerFunction));
  }

  // loader is delayed from showing straight away
  protected triggerLayerLoader(end = false): void {
    const date = moment();
    if (end) {
      this.loadingLayerCount--;
      if (this.loadingLayerCount < 1) {
        this.loadingLayerCount = 0;
        clearTimeout(this.loaderCheckInterval);

        // Hide the loading spinner and emit the event to the observer
        this.showLoading(false);
      }
    } else {
      this.loadingLayerCount++;
      if (this.loadingLayerCount === 1) {
        this.loaderCheckInterval = setInterval(() => {
          if (
            !this.showLoader
            && (this.loadingLayerCount > 0)
            && (moment(date).add(this.LOADER_DELAY_MS, 'ms') < moment())
          ) {
            clearTimeout(this.loaderCheckInterval);

            // Show the loading spinner and emit the event to the observer
            this.showLoading(true);
          }
        }, this.LOADER_DELAY_MS / 2);
      }
    }
  }

  protected requestLayerOrderChange(id: string, toFront: boolean): void {
    this.layerOrderChangeQueue.push([id, toFront]);

    // let all the calls be done before processing.
    clearTimeout(this.layersOrderTimer);
    this.layersOrderTimer = setTimeout(() => {
    }, 300);
  }

  protected reallyMoveView(
    lat: number,
    lon: number,
    method: MoveMethod,
    zoom = 10,
    latOffset: number, // used to offset map so that popup is visible on point view
    lonOffset: number, // used to offset map so that popup is visible on point view
  ): void {

    // offset so that popup is visible
    const targetLoc = new L.LatLng(
      lat - latOffset,
      lon + lonOffset,
    );

    const options = {
      animate: true,
    };
    if (method === MoveMethod.ZOOM) {
      this.leafletMapObj.setView(targetLoc, zoom, options);
    } else if (method === MoveMethod.FLY) {
      this.leafletMapObj.flyTo(targetLoc, zoom, options);
    } else {
      this.leafletMapObj.panTo(targetLoc, options);
    }
  }

  protected updateBasemap(option: BaseLayerOption): void {
    const newLayers = option.getLayers().slice();
    // remove old base layers
    this.layers.forEach((layer: MapLayer) => {
      if (layer instanceof EsriBaseLayer) {
        this.removeLayerById(layer.id);
      }
    });
    // add newly selected layers
    newLayers.forEach((layer: MapLayer, index: number) => {
      this.addLayer(layer);
    });
  }

  private getMapElement(): HTMLElement {
    return this.mapElement.nativeElement;
  }

  private fitMap(): void {
    // ensure map is not way up or down
    const bounds = this.leafletMapObj.getBounds();
    if (bounds.getNorth() > 89) {
      this.leafletMapObj.fitBounds([
        [bounds.getSouth(), bounds.getWest()],
        [80, bounds.getEast()],
      ]);
    } else if (bounds.getSouth() < -89) {
      this.leafletMapObj.fitBounds([
        [-80, bounds.getWest()],
        [bounds.getNorth(), bounds.getEast()],
      ]);
    }
  }

  private saveMapZoomAndPosition(): void {
    if (this.movingMap) {
      setTimeout(() => {
        // save zoom on configurables localStorage
        this.localStoragePersister.set(
          LocalStorageVariables.LS_CONFIGURABLES,
          this.leafletMapObj.getZoom().toString(),
          false,
          LocalStorageVariables.LS_MAP_ZOOM
        );
      }, 500);

      this.fitMap();

      this.movingMap = false;

      // save latlng on configurables localStorage
      this.localStoragePersister.set(
        LocalStorageVariables.LS_CONFIGURABLES,
        JSON.stringify(this.leafletMapObj.getCenter()),
        false,
        LocalStorageVariables.LS_MAP_POSITION
      );
    }
  }

  /**
   * The function `showLoading` sets the value of the `showLoader` property and emits the value to the
   * observer.
   * @param show - The `show` parameter is a boolean flag that determines whether the loading spinner
   * should be displayed.
   */
  private showLoading(show: boolean): void {
    this.showLoader = show;
    this.loaderService.showLoading(show);
  }

}
