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

/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { MatDialogState } from '@angular/material/dialog';
import { DialogService } from 'components/dialog/dialog.service';
import * as Driver from 'driver.js';
import { BehaviorSubject, Subject } from 'rxjs';
import { LocalStoragePersister } from './model/persisters/localStoragePersister';
import { TourFilterCache } from './model/persisters/tourFilterCache.enum';
import { LocalStorageVariables } from './model/persisters/localStorageVariables.enum';
import { PanelsEmitterService } from './panelsEventEmitter.service';
@Injectable()
export class TourService {
  tourDriver: Driver;
  tourSteps: Map<string, Map<number, Driver.Step>>;
  tourCurrentStep = 0;
  tourCurrentName: string;

  private readonly tourActive = new BehaviorSubject<string | null>(null);
  public tourActiveObservable = this.tourActive.asObservable();

  private readonly triggerDemoTemporalSelection = new EventEmitter<void>();
  public triggerDemoTemporalSelectionObservable = this.triggerDemoTemporalSelection.asObservable();

  private readonly triggerClearFilters = new EventEmitter<void>();
  public triggerClearFiltersObservable = this.triggerClearFilters.asObservable();

  private readonly triggerInformationDialogForTour = new EventEmitter<void>();
  public triggerInformationDialogForTourObservable = this.triggerInformationDialogForTour.asObservable();

  private readonly triggerRemoveAllFavorites = new EventEmitter<void>();
  public triggerRemoveAllFavoritesObservable = this.triggerRemoveAllFavorites.asObservable();

  private readonly triggerInfoIconStep = new EventEmitter<void>();
  public triggerInfoIconStepObservable = this.triggerInfoIconStep.asObservable();

  private readonly tourStepEnter = new Subject<ElementRef>();
  public tourStepEnterObservable = this.tourStepEnter.asObservable();

  private readonly tourStepBackward = new Subject<ElementRef>();
  public tourStepBackwardObservable = this.tourStepBackward.asObservable();

  private readonly tourStepForward = new Subject<ElementRef>();
  public tourStepForwardObservable = this.tourStepForward.asObservable();

  getScrollParent = (node: HTMLElement): HTMLElement => {
    if (null != node) {
      if (node.scrollHeight > node.clientHeight) {
        return node;
      } else {
        return this.getScrollParent(node.parentElement as HTMLElement);
      }
    } else {
      return node;
    }
  };

  constructor(
    private dialogsService: DialogService,
    private localStoragePersistor: LocalStoragePersister,
    private panelEventEmiterService: PanelsEmitterService,
  ) {
    this.tourSteps = new Map<string, Map<number, Driver.Step>>();
    this.tourDriver = new Driver({
      allowClose: false,
      keyboardControl: false,
      onHighlightStarted: (Element) => {
        const position = Element.getCalculatedPosition();
        const top = (position as unknown as Record<string, number>).top;

        const parent = this.getScrollParent(Element.getNode() as HTMLElement);
        if (parent) {
          const offset = parent.offsetTop;
          const height = Element.getSize().height;
          parent.scrollTo(0, top - offset - height);
        }
      },
      opacity: 0.32,
      onReset: () => {
        this.tourActive.next('false');
        if (this.tourSteps.has(this.tourCurrentName)) {
          this.triggerClearFiltersCall();
          this.restoreConfigurables();

          setTimeout(() => {
            this.restoreCachedDataSearchConfigurables();
          }, 1000);

        }
      },
      onNext: (element) => {
        // trigger the `tourForward` function in the tourDirective
        const highlightedElementRef: ElementRef = new ElementRef(element.getNode());
        this.tourStepForward.next(highlightedElementRef);
        this.tourCurrentStep++;
      },
      onPrevious: (element) => {
        // trigger the `tourBackward` function in the tourDirective
        const highlightedElementRef: ElementRef = new ElementRef(element.getNode());
        this.tourStepBackward.next(highlightedElementRef);
        this.tourCurrentStep--;
      },
      onHighlighted: (element) => {
        // trigger the `tourEnter` function in the tourDirective
        const highlightedElementRef: ElementRef = new ElementRef(element.getNode());
        this.tourStepEnter.next(highlightedElementRef);
        setTimeout(() => {
          this.triggerRefresh();
        }, 100);
        setTimeout(() => {
          this.triggerRefresh();
        }, 200);
        setTimeout(() => {
          this.triggerRefresh();
        }, 300);
      },
    });
  }

  public triggerDemoTemporalSelectionCall(): void {
    this.triggerDemoTemporalSelection.next();
  }

  public triggerClearFiltersCall(): void {
    this.triggerClearFilters.next();
  }

  public triggerInformationDialogForTourCall(): void {
    if (this.dialogsService.dialog.getDialogById('detailsDialog')?.getState() !== MatDialogState.OPEN) {
      this.triggerInformationDialogForTour.next();
    }
  }

