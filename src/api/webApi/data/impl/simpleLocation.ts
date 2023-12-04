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
import { Point } from 'api/webApi/data/impl/simplePoint';
import { Located } from 'api/webApi/data/located.interface';


export class SimpleLocation implements Located {
  private readonly points: Array<Point> = [];

  constructor(points?: Array<Point>) {
    if (points != null) {
      this.points = points;
    }
  }

  public static createLocation(_lat: string, _long: string, _alt?: string): SimpleLocation {
    const lat = parseFloat(_lat);
    const long = parseFloat(_long);
    const alt = parseFloat(_alt);

    if (!isNaN(lat) && (!isNaN(long))) {
      if (!isNaN(alt)) {
        return new SimpleLocation([new Point(lat, long, alt)]);
      }
      return new SimpleLocation([new Point(lat, long)]);
    } else {
      return null;
    }
  }

  addPoint(point: Point): void {
    this.points.push(point);
  }

  getPoints(): Point[] {
    return this.points;
  }
}



