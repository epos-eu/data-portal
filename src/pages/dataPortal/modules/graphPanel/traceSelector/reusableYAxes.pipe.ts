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
import { Pipe, PipeTransform } from '@angular/core';
import { Trace } from '../objects/trace';
import { YAxis } from '../objects/yAxis';

@Pipe({
  name: 'reusableYAxes',
})
export class ReusableYAxesPipe implements PipeTransform {
  transform(
    selectedTraces: Record<string, Trace>,
    trace: Trace,
  ): Array<YAxis> {
    return this.getReusableYAxes(trace, selectedTraces);
  }

  /** Returns any current {@link YAxis} objects that can be re-used by the passed in {@link Trace}. */
  private getReusableYAxes(trace: Trace, selectedTraces: Record<string, Trace>): Array<YAxis> {
    const axes = ((null == selectedTraces) || (null == trace))
      ? new Array<YAxis>()
      : Object.values(selectedTraces).map((thisTrace: Trace) => {
        return ((null != thisTrace.yAxis) && (trace.yUnit === thisTrace.yAxis.unit))
          ? thisTrace.yAxis
          : null;
      })
        .filter(yAxis => (null != yAxis)) // filter nulls
        .filter((yAxis: YAxis, index: number, array: Array<YAxis>) => {
          // filter to make unique
          return (array.indexOf(yAxis) === index);
        });
    return axes as Array<YAxis>;
  }
}
