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
import Mime from 'mime/Mime';

export class DistributionFormatType {

  // type WEB_SERVICE
  public static readonly APP_GEOJSON = 'application/geo+json';
  public static readonly APP_EPOS_GEOJSON = 'application/epos.geo+json';
  public static readonly APP_EPOS_TABLE_GEOJSON = 'application/epos.table.geo+json';
  public static readonly APP_EPOS_MAP_GEOJSON = 'application/epos.map.geo+json';
  public static readonly APP_OGC_WMS = 'application/vnd.ogc.wms_xml';
  public static readonly APP_OGC_WMTS = 'application/vnd.ogc.wmts_xml';
  public static readonly APP_COV_JSON = 'covjson';

  // download formats so already data-search downloadable by way of type DOWNLOADABLE_FILE
  // public static readonly ZIP = 'zip';

  private static formats = new Map<string, unknown>();

  private static mappableFormats = [
    DistributionFormatType.APP_GEOJSON,
    DistributionFormatType.APP_EPOS_GEOJSON,
    DistributionFormatType.APP_OGC_WMS,
    DistributionFormatType.APP_OGC_WMTS,
    DistributionFormatType.APP_EPOS_MAP_GEOJSON,
    DistributionFormatType.APP_COV_JSON,
    // ...
  ];
  private static graphableFormats = [
    DistributionFormatType.APP_COV_JSON,
    // ...
  ];

  private static tabularableFormats = [
    DistributionFormatType.APP_EPOS_GEOJSON,
    DistributionFormatType.APP_EPOS_TABLE_GEOJSON,
  ];

  private static nonDownloadableFormats = [
    DistributionFormatType.APP_OGC_WMS,
    DistributionFormatType.APP_OGC_WMTS
  ];

  public static isMappable(format: string): boolean {
    return this.in(format, this.mappableFormats);
  }

  public static isGraphable(format: string): boolean {
    return this.in(format, this.graphableFormats);
  }

  public static isDownloadable(format: string): boolean {
    return !this.in(format, this.nonDownloadableFormats);
  }

  public static isTabularable(format: string): boolean {
    return this.in(format, this.tabularableFormats);
  }

  public static in(test: string, source: Array<string>): boolean {
    return (source.findIndex((item: string) => this.is(test, item)) > -1);
  }
  public static is(test: string, item: string): boolean {
    test = (test == null) ? '' : test;
    item = (item == null) ? '' : item;
    // starts with item string
    // escape regex special and / chars
    // TODO: review regex as eslint suggests a backslash isn't needed.  This may be correct, or may point to a different failure
    // eslint-disable-next-line no-useless-escape
    const regex = item.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    return RegExp(`^${regex}`, 'i').test(test);
  }

  public static getEposMime(): Mime {
    const mimeMap = new Map<string, [string]>();
    // add types to file ext mappings here
    mimeMap.set(DistributionFormatType.APP_EPOS_GEOJSON, ['json']);

    // convert to mime objects
    const mimeObj = {};
    mimeMap.forEach((values, key) => {
      mimeObj[key] = values;
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return new Mime(mimeObj);
  }

}
