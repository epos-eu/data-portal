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
import { BoundingBox } from '../boundingBox.interface';
import * as turf from '@turf/turf';
import { Feature, BBox } from '@turf/turf';

export class SimpleBoundingBox implements BoundingBox {

  private bounded: boolean;
  private maxLat: number;
  private maxLon: number;
  private minLat: number;
  private minLon: number;

  public constructor(
    maxLat: null | number,
    maxLon: null | number,
    minLat: null | number,
    minLon: null | number,
  ) {
    this.bounded = (
      (null != maxLat)
      && (null != maxLon)
      && (null != minLat)
      && (null != minLon)
    );

    if (this.bounded) {
      this.maxLat = maxLat!.valueOf();
      this.maxLon = maxLon!.valueOf();
      this.minLat = minLat!.valueOf();
      this.minLon = minLon!.valueOf();
    }
  }

  public static isDifferent(bbox1: BoundingBox, bbox2: BoundingBox): boolean {
    const bbox1Array = (bbox1 == null) ? [] : bbox1.asArray();
    const bbox2Array = (bbox2 == null) ? [] : bbox2.asArray();

    return (JSON.stringify(bbox1Array) !== (JSON.stringify(bbox2Array)));
  }

  public static makeFromArray(boundsArray: Array<unknown>): BoundingBox {
    return new SimpleBoundingBox(
      Number(boundsArray[0]).valueOf(),
      Number(boundsArray[1]).valueOf(),
      Number(boundsArray[2]).valueOf(),
      Number(boundsArray[3]).valueOf(),
    );
  }

  public static makeUnbounded(): BoundingBox {
    return new SimpleBoundingBox(null, null, null, null);
  }

  /**
   * Calculates the bbox of a feature and returns a bounding box
   */
  public static makeBBox(feature: Feature): BoundingBox {
    const bbox: BBox = turf.bbox(feature); // minX, minY maxX, maxY
    return new SimpleBoundingBox(bbox[3], bbox[2], bbox[1], bbox[0]);
  }

  // private toPrecision(value: number): number {
  //   return Math.round(value * Math.pow(10, this.PRECISION_DP)) / Math.pow(10, this.PRECISION_DP);
  // }

  getMaxLat(): number {
    return this.maxLat;
  }
  getMaxLon(): number {
    return this.maxLon;
  }
  getMinLat(): number {
    return this.minLat;
  }
  getMinLon(): number {
    return this.minLon;
  }
  isBounded(): boolean {
    return this.bounded;
  }
  asArray(): [number, number, number, number] {
    return [
      this.getMaxLat(),
      this.getMaxLon(),
      this.getMinLat(),
      this.getMinLon(),
    ];
  }
}
