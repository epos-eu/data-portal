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
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class TraceSelectorService {

  private traceSelectedSrc = new Subject<[string, string | null, boolean]>();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public traceSelectedObs = this.traceSelectedSrc.asObservable();

  /**
   * The function setTraceSelector updates the selection status of a trace for a specific layer.
   * @param {string} layerId - LayerId is a string parameter that represents the identifier of a
   * specific layer in the application.
   * @param {string} trace - The `trace` parameter in the `setTraceSelector` method is a string that
   * represents a specific trace or identifier within a layer. It is used to uniquely identify a trace
   * within the specified layer.
   * @param {boolean} selected - The `selected` parameter is a boolean value that indicates whether the
   * trace is selected or not. If `selected` is `true`, it means the trace is selected; if `selected`
   * is `false`, it means the trace is not selected.
   */
  public setTraceSelector(layerId: string, trace: string, selected: boolean): void {
    this.traceSelectedSrc.next([layerId, trace, selected]);
  }
}
