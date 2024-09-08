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

import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { Legend } from '../controls/legendControl/legend';
import { TileLayer } from './tileLayer';
import { FeatureDisplayItemGenerator } from '../featureDisplay/featureDisplayItemGenerator';
import 'jquery';
import { MapLayer } from './mapLayer.abstract';
import { WmtsFeatureDisplayItemGenerator } from './wmtsFeatureDisplayItemGenerator';

export enum WMTSParameter {
  FORMAT = 'FORMAT',
  LAYER = 'LAYER',
  REQUEST = 'REQUEST',
  SERVICE = 'SERVICE',
  TILEMATRIX = 'TILEMATRIX',
  TILEMATRIXSET = 'TILEMATRIXSET',
  SRS = 'SRS',
  TILECOL = 'TILECOL',
  TILEROW = 'TILEROW',
  INFOFORMAT = 'INFOFORMAT',
  WIDTH = 'WIDTH',
  HEIGHT = 'HEIGHT',
}

export class WmtsTileLayer extends TileLayer {

  public static readonly WMTSParameters: Array<string> = [
    WMTSParameter.FORMAT,
    WMTSParameter.LAYER,
    WMTSParameter.REQUEST,
    WMTSParameter.SERVICE,
    WMTSParameter.TILEMATRIX,
    WMTSParameter.TILEMATRIXSET,
    WMTSParameter.SRS,
    WMTSParameter.TILECOL,
    WMTSParameter.TILEROW
  ];

  protected getCapabilitiesXML: JQuery<XMLDocument>;
  protected getCapabilitiesPromise: null | Promise<JQuery<XMLDocument>>;

  constructor(id: string, name?: string) {
    super(id, name);
    // Default options
    this.options.setOptions({
      format: 'image/png',
      transparent: true,
      pane: id,
    });

    this.setLegendCreatorFunction(this.createLegendsDefault.bind(this) as (layer: MapLayer, http: HttpClient) => Promise<null | Array<Legend>>);
  }

  public getLeafletLayer(): Promise<null | L.Layer> {
    return new Promise((resolve) => {
      try {
        // use copy
        const options = {
          ...this.options.getAll(),
        };

        const parameters = new Map<string, null | string>();
        // make any option alterations that are required
        const optionsCopy = {};
        Object.keys(options).forEach((key: string) => {
          switch (true) {
            // we don't want bbx being set by anything other than client
            case key.toLowerCase() === 'bbox':
              break;
            // remove extra custom options
            case key.startsWith('customLayerOption'):
              break;

            case WmtsTileLayer.WMTSParameters.includes(key.toUpperCase()):
              parameters.set(key.toUpperCase(), options[key] as string);
              break;
            default:
              optionsCopy[key] = options[key];
              break;
          }
        });

        const url =
          this.url +
          '?' +
          Array.from(parameters.keys())
            .filter((key) => null != parameters.get(key))
            .map((key) => `${key}=${parameters.get(key)}`)
            .join('&');

        return resolve(L.tileLayer(url, optionsCopy));
      } catch (e) {
        console.error('Layer not found');
        return resolve(null);
      }
    });
  }

  public setFeatureIdentifiable(itemGenerator?: FeatureDisplayItemGenerator): this {
    this.setLayerClickFeatureItemGenerator(itemGenerator ? itemGenerator : new WmtsFeatureDisplayItemGenerator(this));
    return this;
  }

  // TODO: these static funcs could do with being re-written in a class of their own
  // Used for getting layer/style elements from xml and tries without workspace in name too
  public getElementWithName(
    $srcXml: JQuery<JQuery.Node>,
    name: string,
    parentElementType: string,
  ): null | JQuery<Element> {
    name = name.trim();
    let $returnElement: null | JQuery<Element> = null;
    if (name.length > 0) {
      let $nameElement: JQuery<Element> = $srcXml.find(`${parentElementType}>Name:contains("${name}")`).first();
      // if not found try without workspace (part before ":" in "europe:SHEEC_1000_1899")
      if ($nameElement.length === 0) {
        // get part after colon
        const newName = name.split(':').pop();
        if (name !== newName) {
          $nameElement = $srcXml.find(`${parentElementType}>Name:contains("${newName}")`).first();
        }
      }
      $returnElement = $nameElement.length > 0 ? $nameElement.parent() : null;
    }
    return $returnElement;
  }

