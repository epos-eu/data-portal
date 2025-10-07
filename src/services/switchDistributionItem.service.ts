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
import { LocalStoragePersister } from './model/persisters/localStoragePersister';
import { LocalStorageVariables } from './model/persisters/localStorageVariables.enum';


@Injectable({
    providedIn: 'root',
})
export class SwitchDistributionItemService{

    constructor(
        private localStoragePersister: LocalStoragePersister,
    ) { }

    /**
   * The function sets the value of the "noShowAgain" property and calls another function to store the
   * value in the localStorage.
   * @param {boolean} noShowAgain - A boolean value indicating whether the information check is allowed or
   * not.
   */
    public setNoShowAgain(noShowAgain: boolean): void {
        this.storeNoShowAgainCheck(noShowAgain);
    }

    public storeNoShowAgainCheck(noShowAgain: boolean): void {
        this.localStoragePersister.set(LocalStorageVariables.LS_SWITCH_DISTRIBUTION_ITEM_CHECK, (noShowAgain) ? 'true' : 'false', false);
    }

}
