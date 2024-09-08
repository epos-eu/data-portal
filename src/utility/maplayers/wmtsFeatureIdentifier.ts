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
import { JsonFeatureIdentifier, WmtsFeatureDisplayItemGenerator, WmtsFeatureFormat, WmtsTileLayer } from 'utility/eposLeaflet/eposLeaflet';

/** The `WMTSFeatureIdentifier` class is a TypeScript class that extends `WmsFeatureDisplayItemGenerator`
and is used to identify and display features on a WMTS tile layer. */
export class WMTSFeatureIdentifier extends WmtsFeatureDisplayItemGenerator {

  /**
   * This constructor initializes a WmsFeatureInfoControl object with a WmtsTileLayer and sets up
   * various parameters and format handlers.
   * @param {WmtsTileLayer} layer - The `layer` parameter is of type `WmtsTileLayer`. It is a protected
   * property that is passed to the constructor.
   */
  constructor(
    protected layer: WmtsTileLayer,
  ) {
    super(layer);

    const featureCallParams = new Map<string, string>();

    const mapString = layer.options.get('MAP');
    if (null != mapString) {
      featureCallParams.set('MAP', String(mapString));
    }

    this.setFeatureCallParams(featureCallParams);

    const getParams = () => {
      if (null != this.selectedFormat) {
        this.featureCallParams.set('info_format', this.selectedFormat);
      }
      return this.featureCallParams;
    };

    const jsonFeatureGenerator = new JsonFeatureIdentifier(
      this.layer,
      (thisLayer: WmtsTileLayer, clickEvent) =>
        WmtsFeatureDisplayItemGenerator.createUrl(thisLayer, clickEvent, getParams),
    ).setResultDetailsExtractor(this.featurePropertiesToMap.bind(this) as (featureDetails: Record<string, unknown>) => Map<string, string>);

    this.setFormatHandler(WmtsFeatureFormat.GEO_JSON, jsonFeatureGenerator);
    this.setFormatHandler(WmtsFeatureFormat.JSON, jsonFeatureGenerator);

  }

  /**
   * The function `featurePropertiesToMap` takes a feature object and converts its properties into a
   * map, with special handling for the "covjson_url" property.
   * @param feature - The `feature` parameter is an object that represents a feature in a map layer. It
   * contains properties that describe the feature, such as its name, location, and other attributes.
   * @returns a Map object containing key-value pairs. The keys are strings representing the property
   * names of the input feature object, and the values are strings representing the display values of
   * those properties.
   */
  protected featurePropertiesToMap(feature: Record<string, unknown>): Map<string, string> {
    const layerId = this.layer.id;
    const responsePropertiesObj = feature.properties as Record<string, unknown>;
    const returnMap = new Map<string, string>();
    Object.keys(responsePropertiesObj).forEach((key: string) => {
      // default item display generator creates a vertical table from key-value pairs
      // and accepts html
      let displayValue = String(responsePropertiesObj[key]).toString().trim();

      // check covjson_url
      if (key === 'covjson_url') {

        // create Plot button
        key = 'Time series';
        displayValue = '<button id="timeseries_button" data-layerid="'
          + layerId +
          '" data-url="'
          + displayValue +
          '">View on graph</button>';
        returnMap.set(key, displayValue);
      } else {

        switch (true) {
          // turn urls into links
          case (displayValue.startsWith('http')):
            displayValue = `<a href="${displayValue}" target="_blank" rel="noopener noreferrer">${displayValue}</a>`;
            break;
        }
        returnMap.set(key, displayValue);
      }
    });
    return returnMap;
  }
}