  public triggerRemoveFavorites(): void {
    this.triggerRemoveAllFavorites.next();
  }

  private tourStepIsDefined(tourName: string, step: number) {
    return this.tourSteps.has(tourName) && this.tourSteps.get(tourName)!.has(step);
  }

  public triggerAddInfoIconStep(): void {
    this.triggerInfoIconStep.next();
  }

  public updateTourRunnerSteps(tourName: string): void {
    if (this.tourSteps.has(tourName)) {
      const stepMap = this.tourSteps.get(tourName);
      if (null != stepMap) {
        const stepArray = Array.from(stepMap);
        stepArray.sort((a, b) => {
          return a[0] - b[0];
        });
        const steps = stepArray.map((a) => {
          return a[1];
        });
        this.tourDriver.defineSteps(steps);
      }
    }
  }

  public startTour(tourName: string, event?: Event | null, stage?: number): void {
    const startStep = typeof stage !== 'undefined' ? stage : this.tourCurrentStep > 0 ? this.tourCurrentStep : 0;

    if (this.tourCurrentName !== tourName) {
      this.tourDriver.reset();
    }
    this.tourActive.next('true');
    this.tourCurrentName = tourName;
    this.tourCurrentStep = startStep;

    if (this.tourSteps.has(tourName)) {
      this.updateTourRunnerSteps(tourName);
      this.tourDriver.start(startStep);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    event ? event.stopPropagation() : null;
  }

  public addStep(
    tourName: string,
    element: string | HTMLElement | Node,
    popup: Driver.PopoverOptions,
    position: number,
    transparent = false,
  ): void {
    let stepMap = this.tourSteps.get(tourName);
    if (!stepMap) {
      stepMap = new Map<number, Driver.Step>();
    }

    // append the tour name to the popup title so we can display and style it
    // in the popup
    popup.title = `<span class="tour-title"><strong>Tour:</strong> ${tourName}</span>${popup.title}`;

    stepMap.set(position, {
      element: element,
      popover: popup,
      stageBackground: transparent ? 'transparent' : '#fff',
    });
    this.tourSteps.set(tourName, stepMap);

    if (this.tourActive.getValue() === 'true' && this.tourCurrentName === tourName) {
      // Does the 'current' step exist?
      if (this.tourStepIsDefined(tourName, this.tourCurrentStep)) {
        this.updateTourRunnerSteps(tourName);
        this.tourDriver.start(this.tourCurrentStep);
      }
    }
  }

  public startEposFiltersTour(evt: Event): void {

    // eventually open left panel
    this.panelEventEmiterService.dataPanelOpen();

    this.cacheFiltersAndFavourites();

    this.triggerClearFiltersCall();

    setTimeout(() => {
      this.startTour('EPOS Overview', evt, 0);
    }, 100);
  }

  public triggerRefresh(): void {
    /**
    * Force refresh of highlight layer
    */
    // eslint-disable-next-line @typescript-eslint/dot-notation
    this.tourDriver['overlay'].refresh();
  }

  private cacheFiltersAndFavourites(): void {

    // save on temp variable cache all configurables informations
    this.localStoragePersistor.get(LocalStorageVariables.LS_CONFIGURABLES).then((data) => {
      this.localStoragePersistor.set(TourFilterCache.CACHED_CONFIGURABLES, data);
    });

    // save on temp variabile cache dataSearchConfigurables informations
    this.localStoragePersistor.get(LocalStorageVariables.LS_DATA_SEARCH_CONFIGURABLES).then((data) => {
      this.localStoragePersistor.set(TourFilterCache.CACHED_DATA_SEARCH_CONFIGURABLES, data);
    });
  }

  /**
   * The function restores configurable data from local storage.
   */
  private restoreConfigurables(): void {
    this.localStoragePersistor.get(TourFilterCache.CACHED_CONFIGURABLES).then((data) => {
      this.localStoragePersistor.set(LocalStorageVariables.LS_CONFIGURABLES, data);
      this.localStoragePersistor.set(TourFilterCache.CACHED_CONFIGURABLES, '[]');
    });
  }

  /**
   * The function restores cached data for search configurables and reloads the page.
   */
  private restoreCachedDataSearchConfigurables(): void {
    this.localStoragePersistor.get(TourFilterCache.CACHED_DATA_SEARCH_CONFIGURABLES).then((data) => {
      this.localStoragePersistor.set(LocalStorageVariables.LS_DATA_SEARCH_CONFIGURABLES, data);
    }).finally(() => {
      this.localStoragePersistor.set(TourFilterCache.CACHED_DATA_SEARCH_CONFIGURABLES, '[]');
      location.reload();
    });
  }
}
