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
import { AfterContentInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomainInfo, domainLinks } from '../links';
import { Subscription } from 'rxjs';
import { Model } from 'services/model/model.service';
import { DiscoverResponse } from 'api/webApi/classes/discoverApi.interface';
import {
  BasicItem,
  ResultsPanelComponent,
} from '../resultsPanel/resultsPanel.component';
import { DataSearchConfigurablesService } from 'pages/dataPortal/services/dataSearchConfigurables.service';
import { LandingService } from 'pages/dataPortal/services/landing.service';
import { TourService } from 'services/tour.service';
import * as Driver from 'driver.js';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { ResultsPanelService } from 'pages/dataPortal/services/resultsPanel.service';

@Unsubscriber('subscriptions')
@Component({
  selector: 'app-landing-panel',
  templateUrl: './landingPanel.component.html',
  styleUrls: ['./landingPanel.component.scss'],
})
export class LandingPanelComponent implements OnInit, AfterContentInit {
  @ViewChild('blockResults') blockResults: ElementRef;
  @ViewChild(ResultsPanelComponent)
  private resultPanelComponent: ResultsPanelComponent;

  public readonly domainLinks = domainLinks;
  public showLanding = true;
  public activeDomainCode: string | boolean = false;
  public domainResultsCounter: Array<number> = [];
  public data: Array<BasicItem>;

  private readonly subscriptions: Array<Subscription> =
    new Array<Subscription>();

  constructor(
    private landingService: LandingService,
    private tourService: TourService,
    private readonly configurables: DataSearchConfigurablesService,
    private readonly model: Model,
    private readonly localStoragePersister: LocalStoragePersister,
    private readonly panelsEventEmitter: PanelsEmitterService,
    private readonly resultPanelService: ResultsPanelService
  ) {
  }

  ngOnInit(): void {
    this.addTCSWrapperStep();
    this.subscriptions.push(

      this.configurables.watchAll().subscribe(() => {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        this.domainResultsCounter['FAV'] =
          this.configurables.getAllPinned().length;
      }),

      this.landingService.activeDomainSrcObs.subscribe((activeDomain: string | boolean) => {
        this.activeDomainCode = activeDomain;
      }),

      this.panelsEventEmitter.invokeDataPanelToggle.subscribe(() => {
        if (this.blockResults !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          this.resultPanelService.setLandingPanelTopSrc((this.blockResults.nativeElement as HTMLElement).offsetTop.toString());
        }
      }),
    );

    setTimeout(() => {
      this.subscriptions.push(
        this.model.dataDiscoverResponse.valueObs.subscribe(
          (discoverResponse: DiscoverResponse) => {
            // domainResultsCounter
            this.domainLinks.forEach((element) => {
              if (element.code === 'ALL') {
                this.domainResultsCounter[element.code] = this.data?.filter(
                  (o) => o.hideToResult === false
                ).length;
              } else if (element.code === 'FAV') {
                this.domainResultsCounter[element.code] =
                  this.configurables.getAllPinned().length;
              } else {
                this.domainResultsCounter[element.code] = this.data?.filter(
                  (o) => o.code === element.code && o.hideToResult === false
                ).length;
              }
            });
          }
        )
      );
    });

    const activeDomainCode = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_DOMAIN_OPEN) as string | null ?? false;
    if (activeDomainCode !== false && activeDomainCode !== '') {
      this.landingService.showLanding(false);
      this.activeDomainCode = activeDomainCode;
      this.toggleDomain(activeDomainCode, false);
    }
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.subscriptions.push(
        this.landingService.showLandingObs.subscribe((showLanding: boolean) => {
          this.showLanding = showLanding;
        }),
      );
    });
  }

  public addTCSWrapperStep(): void {
    const tCSWrapperStepElement = document.getElementById('TCS-wrapper') as HTMLElement;
    const tourName = 'EPOS Overview';
    const options: Driver.PopoverOptions = {
      title: `<span class="tour-title"><strong>Tour:</strong> ${tourName}</span>Thematic Core Service (TCS)`,
      description: 'Services within the chosen thematic domain e.g. Seismology',
      position: 'right',
    };
    this.tourService.addStep(tourName, tCSWrapperStepElement, options, 7);
    this.subscriptions.push(
      this.tourService.tourStepEnterObservable.subscribe((value: ElementRef<HTMLElement>) => {
        if (value.nativeElement.id === 'TCS-wrapper') {
          this.landingService.setDomainDuringTour('SEI');
        }
      })
    );
  }

  /** retrieves list of Domain {@link DomainInfo} */
  public filterDomainLink(): DomainInfo[] {
    return this.domainLinks;
  }

  /** Set Domain selection
   * @param value Domain code.
   */
  public toggleDomain(value: string, checkForClose = true): void {
    if (this.domainResultsCounter[value] > 0) {

      // unselect last item
      this.configurables.setSelected(null, true);

      // reset pagination
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      void this.resultPanelComponent.resetPagination();

      if (checkForClose === false) {
        this.landingService.setDomain((value === undefined) ? false : value);
      } else {
        this.landingService.setDomain((value === undefined || value === this.activeDomainCode) ? false : value);
      }
    }
  }

  public getBasicItemList(event: BasicItem[]): void {
    this.data = event;
  }

  public favouritesEmpty(): boolean {
    return this.configurables.getAllPinned().length === 0;
  }
}
