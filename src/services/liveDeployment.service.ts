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
import { environment } from 'environments/environment';

/**
 * This service knows whether this is the live deployment
 * and may run scripts based on this info.
 */
@Injectable()
export class LiveDeploymentService {

  /**
   * The function returns a boolean value indicating whether the application is in a live deployment
   * environment.
   * @returns The method `getIsLiveDeployment()` is returning the value of `environment.production`,
   * which is a boolean value indicating whether the code is running in a production environment.
   */
  public getIsLiveDeployment(): boolean {
    return environment.production;
  }

}
