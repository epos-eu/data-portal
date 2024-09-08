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
import { Component, Injector } from '@angular/core';
import {
  MapLayer,
  BoundingBox as EposLeafletBoundingBox,
  EposLeafletComponent,
  DrawBBoxControl,
  SearchControl,
  CustomLayerControl,
  MoveMethod,
  FeatureDisplayItem,
} from 'utility/eposLeaflet/eposLeaflet';
import { OnAttachDetach } from 'decorators/onAttachDetach.decorator';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MapLayerGenerator } from 'utility/maplayers/mapLayerGenerator';

import * as L from 'leaflet';
import 'leaflet-mouse-position';
import { SimpleBoundingBox } from 'api/webApi/data/impl/simpleBoundingBox';
import { DataConfigurable } from 'utility/configurables/dataConfigurable.abstract';
import { BoundingBox } from 'api/webApi/data/boundingBox.interface';
import { Style } from 'utility/styler/style';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { DataConfigurableI } from 'utility/configurables/dataConfigurableI.interface';
import { MapInteractionService } from '../../../../utility/eposLeaflet/services/mapInteraction.service';
import { LayersService } from 'utility/eposLeaflet/services/layers.service';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { GeoJSONMapLayer } from 'utility/maplayers/geoJSONMapLayer';
import { Stylable } from 'utility/styler/stylable.interface';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';
import { GeoJSONImageOverlayMapLayer } from 'utility/maplayers/geoJSONImageOverlayMapLayer';
import { GeoJSONHelper } from 'utility/maplayers/geoJSONHelper';
import { Feature } from 'geojson';
import { PopupProperty } from 'utility/maplayers/popupProperty';
import { CONTEXT_RESOURCE } from 'api/api.service.factory';
import { DataSearchConfigurablesServiceResource } from '../dataPanel/services/dataSearchConfigurables.service';

