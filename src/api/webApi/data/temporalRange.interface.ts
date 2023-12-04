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
import { Moment, unitOfTime } from 'moment';

export interface TemporalRange {

  isUnbounded(): boolean;
  hasUpperBound(): boolean;
  hasLowerBound(): boolean;

  getLowerBound(): null | Moment;
  getUpperBound(): null | Moment;

  /**
   * Does this temporal range intersect with the specified one.
   * @param temporalRange
   * @param precision the level of granularity  e.g.  year month week isoWeek day hour minute second
   */
  intersects(temporalRange: TemporalRange, granularity?: unitOfTime.StartOf): boolean;

  toFormattedString(format: null | string): string;
  toFormattedStringExtra(config: { format: null | string; separator: null | string; undefinedStr: null | string }): string;
}
