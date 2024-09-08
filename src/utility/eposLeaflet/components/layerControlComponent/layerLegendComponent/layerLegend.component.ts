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
import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MapLayer } from '../../layers/mapLayer.abstract';
import { Legend, LegendItem } from '../../controls/public_api';
import { Subscription } from 'rxjs';
import { GeoJSONMapLayer } from 'utility/maplayers/geoJSONMapLayer';
import { LayersService } from 'utility/eposLeaflet/services/layers.service';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { MapInteractionService } from 'utility/eposLeaflet/services/mapInteraction.service';
import { GeoJSONHelper } from 'utility/maplayers/geoJSONHelper';

@Unsubscriber('subscriptions')
@Component({
  selector: 'app-layer-legend',
  templateUrl: './layerLegend.component.html',
  styleUrls: ['./layerLegend.component.scss']
})
export class LayerLegendComponent implements OnInit {

  /** The `@Input() showLabel = true;` is a decorator in TypeScript that marks the `showLabel` property as
  an input property. This means that the value of `showLabel` can be passed into the component from
  its parent component. */
  @Input() showLabel = true;

  /** The `@Input() showImage = true;` is a decorator in TypeScript that marks the `showImage` property as
  an input property. This means that the value of `showImage` can be passed into the component from
  its parent component. By default, the value of `showImage` is set to `true`, indicating that the
  component should display the image in the legend. However, if the parent component sets the value of
  `showImage` to `false`, the component will not display the image in the legend. */
  @Input() showImage = true;

  /** The `@ViewChild('legendContent') legendContent: ElementRef;` is a decorator in TypeScript that
  allows the component to access a child component or element in the template. In this case, it is
  used to get a reference to the `legendContent` element in the template, which is defined using the
  `#legendContent` template reference variable. The `ElementRef` type is used to access properties and
  methods of the DOM element. */
  @ViewChild('legendContent') legendContent: ElementRef;

  /** The line `protected subscriptions: Array<Subscription> = new Array<Subscription>();` is declaring a
  protected property called `subscriptions` of type `Array<Subscription>`. It is initializing this
  property with a new empty array of `Subscription` objects. This property is used to store
  subscriptions to observables, which can be unsubscribed from later to prevent memory leaks. */
  protected subscriptions: Array<Subscription> = new Array<Subscription>();

  /** The line `private _layer: MapLayer;` is declaring a private property called `_layer` of type
  `MapLayer`. This property is used to store the map layer that is passed into the component as an
  input. It can be accessed and used within the component to perform operations or retrieve
  information related to the map layer. */
  private _layer: MapLayer;

  /**
   * The constructor function initializes the private variables http, renderer, and layersService.
   * @param {HttpClient} http - The `http` parameter is an instance of the `HttpClient` class, which is
   * used to send HTTP requests and receive HTTP responses in Angular applications.
   * @param {Renderer2} renderer - The `renderer` parameter is an instance of the `Renderer2` class.
   * The `Renderer2` class is a service provided by Angular that allows you to manipulate the DOM in a
   * way that is safe and efficient, regardless of the platform or environment. It provides methods for
   * creating, updating, and
   * @param {LayersService} layersService - The `layersService` parameter is an instance of the
   * `LayersService` class. It is used to interact with the layers in the application, such as adding
   * or removing layers, updating layer properties, etc.
   */
  constructor(
    private http: HttpClient,
    private renderer: Renderer2,
    private layersService: LayersService,
    private localStoragePersister: LocalStoragePersister,
    private mapInteractionService: MapInteractionService,) {
  }

  /** The `@Input() set layer(layer: MapLayer)` is a setter method for the `layer` input property. It is
  used to set the value of the `layer` property when it is passed into the component from its parent
  component. */
  @Input() set layer(layer: MapLayer) {
    this.getLegendContent(layer);
    this._layer = layer;
  }