  /**
   * @returns promise of jQuery object of xml response
   */
  public refreshGetCapabilitiesXml(
    http: HttpClient,
    additionalParams = new Map<string, string>(),
  ): Promise<JQuery<XMLDocument>> {
    // set defaults
    const params = new Map<string, string>([
      ['SERVICE', 'WMTS'],
      ['REQUEST', 'GetCapabilities'],
    ]);
    // set any additional values (allows overriding)
    additionalParams.forEach((value: string, key: string) => {
      params.set(key, value);
    });

    const url =
      this.url +
      '?' +
      Array.from(params.keys())
        .filter((key) => null != params.get(key))
        .map((key) => `${key}=${params.get(key)}`)
        .join('&');

    this.getCapabilitiesPromise = http
      .get(url, { responseType: 'text' })
      .toPromise()
      .catch((error) => {
        throw error;
        // this.userNotificationService.sendErrorNotification('STOP', 2000);
      })
      .then((res: string) => {
        const xml = $.parseXML(res);
        this.getCapabilitiesXML = jQuery(xml);
        return this.getCapabilitiesXML;
      })
      .finally(() => {
        this.getCapabilitiesPromise = null;
      });
    return this.getCapabilitiesPromise;
  }

  public getCapabilitiesXml(http: HttpClient): Promise<JQuery<XMLDocument>> {
    switch (true) {
      case null != this.getCapabilitiesXML:
        return Promise.resolve(this.getCapabilitiesXML);
      case null != this.getCapabilitiesPromise:
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return this.getCapabilitiesPromise!;
      default:
        return this.refreshGetCapabilitiesXml(http);
    }
  }

  public createLegendsDefault(layer: WmtsTileLayer, http: HttpClient): Promise<null | Array<Legend>> {
    const layerNames = layer.options.get('layers') != null ? layer.options.get<string>('layers')!.split(',') : [];
    const styleNames = layer.options.get('styles') != null ? layer.options.get<string>('styles')!.split(',') : [];

    return Promise.resolve<null | Array<Legend>>(
      this.getCapabilitiesXml(http)
        .then(($xml: JQuery<XMLDocument>) => {
          const legends = new Array<Legend>();

          layerNames.forEach((layerName: string) => {
            const $layerElement = this.getElementWithName($xml, layerName, 'Layer');

            if (null != $layerElement) {
              const $styleElements = new Array<JQuery<Element>>();
              styleNames.forEach((styleName: string) => {
                const $styleElement = this.getElementWithName($layerElement, styleName, 'Style');
                if (null != $styleElement) {
                  $styleElements.push($styleElement);
                }
              });
              // if no matching style elements just get the first one
              if ($styleElements.length === 0) {
                $styleElements.push($layerElement.find('Style').first());
              }
              $styleElements.forEach(($styleElement) => {
                const $titleElement = $styleElement.find('Title').first();
                const $onlineResourceElement = $styleElement.find('OnlineResource').first();

                if ($onlineResourceElement.length > 0) {
                  let href = $onlineResourceElement.attr('xlink:href') || '';
                  if (href != null && href.trim().length > 0) {

                    // high quality image
                    href = href.concat('&scale=1&legend_options=fontAntiAliasing:true');

                    const name =
                      $titleElement.length === 0
                        ? layer.name
                        : `<span>${layer.name}</span><span class="multilayer-specific-name">${String(
                          $titleElement.html(),
                        )}</span>`;
                    legends.push(
                      new Legend(layer.id, name).setDisplayFunction(() => {
                        const img = document.createElement('img');
                        img.setAttribute('src', href);
                        return img;
                      }),
                    );
                  }
                }
              });
            }
          });
          return legends;
        })
        .catch((message) => {
          console.log('No WMTS legend found', message);
          return null;
        }),
    );
  }
}