@OnAttachDetach('onAttachComponents')
@Unsubscriber('subscriptions')
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent {

  public eposLeaflet: EposLeafletComponent;
  public bboxControl = new DrawBBoxControl(false);
  public crs = L.CRS.EPSG3857;
  public initialLatLng: [number, number];
  public initialZoom: number;
  public currentDataConfigurables = new Array<DataConfigurableI>();
  public currentDataConfigurablesStyleSubs = new Map<string, Subscription>();
  public currentIdToMapLayerIdMap = new Map<string, Array<string>>();
  public previousCoverageLayerIdsString = '';

  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  private readonly mapLayerGenerator: MapLayerGenerator;

  private readonly defaultEditBboxStyle = { color: '#007c41', weight: 3, opacity: 1, fillOpacity: 0.2, enable: true };
  private readonly defaultBboxStyle = { color: '#3388ff', fillColor: '#3388ff', weight: 3, opacity: 1, fillOpacity: 0.2, enable: true };
  private readonly defaultBboxStyleSecond = { color: '#ffff00', fillColor: '#ffff00', weight: 3, opacity: 1, fillOpacity: 0.2, enable: true };

  private bboxContext: string | null = null;

  constructor(
    private injector: Injector,
    private readonly configurables: DataSearchConfigurablesServiceResource,
    private readonly mapInteractionService: MapInteractionService,
    private readonly layersService: LayersService,
    private readonly panelsEvent: PanelsEmitterService,
    private readonly localStoragePersister: LocalStoragePersister,
  ) {
    this.mapLayerGenerator = MapLayerGenerator.make(injector);
    this.initialLatLng = MapInteractionService.initialLatLng;
    this.initialZoom = MapInteractionService.initialZoom;
  }

  public onAttach(): void {
    if (this.eposLeaflet) {
      this.eposLeaflet.resized();
    }
  }

  public leafletMapObjReady(eposLeaflet: EposLeafletComponent): void {
    this.eposLeaflet = eposLeaflet
      .addControl(L.control.mousePosition({ emptyString: 'Position' }).setPosition('topright'))
      .addControl(new SearchControl(false).setPosition('topright'))
      .addControl(this.bboxControl.setPosition('topright'))
      .addControl(L.control.zoom().setPosition('topright'))
      .addControl(new CustomLayerControl(this.injector).setPosition('topright'))
      .addControl(L.control.scale({ metric: true, imperial: false, maxWidth: 200 }).setPosition('bottomright'))
      .enableLayerClickManager();

    const baseLayerFromStorage = this.layersService.getBaseLayerFromStorage();
    this.eposLeaflet.addLayers(baseLayerFromStorage.getLayers());
    this.initSubscriptions();
  }

  public refreshMapLayersOnStyleChange(dataConfigurable: DataConfigurable): void {
    this.eposLeaflet.getLayers().forEach((mapLayer: MapLayer) => {
      if (mapLayer.id.startsWith(dataConfigurable.id)) {
        this.addLayer(mapLayer);
      }
    });
  }

  /**
   * The function `configurablesExecute` manages a list of data configurables by adding, removing, and
   * updating items based on certain conditions.
   * @param dataConfigurables - The `dataConfigurables` parameter is an array of objects that implement
   * the `DataConfigurableI` interface. These objects represent configurable data items with properties
   * such as `id`, `isMappable`, and `context`.
   * @param {string} context - The `context` parameter in the `configurablesExecute` function is a
   * string that is used to set the context for the data configurables. It is passed as an argument to
   * the function and is used to filter and manipulate the data configurables based on their context.
   */
  private configurablesExecute(dataConfigurables: Array<DataConfigurableI>, context: string) {

    // set context. TODO: move it on dataConfigurables creation logic
    dataConfigurables.map(conf => {
      conf.context = context;
    });

    // select only mappable configs
    const mappableConfigurables = dataConfigurables.filter((thisConfig: DataConfigurableI) => thisConfig.isMappable);

    // add items who are not in the current list
    const configsToAdd = mappableConfigurables.filter((thisConfig: DataConfigurableI) => {
      // find id in current configs
      const currentItem = this.currentDataConfigurables.find((testConfig: DataConfigurableI) => {
        return (testConfig === thisConfig && testConfig.context === context);
      });
      return (currentItem == null);
    });

    configsToAdd.forEach((thisConfig: DataConfigurable) => {
      this.addConfigDisplayItem(thisConfig);
    });

    // remove items who are not in the new list
    const configsToRemove = this.currentDataConfigurables.filter((thisConfig: DataConfigurableI) => {
      // find id in current configs
      const thisItem = (mappableConfigurables.find((testConfig: DataConfigurableI) => {
        return (testConfig.id === thisConfig.id && thisConfig.context === context);
      }));
      return (thisItem == null);
    });

    if (configsToRemove.length > 0) {
      this.removeConfigDisplayItems(configsToRemove, context);
    }

    const newDataArray = this.currentDataConfigurables.filter((conf) => {
      return conf.context !== context;
    });

    this.currentDataConfigurables = [...newDataArray, ...mappableConfigurables];

  }

  private initSubscriptions(): void {

    let previousBbox: EposLeafletBoundingBox;

    this.subscriptions.push(

      this.configurables.watchAll().subscribe((dataConfigurables: Array<DataConfigurableI>) => {
        if (dataConfigurables != null) {
          this.configurablesExecute(dataConfigurables, CONTEXT_RESOURCE);
        }
      }),

      this.mapInteractionService.bboxContext.observable.subscribe((context: string | null) => {
        if (context !== null) {
          this.bboxContext = context;
        }
      }),

      this.mapInteractionService.centerMapBBox.observable.subscribe((bbox: BoundingBox) => {
        if (bbox.isBounded()) {
          this.eposLeaflet.leafletMapObj.fitBounds(
            [[bbox.getMinLat(), bbox.getMinLon()], [bbox.getMaxLat(), bbox.getMaxLon()]],
            { padding: [300, 300], maxZoom: 5 });
        }
      }),

      this.mapInteractionService.startBBox.observable.subscribe((val: boolean) => {
        if (val) {
          this.bboxControl.startDraw();
          this.eposLeaflet.showPaneById('overlayPane');
        } else {
          this.bboxControl.stopDraw();
        }
      })
      ,
      this.bboxControl.watchBoundingBox().subscribe((newBounds: EposLeafletBoundingBox) => {

        if (this.bboxContext !== null) {
          newBounds.setId(this.bboxContext);

          // only if changed
          if (previousBbox !== newBounds) {
            previousBbox = newBounds;
            const newBox = this.normalizeBbox(newBounds);
            this.mapInteractionService.mapBBox.set(newBox);
          }
        }
      }),

      this.mapInteractionService.spatialRange.observable.subscribe((bbox: BoundingBox) => {

        void this.localStoragePersister.get(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_BBOX_STYLE).then((styleMapString: string) => {

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const styleMap = styleMapString !== null ? new Map(Object.entries(JSON.parse(styleMapString))) : new Map();
          let style = JSON.stringify(this.defaultBboxStyle) as string;

          if (styleMap.has(bbox.getId() + MapLayer.BBOX_LAYER_ID)) {
            style = JSON.stringify(styleMap.get(bbox.getId() + MapLayer.BBOX_LAYER_ID));
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          this.addBox(bbox, MapLayer.BBOX_LAYER_ID, JSON.parse(style));

          // hide overlayPane (leaflet interactive)
          this.eposLeaflet.hidePaneById('overlayPane');
          const overlayPanes = document.getElementsByClassName('leaflet-overlay-pane') as HTMLCollection;
          Array.from(overlayPanes).forEach((overlayPane: HTMLElement) => {
            const leafletInteractives = overlayPane.getElementsByClassName('leaflet-interactive');
            Array.from(leafletInteractives).forEach((_v: HTMLElement) => {
              _v.outerHTML = '';
            });
          });
        });
      }),

      /* Editing spatial bounding box. */
      this.mapInteractionService.editableSpatialRange.observable.subscribe((bbox: BoundingBox) => {
        this.addBox(bbox, MapLayer.BBOX_EDITABLE_LAYER_ID, this.defaultEditBboxStyle);
      }),

      this.layersService.layerChangeSourceObs.subscribe((layer: MapLayer) => {
        if (layer !== null) {

          // problem with imageOverlay suffix
          const realId = layer.id.replace(GeoJSONHelper.IMAGE_OVERLAY_ID_SUFFIX, '');

          const conf = this.configurables.get(realId);

          if (conf !== null) {
            const style = conf.getStyle();
            if (style !== null) {

              if (layer.options.customLayerOptionZIndex.get() !== null) {
                style.setZIndex(layer.options.customLayerOptionZIndex.get()!);
              }

              if (layer.options.customLayerOptionOpacity.get() !== null) {
                style.setOpacityColor1(layer.options.customLayerOptionOpacity.get()!);
              }

              if (layer.options.customLayerOptionColor.get() !== null) {
                style.setColor1(layer.options.customLayerOptionColor.get()!.substring(1));
              }

              if (layer.options.customLayerOptionFillColorOpacity.get() !== null) {
                style.setOpacityColor2(layer.options.customLayerOptionFillColorOpacity.get()!);
              }

              if (layer.options.customLayerOptionFillColor.get() !== null) {
                style.setColor2(layer.options.customLayerOptionFillColor.get()!.substring(1));
              }

              if (layer.options.customLayerOptionMarkerValue.get() !== null) {
                style.setMarkerValue(layer.options.customLayerOptionMarkerValue.get()!);
              }

              if (layer.options.customLayerOptionMarkerIconSize.get() !== null) {
                style.setMarkerIconSize(layer.options.customLayerOptionMarkerIconSize.get()!);
              }

              if (layer.options.customLayerOptionWeight.get() !== null) {
                style.setWeight(layer.options.customLayerOptionWeight.get()!);
              }

              if (layer.options.customLayerOptionClustering.get() !== null) {
                style.setClustering(layer.options.customLayerOptionClustering.get()!);
              }

              this.configurables.updateStyle(realId, style);

              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              const dataSearchToggleOnMap: Array<string> = JSON.parse(this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_TOGGLE_ON_MAP) as string || '[]');

              this.mapInteractionService.hideMarkerOnMap(layer, dataSearchToggleOnMap, false);
            }
          }
        }

      }),

      // if click on right sidenav bottom => close custom marker component
      this.panelsEvent.invokeTablePanel.subscribe(() => {
        this.eposLeaflet.closeLayerControl();
      }),

      // if custom marker component opened => close table data component
      this.eposLeaflet.layerControlOpened.subscribe((value: boolean) => {
        if (value === true) {
          this.panelsEvent.invokeTablePanelClose.emit();
        }
      }),

      // show or hide info on map (marker, image overlay, point, multiline...)
      this.mapInteractionService.featureOnlayerToggle.subscribe((featureOnLayer: Map<string, Array<number> | string | boolean>) => {
        const show = featureOnLayer.get('show');
        const propertyId = featureOnLayer.get('propertyId');
        const imageOverlay = featureOnLayer.get('imageOverlay');
        let layerId = featureOnLayer.get('layerId') as string;
        if (imageOverlay) {
          layerId += GeoJSONHelper.IMAGE_OVERLAY_ID_SUFFIX;
        }

        this.eposLeaflet.getLeafletObject().eachLayer((_l: MyLayer) => {

          if (_l !== undefined) {
            const options = _l.options;
            let elementOnMap: HTMLElement | undefined;

            if (options.pane === layerId) {

              // if propertyId on layer feature
              if (_l.feature !== undefined) {
                const feature: Feature = _l.feature;
                const properties = feature.properties;
                if (properties !== null) {
                  if (properties[PopupProperty.PROPERTY_ID] === propertyId) {
                    // eslint-disable-next-line no-underscore-dangle
                    elementOnMap = _l._path;
                  }
                }

              } else {

                // if propertyId on layer options
                if (options[PopupProperty.PROPERTY_ID] === propertyId) {

                  // eslint-disable-next-line no-underscore-dangle
                  elementOnMap = _l._icon;
                  if (elementOnMap === undefined) {
                    // eslint-disable-next-line no-underscore-dangle
                    elementOnMap = _l._image;
                  }
                  if (elementOnMap === undefined) {
                    // eslint-disable-next-line no-underscore-dangle
                    elementOnMap = _l._path;
                  }
                }
              }

              if (elementOnMap !== undefined) {
                if (show === false) {
                  elementOnMap.style.setProperty('display', 'none');
                } else {
                  elementOnMap.style.removeProperty('display');
                }
              }
            }
          }
        });
      }),

      this.mapInteractionService.pointOnlayerTriggered.subscribe((pointOnLayer: Map<string, Array<number> | string>) => {

        const coordinates = pointOnLayer.get('coordinates');
        let layerId = pointOnLayer.get('layerId');
        const propertyId = pointOnLayer.get('propertyId');
        const imageOverlay = pointOnLayer.get('imageOverlay');
        const layerClickManager = this.eposLeaflet.getLayerClickManager();
        let lat = 0;
        let lng = 0;

        if (coordinates !== undefined && typeof layerId === 'string') {

          if (imageOverlay) {
            layerId += GeoJSONHelper.IMAGE_OVERLAY_ID_SUFFIX;
          }

          const layer = this.eposLeaflet.getLayers().find((l: MapLayer) => { return l.id === layerId; }) as GeoJSONMapLayer;

          if (layer !== undefined) {

            if (typeof coordinates[0] !== 'number') {
              lat = coordinates[0][1] as unknown as number;
              lng = coordinates[0][0] as unknown as number;
            } else {
              lat = coordinates[1] as unknown as number;
              lng = coordinates[0];
            }

            // move view with latitude offset
            const latOffset = -240 * Math.pow(0.5, this.eposLeaflet.getLeafletObject().getZoom()); // -240 * (1/2)^x
            this.eposLeaflet.moveView(lat, lng, MoveMethod.PAN, 10, latOffset, 0);

            // generate popup for feature propertyId
            layerClickManager?.displayFeatures(
              layer.getFeatureDisplayItemById(propertyId, layer.name) as Promise<Array<FeatureDisplayItem>>,
              [lat, lng]
            );
          }
        }
      }),
    );

  }

  private getBboxLatLngs(bbox: BoundingBox): Array<L.LatLng> {

    if (bbox.getMaxLon() < bbox.getMinLon() && bbox.getMaxLon() < 0) {
      // bbox on antimeridian
      return [
        L.latLng(bbox.getMaxLat(), bbox.getMinLon()),
        L.latLng(bbox.getMaxLat(), bbox.getMaxLon() + 360),
        L.latLng(bbox.getMinLat(), bbox.getMaxLon() + 360),
        L.latLng(bbox.getMinLat(), bbox.getMinLon())
      ];
    } else {
      return [
        L.latLng(bbox.getMaxLat(), bbox.getMinLon()),
        L.latLng(bbox.getMaxLat(), bbox.getMaxLon()),
        L.latLng(bbox.getMinLat(), bbox.getMaxLon()),
        L.latLng(bbox.getMinLat(), bbox.getMinLon())
      ];
    }
  }

  private addBox(bbox: BoundingBox, type: string, style: Record<string, unknown>): void {

    let id = type;

    if (bbox.getId() !== undefined) {
      id = bbox.getId() + type;
    }

    // prevent remove type layer
    this.eposLeaflet.removeLayerById(type);

    if (!bbox.isBounded()) {
      this.eposLeaflet.removeLayerById(id);
    } else {
      const latlngs = this.getBboxLatLngs(bbox);
      const geo = L.polygon(latlngs).toGeoJSON();

      if (style.color === null) {
        style = this.defaultBboxStyle;
      }

      const styleClass = new Style(style.color as string ?? '#3388ff');
      styleClass.setOpacityColor1(style.opacity as number);
      styleClass.setWeight(style.weight as number);
      styleClass.setEnable(style.enable as boolean);
      styleClass.setId(id);
      const stylable = new BboxStyle();
      stylable.setStyle(styleClass);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const layer = new GeoJSONMapLayer(this.injector, id, id, stylable, () => new Promise((resolve) => {
        resolve(geo);
      }), this.eposLeaflet)
        .toggleable.set(true)
        .setGeoJsonData(geo)
        .setStylingFunction(() => style)
        .visibleOnLayerControl.set(true);

      layer.name = 'Data Spatial Filter';

      layer.options.customLayerOptionOpacity.set(style.opacity as number);
      layer.options.customLayerOptionMarkerType.set(MapLayer.MARKERTYPE_POLYGON);
      layer.options.customLayerOptionStylable.set(stylable);
      layer.options.customLayerOptionColor.set(style.color as string);
      layer.options.customLayerOptionFillColor.set(style.fillColor as string);
      layer.options.customLayerOptionFillColorOpacity.set(style.fillOpacity as number);
      layer.options.customLayerOptionWeight.set(style.weight as number);
      layer.options.customLayerOptionEnable.set(style.enable as boolean);

      this.addLayer(
        layer
      );
    }
  }

  private normalizeBbox(bbox: EposLeafletBoundingBox): BoundingBox {
    // ensure between -180 and +180
    const convertFunc = (num: number) => ((((num + 180) % 360) + 360) % 360) - 180;
    const roundFunc = (num: number, precDP = 5) => Math.round(num * Math.pow(10, precDP)) / Math.pow(10, precDP);

    if (this.bboxContext !== null) {
      bbox.setId(this.bboxContext);
    }

    return (!bbox.isBounded())
      ? SimpleBoundingBox.makeUnbounded()
      : new SimpleBoundingBox(
        roundFunc(bbox.getMaxLat()),
        roundFunc(convertFunc(bbox.getMaxLon())),
        roundFunc(bbox.getMinLat()),
        roundFunc(convertFunc(bbox.getMinLon())),
      );
  }


  private removeConfigDisplayItems(dataConfigurables: Array<DataConfigurableI>, context: string): void {
    dataConfigurables.forEach((dataConfigurable: DataConfigurable) => {
      const mapLayerIds = this.currentIdToMapLayerIdMap.get(dataConfigurable.id);
      if (null != mapLayerIds && dataConfigurable.context === context) {
        mapLayerIds.forEach((id: string) => {
          this.eposLeaflet.removeLayerById(id);
        });

        this.removeConfigurableStyleSubscription(dataConfigurable.id);
        this.currentIdToMapLayerIdMap.delete(dataConfigurable.id);
      }
    });
  }

  private addLayer(mapLayer: MapLayer): void {
    // manually remove the legend so that it's regenerated
    // otherwise epos-leaflet map will re-use the cached legend (if available)
    this.eposLeaflet.addLayer(mapLayer);
  }


  private addConfigDisplayItem(dataConfigurable: DataConfigurable): void {

    // create map layer
    const mapLayers: Array<MapLayer> = this.mapLayerGenerator.createMapLayersFromConfigurable(dataConfigurable, this.eposLeaflet);

    // remove previous subscription
    this.removeConfigurableStyleSubscription(dataConfigurable.id);
    // add new subscription, which will add maplayer immediately
    let previousStyle = dataConfigurable.getStyle();
    this.currentDataConfigurablesStyleSubs.set(
      dataConfigurable.id,
      dataConfigurable.styleObs.subscribe((newStyle: Style) => {
        if ((newStyle != null) && (newStyle !== previousStyle)) {
          previousStyle = newStyle;
          this.refreshMapLayersOnStyleChange(dataConfigurable);
        }
      })
    );
    const mapLayerIds = new Array<string>();
    mapLayers.forEach((mapLayer: MapLayer) => {
      if (mapLayer instanceof GeoJSONImageOverlayMapLayer) {
        // remove geo image layer if empty
        mapLayer.setPostLayerAddFunction(() => {
          if ((mapLayer).isEmpty()) {
            this.eposLeaflet.removeLayerById(mapLayer.id);
          }
          return Promise.resolve();
        });
      }
      this.addLayer(mapLayer);
      mapLayerIds.push(mapLayer.id);
    });

    this.currentIdToMapLayerIdMap.set(dataConfigurable.id, mapLayerIds);
  }


  private removeConfigurableStyleSubscription(id: string): void {
    if (this.currentDataConfigurablesStyleSubs.has(id)) {
      this.currentDataConfigurablesStyleSubs.get(id)!.unsubscribe();
      this.currentDataConfigurablesStyleSubs.delete(id);
    }
  }
}

class BboxStyle implements Stylable {

  private readonly styleSrc = new BehaviorSubject<null | Style>(null);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly styleObs = this.styleSrc.asObservable();

  public setStyle(style: null | Style): void {
    this.styleSrc.next(style);
  }

  public getStyle(): null | Style {
    return this.styleSrc.value;
  }

}

interface MyLayer extends L.Layer {
  feature: Feature;
  _path: HTMLElement;
  _icon: HTMLElement;
  _image: HTMLElement;
}
