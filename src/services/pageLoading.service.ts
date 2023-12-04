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
import { Observable } from 'rxjs';

/**
 * Service that is used to indicate whether the {@link PageLoadingComponent} should display
 * a loading symbol or not.  Used when the data needed to show the page is not yet ready.
 */
@Injectable()
export class PageLoadingService {
  loadingCount = 0;
  loadingCountSource = new Subject<boolean>();

  constructor() { }

  /**
   * Called to indicate the start of an operation that requires the display to be temporarily
   * hidden.
   */
  public setLoadingStart(): void {
    this.loadingCount++;
    this.evaluateLoading();
  }

  /**
   * Called to indicate the end of an operation that requires the display to be temporarily
   * hidden.
   */
  public setLoadingEnd(): void {
    if (--this.loadingCount < 0) {
      this.loadingCount = 0;
    }
    this.evaluateLoading();
  }

  /**
   * @return An rxjs/Observable that indicates whether to show/hide the loading indicator.
   */
  public watchLoading(): Observable<boolean> {
    return this.loadingCountSource.asObservable();
  }

  /**
   * Internal function for re-evaluating the need to show the loading indicator.
   * Will trigger hiding the loading indicator if all callers that have called
   * {@link setLoadingStart} have also called {@link setLoadingEnd}, otherwise the indicator
   * is shown.
   */
  private evaluateLoading(): void {
    this.loadingCountSource.next((this.loadingCount > 0));
  }

}
