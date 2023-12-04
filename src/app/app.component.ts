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
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Component, HostListener, OnInit } from '@angular/core';
import { ModelPrimer } from 'services/model/modelPrimer.service';
import { Event, NavigationEnd, Route, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RouteInfoService } from 'services/routeInfo.service';
import { AaaiService } from 'api/aaai.service';
import { LiveDeploymentService } from 'services/liveDeployment.service';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { DialogService } from 'components/dialog/dialog.service';
import { PoliciesService } from 'services/policiesService.service';
import { initHotjarFunc } from './initHotjar';
import { initMatomoFunc } from './initMatomo';
import { InformationsService } from 'services/informationsService.service';
import { TourService } from 'services/tour.service';
import { environment } from 'environments/environment';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { Model } from 'services/model/model.service';
import { BoundingBox } from 'utility/eposLeaflet/eposLeaflet';
import { SimpleTemporalRange } from 'api/webApi/data/impl/simpleTemporalRange';
import moment from 'moment-es6';

/**
 * This is the standard Angular root component that is included by the index.html file.
 *
 *
 * It contains any global html elements/angular components that need to be included as standard
 * throughout the app, like the {@link HeaderComponent}.
 *
 *
 * It uses a customized {@link AppRouterOutletDirective} rather than a standard router to handle
 * routing (page navigation), to ensure that the state of pages that have been navigated away from
 * are cached.
 *
 *
 * This is where user mouse interactions are trigger updates {@link AaaiService} to ensure an
 * "active" user isn't logged out prematurely.
 *
 *
 * This is also where the Matomo analytics and Hotjar user feedback plugins are initialised.
 *
 */
@Unsubscriber('subscriptions')
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public pageCssClass: '';
  public hideHeader = false;
  public mobile = false;
  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(
    private readonly aaaiService: AaaiService,
    private readonly routeInfo: RouteInfoService,
    private readonly router: Router,
    liveDeploymentService: LiveDeploymentService,
    private readonly modelPrimer: ModelPrimer, // REQUIRED - needs to be referenced somewhere to be instantiated immediately
    private dialogService: DialogService,
    private policiesService: PoliciesService,
    private informationService: InformationsService,
    private tourService: TourService,
    private readonly localStoragePersister: LocalStoragePersister,
    private readonly model: Model,
  ) {

    if ((window.location.href.indexOf('policy-index') < 0)
      && (!policiesService.hasConsents)) {
      void this.dialogService.openCookiesBanner();
    } else {
      this.checkMobile();
    }

    if (policiesService.cookiesEnabled) {
      initHotjarFunc();
      initMatomoFunc(liveDeploymentService);
    }

    this.subscriptions.push(
      this.routeInfo.watchCurrentRoute().subscribe((route: Route) => {
        this.pageCssClass = this.routeInfo.getDataValue('pageCssClass', '')!;
        this.hideHeader = this.routeInfo.getDataValue<boolean>('hideHeader', false)!;

        const lastDetailDialogId = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_LAST_DETAIL_DIALOG_ID);
        if (lastDetailDialogId !== null && (lastDetailDialogId as string).trim() !== '') {
          setTimeout(() => {
            void this.dialogService.openDetailsDialog(
              lastDetailDialogId as string
            );
          }, 500);
        }
      }),

      this.router.events.subscribe((event: Event) => {
        if (event instanceof NavigationEnd) {
          this.modelPrimer.setServicesAndTriggerInitialValues();
        }
      })
    );
  }

  /**
   * Detect user mouse interactions are trigger updates {@link AaaiService} to ensure an
   * "active" user isn't logged out prematurely.
   */
  @HostListener('window:mousemove', ['$event'])
  mousemove(event: MouseEvent): void {
    this.aaaiService.userInteracted();
  }
  @HostListener('window:touchstart', ['$event'])
  touchstart(event: MouseEvent): void {
    this.aaaiService.userInteracted();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: MouseEvent): void {
    this.checkMobile();
  }

  ngOnInit(): void {
    this.tourService.tourActiveObservable.subscribe((active: string) => {
      let value: string | null = active;
      if (active !== 'true' && active !== 'false') {
        value = 'false';
      }
      this.informationService.setEposTourActive(value);
    });

    const version = this.routeInfo.getDataValue('version', environment.version)! as string;
    const versionLocalStorage = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_VERSION);
    if (version !== versionLocalStorage) {
      this.localStoragePersister.set(LocalStorageVariables.LS_DATA_SEARCH_CONFIGURABLES, '[]');
      this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, '');
      this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, version, false, LocalStorageVariables.LS_VERSION);
      location.reload();
    }

    setTimeout(() => {
      this.setModelVariablesFromConfigurables();
    }, 500);

  }

  /**
   * It checks if the user is on a mobile device and if so, it opens a dialog box
   */
  private checkMobile(): void {

    this.mobile = (window.innerWidth < environment.minWidth) ? true : false;

    // show mobile disclaimer
    if (this.mobile) {
      if (this.policiesService.hasConsents) {
        void this.dialogService.openNoMobileDisclaimer();
        void this.dialogService.closeInformationBanner();
      }
    } else {
      void this.dialogService.closeNoMobileDisclaimer();
    }

  }

  private setModelVariablesFromConfigurables(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const bbox = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_DATA_SEARCH_BOUNDS);
    if (bbox !== null && Array.isArray(bbox)) {
      try {
        const maxLat = bbox[0] as unknown;
        const maxLon = bbox[1] as unknown;
        const minLat = bbox[2] as unknown;
        const minLon = bbox[3] as unknown;
        const bboxObj = new BoundingBox(maxLat as number, maxLon as number, minLat as number, minLon as number);
        this.model.dataSearchBounds.set(bboxObj, true);
      } catch (error) {
        console.warn(LocalStorageVariables.LS_DATA_SEARCH_BOUNDS, 'incorrect variable on local storage');
      }
    }

    const temporalRange = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_DATA_SEARCH_TEMPORAL_RANGE);
    if (temporalRange !== null && Array.isArray(temporalRange)) {
      const lower = temporalRange[0] ? moment(temporalRange[0] as moment.MomentInput) : null;
      const upper = temporalRange[1] ? moment(temporalRange[1] as moment.MomentInput) : null;
      if (lower && upper) {
        this.model.dataSearchTemporalRange.set(SimpleTemporalRange.makeBounded(lower, upper), true);
      } else if (lower == null && upper) {
        this.model.dataSearchTemporalRange.set(SimpleTemporalRange.makeWithoutLowerBound(upper), true);
      } else if (lower && upper == null) {
        this.model.dataSearchTemporalRange.set(SimpleTemporalRange.makeWithoutUpperBound(lower), true);
      }
    }

    const keywords = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_DATA_SEARCH_KEYWORDS);
    if (keywords && (keywords as Array<string>).length > 0) {
      this.model.dataSearchKeywords.set(keywords as Array<string>, true);
    }

    const facets = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_DATA_SEARCH_FACET_LEAF_ITEMS);
    if (facets && (facets as Array<string>).length > 0) {
      this.model.dataSearchFacetLeafItems.set(facets as Array<string>, true);
    }

    const typeData = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_DATA_SEARCH_TYPE_DATA);
    if (typeData && (typeData as Array<string>).length > 0) {
      this.model.dataSearchTypeData.set(typeData as Array<string>, true);
    }
  }
}