  /**
   * The ngOnInit function subscribes to changes in the layersService's layerChangeSourceObs and calls
   * the updateLegendContent function.
   */
  ngOnInit(): void {
    this.subscriptions.push(
      this.layersService.layerChangeSourceObs.subscribe((layer: MapLayer) => {
        this.updateLegendContent();
      }),

      this.mapInteractionService.featureOnlayerToggle.subscribe((featureOnLayer: Map<string, Array<number> | string | boolean>) => {
        const imageOverlay = featureOnLayer.get('imageOverlay');
        let layerId = featureOnLayer.get('layerId') as string;

        if (imageOverlay) {
          layerId += GeoJSONHelper.IMAGE_OVERLAY_ID_SUFFIX;

          if (layerId === this._layer.id) {
            this.getLegendContent(this._layer);
          }
        }
      }),

    );
  }

  /**
   * The `getLegendContent` function retrieves legend data for a map layer and appends it to the DOM,
   * or displays a default image if no legend data is available.
   * @param {MapLayer} layer - The `layer` parameter is of type `MapLayer`.
   */
  private getLegendContent(layer: MapLayer): void {

    setTimeout(() => {

      (this.legendContent.nativeElement as HTMLElement).innerHTML = '';

      if (!(layer.options.get('paneType') !== 'geoJsonPane' && this.showImage === false)) {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const dataSearchToggleOnMap: Array<string> = JSON.parse(this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_TOGGLE_ON_MAP) as string || '[]');

        void layer.getLegendData(this.http).then((legendArray: Array<Legend>) => {
          if (legendArray !== null) {

            legendArray.forEach((legend: Legend) => {
              (this.legendContent.nativeElement as HTMLElement).appendChild(legend.createDisplayContent(dataSearchToggleOnMap));
            });
          }
        });
      } else if (this.showImage === false) {

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('legend-details-grid');
        contentDiv.classList.add('nice-scrollbar');

        const contentRowDiv = document.createElement('div');
        contentRowDiv.classList.add('legend-details-row');

        const span = document.createElement('span');
        span.classList.add('legend-icon');

        const spanicon = document.createElement('span');
        spanicon.classList.add('material-icons');
        spanicon.innerHTML = 'image';

        span.appendChild(spanicon);
        contentRowDiv.appendChild(span);

        contentDiv.appendChild(contentRowDiv);

        (this.legendContent.nativeElement as HTMLElement).appendChild(contentDiv);


      }
    }, 100);

  }

  /**
   * The function `updateLegendContent` updates the legend content based on the style options of a
   * GeoJSONMapLayer.
   */
  private updateLegendContent(): void {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    if (typeof this._layer['getStylable'] === 'function') {
      const styleable = (this._layer as GeoJSONMapLayer).getStylable();

      if (styleable !== undefined) {
        const newstyle = styleable.getStyle();

        if (this._layer.options.customLayerOptionColor.get() !== null) {
          newstyle?.setColor1(this._layer.options.customLayerOptionColor.get()!.substring(1));
        }

        if (this._layer.options.customLayerOptionFillColor.get() !== null) {
          newstyle?.setColor2(this._layer.options.customLayerOptionFillColor.get()!.substring(1));
        }

        newstyle?.setOpacityColor1(this._layer.options.customLayerOptionOpacity.get() ?? 100);
        newstyle?.setOpacityColor2(this._layer.options.customLayerOptionFillColorOpacity.get() ?? 100);

        styleable.setStyle(newstyle);

        void (this._layer as GeoJSONMapLayer).updateLegend(styleable).then((legends: Array<Legend>) => {
          legends.forEach((legend: Legend) => {
            legend.legendItems.forEach((legendItem: LegendItem) => {
              if ((this.legendContent.nativeElement as HTMLElement).querySelector('span.legend-icon') !== null) {
                this.renderer.setProperty(
                  (this.legendContent.nativeElement as HTMLElement).querySelector('span.legend-icon'),
                  'innerHTML',
                  legendItem.getIconElement().innerHTML
                );
              }
            });
          });
        });
      }
    }
  }
}
