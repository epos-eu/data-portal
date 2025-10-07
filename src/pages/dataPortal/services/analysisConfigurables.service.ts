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

import { Environment } from 'api/webApi/data/environments/environment.interface';
import { BehaviorSubject } from 'rxjs';

export class AnalysisConfigurablesService {

  private triggerEnvironmentSelectionSrc = new BehaviorSubject<Environment | null>(null);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public triggerEnvironmentSelectionObs = this.triggerEnvironmentSelectionSrc.asObservable();

  public setEnvironmentSelection(environment: Environment | null): void {
    this.triggerEnvironmentSelectionSrc.next(environment);
  }
}
