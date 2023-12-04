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
import { Domain } from 'api/webApi/data/domain.interface';
import { BehaviorSubject, Subject } from 'rxjs';
import { Model } from 'services/model/model.service';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';

/**
 * Service that is used to manage landing page..
 */
@Injectable()
export class LandingService {

  private showLandingSrc = new BehaviorSubject<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public showLandingObs = this.showLandingSrc.asObservable();

  private returnToLandingSrc = new Subject<void>();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public returnToLandingObs = this.returnToLandingSrc.asObservable();

  private activeDomainSrc = new Subject<string | boolean>();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public activeDomainSrcObs = this.activeDomainSrc.asObservable();

  constructor(
    private readonly model: Model,
    private readonly localStoragePersister: LocalStoragePersister,
  ) { }


  /**
   * The setDomain function sets the active domain based on the provided value and updates the landing
   * page accordingly.
   * @param {string | boolean} value - The `value` parameter can be either a string or a boolean.
   */
  public setDomain(value: string | boolean): void {
    if (typeof value === 'string') {
      const selectedDomain: Domain = { code: value, isSelected: true };
      this.model.domainMI.set(selectedDomain);
      this.setActiveDomain(value);
      this.localStoragePersister.set(
        LocalStorageVariables.LS_CONFIGURABLES,
        selectedDomain.code,
        false,
        LocalStorageVariables.LS_DOMAIN_OPEN
      );
    } else {
      this.localStoragePersister.set(
        LocalStorageVariables.LS_CONFIGURABLES,
        '',
        false,
        LocalStorageVariables.LS_DOMAIN_OPEN
      );
      this.setActiveDomain(false);
    }

    this.showLanding((value === false) ? true : false);
  }

  public setDomainDuringTour(value: string): void {
    if (value != null && value !== this.model.domainMI.get().code) {
      const selectedDomain: Domain = { code: value, isSelected: true };
      this.model.domainMI.set(selectedDomain);
    }
    this.showLanding((value === null) ? true : false);
  }

  public showLanding(showLanding: boolean): void {
    this.showLandingSrc.next(showLanding);
  }

  public getLandingStatus(): boolean {
    return this.showLandingSrc.value;
  }

  public returnToLanding(): void {
    this.returnToLandingSrc.next();
  }

  /**
   * The function `setActiveDomain` sets the value of `activeDomainSrc` to the provided value.
   * @param {string | boolean} value - The value parameter can be either a string or a boolean.
   */
  public setActiveDomain(value: string | boolean): void {
    this.activeDomainSrc.next(value);
  }

}
