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

@Injectable()
export class InformationsService {

  private infoCheck: boolean;
  private tourActive: string | null;

  constructor(private readonly localStoragePersister: LocalStoragePersister,) {
    this.infoCheck = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_INFO_CHECK) === 'true';
    this.tourActive = this.localStoragePersister.getValue(LocalStorageVariables.LS_TOUR_ACTIVE) as string;
  }

  public get infoEnabled(): boolean {
    return this.infoCheck;
  }

  public get tourIsActive(): string | null {
    return this.tourActive;
  }

  public storeInfoCheck(allow: boolean): void {
    this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, (allow) ? 'true' : 'false', false, LocalStorageVariables.LS_INFO_CHECK);
  }

  public setInfoCheck(allow: boolean): void {
    this.storeInfoCheck(allow);
    this.infoCheck = allow;
  }

  public setEposTourActive(active: string): void {
    this.saveTourActive(active);
    this.tourActive = active;
  }

  private saveTourActive(active: string): void {
    this.localStoragePersister.set(LocalStorageVariables.LS_TOUR_ACTIVE, active);
  }
}
