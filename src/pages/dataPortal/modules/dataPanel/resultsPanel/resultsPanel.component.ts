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
import { AfterContentInit, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DiscoverResponse } from 'api/webApi/classes/discoverApi.interface';
import { DistributionSummary } from 'api/webApi/data/distributionSummary.interface';
import { Facet } from 'api/webApi/data/facet.interface';
import { FacetModel } from 'api/webApi/data/facetModel.interface';
import { Domain } from 'api/webApi/data/domain.interface';
import { DataSearchConfigurablesService } from 'pages/dataPortal/services/dataSearchConfigurables.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Model } from 'services/model/model.service';
import { DialogService } from 'components/dialog/dialog.service';
import { DomainInfo, domainLinks } from '../links';
import { LoadingService } from 'services/loading.service';
import { DataConfigurableI } from 'utility/configurables/dataConfigurableI.interface';
import { DataConfigurable } from 'utility/configurables/dataConfigurable.abstract';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { ViewType } from 'api/webApi/data/viewType.enum';
import { DistributionLevel } from 'api/webApi/data/distributionLevel.interface';
import { ResultsPanelService } from 'pages/dataPortal/services/resultsPanel.service';
import { FacetFlatNode } from './facetDropdown/facetDropdown.component';
import { DataConfigurableDataSearchI } from 'utility/configurablesDataSearch/dataConfigurableDataSearchI.interface';
import { DataConfigurableDataSearchLoading } from 'utility/configurablesDataSearch/dataConfigurableDataSearchLoading';
import { DataConfigurableDataSearch } from 'utility/configurablesDataSearch/dataConfigurableDataSearch';
import { LandingService } from 'pages/dataPortal/services/landing.service';
import { TourService } from 'services/tour.service';
import * as Driver from 'driver.js';
import { UserNotificationService } from 'pages/dataPortal/services/userNotification.service';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { NotificationMessage, NotificationService } from 'services/notification.service';
import { DistributionNotificationText } from 'pages/dataPortal/enums/distributionNotification.enum';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';
import { MapService } from 'pages/dataPortal/modules/map/map.service';
import { DataConfigurationType } from 'utility/configurables/dataConfigurationType.enum';

@Unsubscriber('subscriptions')
@Component({
  selector: 'app-results-panel',
  templateUrl: './resultsPanel.component.html',
  styleUrls: ['./resultsPanel.component.scss'],
})
export class ResultsPanelComponent implements OnInit, AfterContentInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Output() basicItemList = new EventEmitter();

  public readonly VIEW_TYPE_ENUM = ViewType;
  public readonly DomainLinks = domainLinks;

  /* The above code is declaring a public variable named "selectedConfigurableSource" of type
  BehaviorSubject. This variable can hold either a null value or an object that implements the
  DataConfigurableI interface. The BehaviorSubject is a type of Observable that emits the most recent
  value to its subscribers and also has a method to retrieve the current value. */
  public selectedConfigurableSource = new BehaviorSubject<null | DataConfigurableI>(null);
  public parameterDialogFormType = new BehaviorSubject<DataConfigurationType>(DataConfigurationType.DATA);

  public dataSource: MatTableDataSource<BasicItem>;
  public columnsToDisplay = ['name'];
  public expandedElement: BasicItem | null;

  public rawTreeData: FacetModel<DistributionSummary> | null;
  public totalFacetsSelected = 0;

  public activeDomainData: DomainInfo | null;
  public domainResultsCounter: Array<number> = [];
  public showLoading = false;

  public facetExpansionHidden = true;

  public messageId: string;
  public messageText: string;
  public messageShow = false;
  public messageTitle = 'Service data informations';
  public messageType = UserNotificationService.TYPE_INFO;
  public messageCheckShowAgain = false;

  protected timeout: NodeJS.Timeout;
  protected favTimeout: NodeJS.Timeout;

  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();
  private data: Array<BasicItem>;
  private filteredFacetData: Array<BasicItem> = [];
  private activeDomain: Domain;
  private dataConfigurablesArraySource = new BehaviorSubject<null | Array<DataConfigurableI>>([]);

  private lastGoodSelectedConfigurableId: string;
  private serviceParent: HTMLTableElement;

  constructor(private readonly model: Model,
    private readonly configurables: DataSearchConfigurablesService,
    private readonly dialogService: DialogService,
    private readonly loadingService: LoadingService,
    private readonly landingService: LandingService,
    private readonly panelsEvent: PanelsEmitterService,
    private readonly resultPanelService: ResultsPanelService,
    private readonly tourService: TourService,
    private readonly mapService: MapService,
    private readonly localStoragePersister: LocalStoragePersister,
    private readonly notification: NotificationService,
  ) {
    this.expandedElement = null;
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(): void {
    this.configurables.setSelected(null, true);
  }

  ngOnInit(): void {
    this.subscriptions.push(

      this.landingService.showLandingObs.subscribe((landing: boolean) => {

        // if in landing page remove selected item
        if (landing) {
          this.configurables.setSelected(null, true);
        }
      }),

      this.configurables.watchAll().subscribe(() => {
        this.updateConfigs();
      }),

      // notification by data service
      this.notification.distributionNotificationObs.subscribe((message: NotificationMessage) => {
        if (message !== null) {
          this.formatNotificationMessage(message);
        }
      }),

      this.dataConfigurablesArraySource.subscribe((dataConfigurables: Array<DataConfigurable>) => {
        this.updateSelectedConfig();
      }),

      this.model.dataDiscoverResponse.valueObs.subscribe((discoverResponse: DiscoverResponse) => {

        let results: null | FacetModel<DistributionSummary> = null;
        if (discoverResponse != null) {
          results = discoverResponse.results();
        }

        this.activeDomain = this.model.domainMI.get();
        this.createItemsDisplay(results);
        this.rawTreeData = results;

        this.refresh(this.activeDomain);
        this.totalFacetsSelected = 0;
        this.loadingService.showLoading(false);
        this.basicItemList.emit(this.data);

        this.resultPanelService.setCounterData(this.data.length);

        setTimeout(() => {
          this.DomainLinks.forEach(element => {
            if (element.code === 'ALL') {
              this.domainResultsCounter[element.code] = this.data?.filter(o => o.hideToResult === false).length;
            } else if (element.code === 'FAV') {
              this.domainResultsCounter[element.code] = this.configurables.getAllPinned().length;
            } else {
              this.domainResultsCounter[element.code] = this.data?.filter(o => o.code === element.code && o.hideToResult === false).length;
            }
          });
        });

        // reset pagination after each search
        this.resetPagination();

        // remove old selected service
        this.configurables.setSelected(null, true);

        this.panelsEvent.dataPanelToggle();

      }),

      this.model.domainMI.valueObs.subscribe((selectedDomain: Domain) => {
        this.resultPanelService.clearFacetSelection();
        this.activeDomain = selectedDomain;
        this.refresh(this.activeDomain);
        this.activeDomainData = this.getDomainInfoBy(this.activeDomain.code, 'code');
        this.totalFacetsSelected = 0;

        setTimeout(() => {
          this.panelsEvent.dataPanelToggle();
        }, 100);

      }),

      this.panelsEvent.invokeSelectItem.subscribe((id: string) => {
        const item = this.data.find((i: BasicItem) => { return i.id === id; });
        if (item !== null && item !== undefined) {
          this.select(item);
        }
      }),

      this.tourService.triggerInformationDialogForTourObservable.subscribe(() => {
        this.openDetailsDialogForTour();
      }),

      this.tourService.triggerInfoIconStepObservable.subscribe(() => {
        this.addServiceInfoIconStep(this.serviceParent);
      }),
    );

    const activeDomainCode = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_DOMAIN_OPEN) as string | boolean ?? false;
    if (activeDomainCode !== false && activeDomainCode !== '') {
      this.loadingService.showLoading(true);
      this.toggleDomain(activeDomainCode, false);
      this.activeDomainData = this.getDomainInfoBy(activeDomainCode as string, 'code');
    }
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.subscriptions.push(
        this.loadingService.showLoadingObs.subscribe((showLoading: boolean) => {
          this.showLoading = showLoading;
        })
      );
    });

    setTimeout(() => {
      this.subscriptions.push(
        this.landingService.showLandingObs.subscribe((landing: boolean) => {
          // if in landing page remove selected item
          if (landing) {
            this.configurables.setSelected(null, true);
          }
        }),
      );
    }, 1000);
  }

  public refresh(domain: Domain): void {
    if (null != this.data) {
      let basicItemList = this.data;
      if (domain.code === 'FAV') {

        basicItemList = [];

        this.configurables.getAllPinned().forEach(element => {
          basicItemList.push(this.data.filter(o => o.distId === element.id)[0]);
        });

        // sort favourite items
        basicItemList.sort((a, b) => {
          return this.sortData(a, b);
        });

      } else if (domain.code !== 'ALL') {
        if (this.filteredFacetData.length !== 0 && this.filteredFacetData[0].code === domain.code) {
          basicItemList = this.filteredFacetData;
        } else {
          basicItemList = this.data.filter((item: BasicItem) => item.code === domain.code);
          this.filteredFacetData = [];
        }
      }

      this.totalFacetsSelected = this.filteredFacetData.length;
      this.dataSource = new MatTableDataSource<BasicItem>(basicItemList);
      this.dataSource.paginator = this.paginator;
    }
  }

  /**
   * When the user clicks on an item, the item is selected
   * @param {BasicItem | null} expandedElement - The element that was expanded.
   */
  public select(expandedElement: BasicItem | null): void {
    this.expandedElement = expandedElement;
    this.messageShow = false;
    if (this.expandedElement !== null) {

      // eslint-disable-next-line max-len
      this.configurables.setSelected(this.expandedElement.distId, true, this.expandedElement.name);

      // add levels information
      this.addLevelToElement(expandedElement);

      // refine data
      void this.localStoragePersister.get(LocalStorageVariables.LS_TOUR_ACTIVE).then((active: boolean) => {
        const tourActive = active;
        void this.localStoragePersister.get(DistributionNotificationText.LS_DISTRIBUTION_MESSAGE_ID).then((val) => {

          let messageShow = (val || val === null) ? true : false;

          setTimeout(() => {
            const distributionSelected = this.configurables.getSelected();

            if (distributionSelected !== null && distributionSelected instanceof DataConfigurableDataSearch) {
              // if only downloadable => no message
              const distributionDetails = distributionSelected?.getDistributionDetails();
              // eslint-disable-next-line max-len
              if (distributionDetails!.isOnlyDownloadable) {
                messageShow = false;
              }

              if (messageShow && !this.configurables.isPinned(expandedElement!.id) && !tourActive) {
                this.notification.sendDistributionNotification({
                  id: DistributionNotificationText.LS_DISTRIBUTION_MESSAGE_ID,
                  title: 'Information',
                  message: DistributionNotificationText.MESSAGE_REFINE_DATA,
                  type: UserNotificationService.TYPE_INFO,
                  showAgain: true
                });

              }
            }
          }, 1000);

        });
      });


    } else {
      this.configurables.setSelected(null, true);
    }

  }

  public favourite(element: BasicItem): void {

    void this.configurables.togglePinned(element.distId, true).then(pinned => {
      element.isPinned = pinned;
      if (pinned) {
        // add levels information
        this.addLevelToElement(element);
      }
      if (this.activeDomain.code === 'FAV') {
        // only in the FAV sections: if element is selected => unselected
        if (this.configurables.isSelected(element.distId)) {
          this.configurables.setSelected(null, true);
        }

        if (this.configurables.getAllPinned().length === 0) {
          // this.activeDomain.code = 'ALL';
          this.landingService.showLanding(true);
        }

        this.refresh(this.activeDomain);
      }

      // eslint-disable-next-line @typescript-eslint/dot-notation
      this.domainResultsCounter['FAV'] = this.configurables.getAllPinned().length;

    });

  }

  public openDialog(element: BasicItem): void {
    void this.dialogService.openDetailsDialog(
      element.id,
      '50vw',
    );
  }

  public checkFavourite(item: BasicItem): boolean {
    return item.isPinned;
  }

  public selectConfigIndex(newIndex: number): void {
    const configurables = this.dataConfigurablesArraySource.getValue();
    let selectedConfigurable: null | DataConfigurableI = null;
    if (configurables != null) {
      if ((newIndex >= 0) && (newIndex < configurables.length)) {
        selectedConfigurable = configurables[newIndex];
        this.lastGoodSelectedConfigurableId = selectedConfigurable!.id;
      }
    }
    // we're using null to trigger "loading"
    this.selectedConfigurableSource.next(selectedConfigurable);

  }

  /**
   * The function `toggleDomain` sets the domain value based on the input value and a check for closing.
   * @param {string | boolean | undefined} value - The value parameter can be of type string, boolean, or
   * undefined. It represents the value that will be passed to the setDomain method of the
   * landingService.
   * @param [checkForClose=true] - The checkForClose parameter is a boolean value that determines whether
   * to check for the close condition. If it is set to true, the code will check if the value is
   * undefined, false, or equal to the active domain code before setting the domain. If it is set to
   * false, the code will
   */
  public toggleDomain(value: string | boolean | undefined, checkForClose = true): void {

    if (checkForClose === false) {
      this.landingService.setDomain((value === undefined || value === false) ? false : value);
    } else {
      this.landingService.setDomain((value === undefined || value === false || value === this.activeDomain.code) ? false : value);
    }
  }

  /**
   * Called on press of the displayed "Clear" button and triggers the display of a confirmation
   * to remove all of the items that are pinned.
   */
  public removeAllFavourites(): void {
    void this.dialogService.openConfirmationDialog(
      'Do you want to clear all (' + String(this.configurables.getAllPinned().length) + ') favourite items?',
      false,
      'Ok',
      'primary'
    ).then((confirm: boolean) => {
      if (confirm) {
        this.data.filter(item => item.isPinned).forEach((item: BasicItem) => {
          item.isPinned = false;
          this.favourite(item);
        });
      }
    });
  }

  public itemShow(elem: BasicItem): boolean {
    let show = true;
    if (this.activeDomainData?.code !== 'FAV') {
      show = !elem.hideToResult;
    }
    return show;
  }

  /**
   * The function `onPaginateChange` is used to handle pagination changes by resetting the selected item,
   * showing a loading spinner, scrolling to the top of the results container, and hiding the loading
   * spinner after a delay.
   */
  public onPaginateChange(): void {
    this.configurables.setSelected(null, true);
    this.showLoading = true;
    setTimeout(() => {
      const scrollElem = document.querySelector('.results-container.nice-scrollbar');
      if (scrollElem) {
        scrollElem.scrollTo({ top: 0 });
      }
      this.showLoading = false;
    }, 300);
  }

  /**
   * It resets the paginator to the first page
   */
  public resetPagination(): void {
    this.paginator.firstPage();
  }

  public toggleFacetExpansionPanel(): void {
    this.facetExpansionHidden = !this.facetExpansionHidden;
  }

  public setSelectedFacets(data: Array<FacetFlatNode>): void {
    const facetSet = new Set<BasicItem>();
    const domainFilteredData = this.data.filter(o => o.code === this.activeDomain.code);
    domainFilteredData.filter((item: BasicItem) => {
      return data.some((node: FacetFlatNode) => {
        return item.levels.forEach((levels: DistributionLevel[]) => {
          return levels.forEach((level: DistributionLevel, key, mylevels) => {
            if (level.distId === node.distId) {
              if (node.name === '') {
                if (Object.is(mylevels.length - 1, key)) {
                  facetSet.add(item);
                }
              } else {
                facetSet.add(item);
              }
            }
          });
        });
      });
    });

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.filteredFacetData = Array.from(facetSet);
      this.refresh(this.activeDomain);
    }, 10);

  }

  public showMessage(showMessage: boolean): void {
    this.messageShow = showMessage;
  }

  public addServiceItemTourStep(): void {
    const serviceItem = document.getElementById('distributionListTable')?.children[1].children[3] as HTMLTableElement;
    const tourName = 'EPOS Overview';
    const options: Driver.PopoverOptions = {
      title: `<span class="tour-title"><strong>Tour:</strong> ${tourName}</span>Service Item`,
      // eslint-disable-next-line max-len
      description: 'This is a service item, found within the applied filters above. You can select the service by clicking on the service title.',
      position: 'right',
    };
    this.serviceParent = serviceItem;
    this.tourService.addStep(tourName, serviceItem, options, 9, true);
    this.subscriptions.push(
      this.tourService.tourStepForwardObservable.subscribe((value: ElementRef<HTMLElement>) => {
        if (value.nativeElement.id === serviceItem.id) {
          this.addServiceInfoStep();
        }
      })
    );
  }

  public addServiceInfoStep(): void {
    const serviceInformationsElement =
      this.serviceParent.children.item(0)?.children.item(0)?.children.item(1) as HTMLElement;
    serviceInformationsElement.id = 'serviceInformationsElementID';
    const tourName = 'EPOS Overview';
    const options: Driver.PopoverOptions = {
      title: `<span class="tour-title"><strong>Tour:</strong> ${tourName}</span>Service Information`,
      // eslint-disable-next-line max-len
      description: '<strong>Categories:</strong> These are the associated categories of an item. Click the category link to filter by that specific category. <p>&nbsp;</p>' +
        // eslint-disable-next-line max-len
        '<strong>Visible on:</strong> The service can be visualized in Map, Table or Graph depending on the associated data formats. If no visualisation of the service is available then the data can only be downloaded. <p>&nbsp;</p>' +
        // eslint-disable-next-line max-len
        '<strong>Status:</strong> Availability of the services is checked regularly by a monitoring system. The status of a service, if avaliable is displayed.',
      position: 'right',
    };
    this.tourService.addStep(tourName, serviceInformationsElement, options, 10);
    this.subscriptions.push(
      this.tourService.tourStepEnterObservable.subscribe((value: ElementRef<HTMLElement>) => {
        if (value.nativeElement.id === 'serviceInformationsElementID') {
          const itemSelected = this.data.find((item: BasicItem) => item.distId === this.serviceParent.id);
          // Selects and expands item
          this.select(itemSelected as BasicItem);
        }
      }),
      this.tourService.tourStepForwardObservable.subscribe((value: ElementRef<HTMLElement>) => {
        if (value.nativeElement.id === 'serviceInformationsElementID') {
          this.addAdvancedFiltersStep();
        }
      })
    );
  }

  public addAdvancedFiltersStep(): void {
    this.serviceParent.scrollIntoView();
    const serviceStatusElement =
      this.serviceParent.children.item(0)?.children.item(0)?.children.item(2)?.children.item(0)?.children.item(1) as HTMLElement;
    serviceStatusElement.id = 'serviceAdvacnedFiltersId';
    const tourName = 'EPOS Overview';
    const options: Driver.PopoverOptions = {
      title: `<span class="tour-title"><strong>Tour:</strong> ${tourName}</span>Advanced Search Filters`,
      description: 'The service can be configured here. Click here to open a larger service configuration window.',
      position: 'right',
    };
    this.tourService.addStep(tourName, serviceStatusElement, options, 11);

    this.subscriptions.push(
      this.tourService.tourStepForwardObservable.subscribe((value: ElementRef<HTMLElement>) => {
        if (value.nativeElement.id === 'serviceAdvacnedFiltersId') {
          this.addAdvancedFiltersDownloadStep();
        }
      }));

  }

  public addAdvancedFiltersDownloadStep(): void {
    const serviceStatusElement = document.getElementById('configDownloadID') as HTMLElement;
    const tourName = 'EPOS Overview';
    const options: Driver.PopoverOptions = {
      title: `<span class="tour-title"><strong>Tour:</strong> ${tourName}</span>Download`,
      description: 'Click here to see all avaliable formats that can be downloaded.',
      position: 'right',
    };
    this.tourService.addStep(tourName, serviceStatusElement, options, 12);
    this.subscriptions.push(
      this.tourService.tourStepForwardObservable.subscribe((value: ElementRef<HTMLElement>) => {
        if (value.nativeElement.id === 'configDownloadID') {
          this.addServiceInfoIconStep(this.serviceParent);
        }
      }),
      this.tourService.tourStepBackwardObservable.subscribe((value: ElementRef<HTMLElement>) => {
        if (value.nativeElement.id === 'configDownloadID') {
          this.addAdvancedFiltersStep();
        }
      })
    );
  }

  public addServiceInfoIconStep(serviceChild: HTMLElement): void {
    this.serviceParent.scrollIntoView();
    const serviceInfoIcon =
      serviceChild.children.item(0)?.children.item(0)?.children.item(0)?.children.item(1)?.children.item(0) as HTMLElement;
    serviceInfoIcon.id = 'serviceInfoIconId';
    const tourName = 'EPOS Overview';
    const options: Driver.PopoverOptions = {
      title: `<span class="tour-title"><strong>Tour:</strong> ${tourName}</span>Service Information`,
      description: 'Click the \'i\' for details about a dataset',
      position: 'right',
    };
    this.tourService.addStep(tourName, serviceInfoIcon, options, 13);
    this.subscriptions.push(
      this.tourService.tourStepForwardObservable.subscribe((value: ElementRef<HTMLElement>) => {
        if (value.nativeElement.id === 'serviceInfoIconId') {
          this.tourService.triggerInformationDialogForTourCall();
          this.addServiceFavoriteIconStep(this.serviceParent);
        }
      }),
      this.tourService.tourStepEnterObservable.subscribe((value: ElementRef<HTMLElement>) => {
        if (value.nativeElement.id === 'serviceInfoIconId') {
          const itemSelected = this.data.find((item: BasicItem) => item.distId === this.serviceParent.id);
          // Selects and expands item
          this.select(itemSelected as BasicItem);
        }
      }),
      this.tourService.tourStepBackwardObservable.subscribe((value: ElementRef<HTMLElement>) => {
        if (value.nativeElement.id === 'serviceInfoIconId') {
          this.addAdvancedFiltersDownloadStep();
        }
      })
    );
  }

  public addServiceFavoriteIconStep(serviceChild: HTMLElement): void {
    const serviceFavoriteIcon =
      serviceChild.children.item(0)?.children.item(0)?.children.item(0)?.children.item(1)?.children.item(1) as HTMLElement;
    serviceFavoriteIcon.id = 'serviceFavoriteIconId';
    const tourName = 'EPOS Overview';
    const options: Driver.PopoverOptions = {
      title: `<span class="tour-title"><strong>Tour:</strong> ${tourName}</span>Favourites`,
      description: 'Click the star icon to add a dataset to your favourites.',
      position: 'right',
    };
    this.tourService.addStep(tourName, serviceFavoriteIcon, options, 15);
    this.subscriptions.push(
      this.tourService.tourStepForwardObservable.subscribe((value: ElementRef<HTMLElement>) => {
        if (value.nativeElement.id === 'serviceFavoriteIconId') {
          this.addMultipleFavouritesStep();
        }
      }),
      this.tourService.tourStepBackwardObservable.subscribe((element: ElementRef<HTMLElement>) => {
        if (element.nativeElement.id === 'serviceFavoriteIconId') {
          this.tourService.triggerInformationDialogForTourCall();
        }
      })
    );
  }

  public addMultipleFavouritesStep(): void {
    const elem = document.getElementsByClassName('domain-results').item(0) as HTMLElement;
    elem.id = 'domainResultsId';
    const tourName = 'EPOS Overview';
    const options: Driver.PopoverOptions = {
      title: `<span class="tour-title"><strong>Tour:</strong> ${tourName}</span>Favourites`,
      description: 'When added to favourites, multiple datasets are visible at once.',
      position: 'right',
    };
    this.tourService.addStep(tourName, elem, options, 16);

    clearTimeout(this.favTimeout);

    this.favTimeout = setTimeout(() => {
      if (this.configurables.getAllPinned().length !== 1) {
        const itemSelected = this.data.find((item: BasicItem) => item.distId === this.serviceParent.id) as BasicItem;
        this.favourite(itemSelected);
        const clearFavButton = document.getElementsByClassName('results-container').item(0) as HTMLElement;

        if (clearFavButton) {
          clearFavButton.scrollTop = 0;
        }
      }
      this.landingService.setDomainDuringTour('FAV');
    }, 100);
    this.subscriptions.push(
      this.tourService.tourStepForwardObservable.subscribe((element: ElementRef<HTMLElement>) => {
        if (element.nativeElement.id === 'domainResultsId') {
          this.addCustomiseLayerStep();
        }
      }),
      this.tourService.tourStepBackwardObservable.subscribe((element: ElementRef<HTMLElement>) => {
        if (element.nativeElement.id === 'domainResultsId') {
          this.landingService.setDomainDuringTour('SEI');
          this.addServiceFavoriteIconStep(this.serviceParent);
        }
      })
    );
  }

  public addCustomiseLayerStep(): void {
    const tourName = 'EPOS Overview';
    const elem = document.getElementById('custom-layer-control') as HTMLElement;

    const options: Driver.PopoverOptions = {
      title: `<span class="tour-title"><strong>Tour:</strong> ${tourName}</span>Customise layers`,
      description: 'Customise layers in map view, change the basemap, toggle layers on/off and view legend.',
      position: 'left',
    };
    this.tourService.addStep(tourName, elem, options, 17);

    this.subscriptions.push(
      this.tourService.tourStepEnterObservable.subscribe((element: ElementRef<HTMLElement>) => {
        if (element.nativeElement.id === 'custom-layer-control') {
          if (null != this.mapService.getMapRef()) {
            this.mapService.getMapRef().classList.remove('driver-fix-stacking');
          }
        }
      }),
      this.tourService.tourStepForwardObservable.subscribe((element: ElementRef<HTMLElement>) => {
        if (element.nativeElement.id === 'custom-layer-control') {
          this.addTableVisStep();
        }
      })
    );
  }

  public addTableVisStep(): void {
    const tableToggle = document.getElementById('table-vis-toggle') as HTMLElement;
    const tourName = 'EPOS Overview';
    const options: Driver.PopoverOptions = {
      title: `<span class="tour-title"><strong>Tour:</strong> ${tourName}</span>Table View`,
      description: 'Tabular data can be viewed by clicking on this tab.',
      position: 'left',
    };
    this.tourService.addStep(tourName, tableToggle, options, 18);
    this.subscriptions.push(
      this.tourService.tourStepForwardObservable.subscribe((value: ElementRef<HTMLElement>) => {
        if (value.nativeElement.id === 'table-vis-toggle') {
          this.addGraphVisStep();
        }
      })
    );
  }

  public addGraphVisStep(): void {
    const tableToggle = document.getElementById('graph-vis-toggle') as HTMLElement;
    const tourName = 'EPOS Overview';
    const options: Driver.PopoverOptions = {
      title: `<span class="tour-title"><strong>Tour:</strong> ${tourName}</span>Graph View`,
      description: 'Graph or time series data can be viewed by clicking on this tab.',
      position: 'left',
    };
    this.tourService.addStep(tourName, tableToggle, options, 19);
  }

  public openDetailsDialogForTour(): void {
    const favouriteSelected = this.data.find((item: BasicItem) => item.distId === this.serviceParent.id);
    this.openDialog(favouriteSelected as BasicItem);
  }

  private addLevelToElement(elem: BasicItem | null): void {
    if (elem !== null) {
      setTimeout(() => {

        // add to selected extra information (level*)
        this.configurables.addLevels(
          elem.distId,
          elem.levels[0]
        );

      }, 500);
    }
  }

  /**
   * Update the configurables array source with the selected item, or an empty array if nothing is
   * selected
   */
  private updateConfigs(): void {
    const allConfigurables = this.configurables.getAll().slice();

    this.ensureReloadFuncSet(allConfigurables);
    this.configurables.updateSpatialBounds(this.model.dataSearchBounds.get());
    this.configurables.updateTemporalRange(this.model.dataSearchTemporalRange.get());

    const selectedItemConfigurable = this.configurables.getSelected();

    let configurablesData: null | Array<DataConfigurableDataSearchI>;
    if (selectedItemConfigurable == null) {
      // nothing selected = empty
      configurablesData = [];
      this.expandedElement = null;
    } else if (selectedItemConfigurable instanceof DataConfigurableDataSearchLoading) {
      // loading state
      configurablesData = null;
    } else {
      // display selected item
      configurablesData = [selectedItemConfigurable];
    }
    this.dataConfigurablesArraySource.next(configurablesData);

  }

  /**
   * If there are any data configurables, try to reselect the previously selected one. If that fails,
   * select the first one
   */
  private updateSelectedConfig(): void {
    const dataConfigurables = this.dataConfigurablesArraySource.getValue();
    let newSelectedIndex = -1;

    if ((dataConfigurables != null) && (dataConfigurables.length > 0)) {
      // try to reselect previous selected
      newSelectedIndex = dataConfigurables.findIndex((configurable: DataConfigurable) => {
        return (this.lastGoodSelectedConfigurableId === configurable.id);
      });
      if (newSelectedIndex === -1) {
        newSelectedIndex = 0;
      }
    }
    this.selectConfigIndex(newSelectedIndex);

  }


  /**
   * It ensures that the triggerReloadFunc is set on the configurables.
   * @param configurables - Array<DataConfigurableDataSearchI>
   */
  private ensureReloadFuncSet(configurables: Array<DataConfigurableDataSearchI>): void {
    // ensure reset func set
    configurables.forEach((configurable: DataConfigurableDataSearchI) => {
      if (configurable instanceof DataConfigurableDataSearch) {
        configurable.setTriggerReloadFunc((configurableToUpdate: DataConfigurableDataSearch) => {
          this.configurables.replaceOrAdd(configurableToUpdate, true);
        });
      }
    });
  }

  private recursiveCreateItemsDisplay(
    item: Facet<DistributionSummary>,
    levels: Array<DistributionLevel> = [],
    typeFilters: Array<string> | null = []
  ): void {

    item.getChildren().forEach((child: Facet<DistributionSummary>) => {

      const level: DistributionLevel = {
        id: levels.length,
        value: child.getName(),
        level: levels.length,
        count: child.getFlatData().length,
        children: [],
        distId: child.getIdentifier(),
      };

      // add level to array (push function cannot be used)
      levels = levels.concat(level);

      this.getData(child, levels, typeFilters);

      if (child.getChildren().length > 0) {
        this.recursiveCreateItemsDisplay(child, levels, typeFilters);
      }

      // remove last elem to array (slice function cannot be used)
      levels = levels.filter((e, i) => i < levels.length - 1);

    });

  }

  private createItemsDisplay(distFacetModelSource: FacetModel<DistributionSummary> | null): void {
    this.data = new Array<BasicItem>();
    if (distFacetModelSource != null) {

      // eslint-disable-next-line max-len
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const filterByType = this.model.dataSearchTypeData.get();

      distFacetModelSource.roots().forEach((root: Facet<DistributionSummary>) => {
        this.recursiveCreateItemsDisplay(root, [], filterByType);
      });

      // add favourites data
      const favourites = this.configurables.getAllPinned();

      favourites.forEach((fav: DataConfigurableDataSearch) => {
        const found = this.data.findIndex((d) => { return d.id === fav.id; });

        // not found on results data => add to array
        if (found === -1) {

          // get info levels
          const levels = fav.getLevels();

          // add to result array with info levels
          this.setBasicItem(
            fav.getDistributionDetails(),
            levels
          );

          // exclude item from original section
          const item = this.data.find((i: BasicItem) => { return i.id === fav.id; });
          if (item !== undefined) {
            item.hideToResult = true;
          }
        }
      });

      const dl1 = {
        id: 0,
        value: 'Volcano Observations',
        children: [],
        level: 0,
        distId: 'Volcano Observations',
      } as DistributionLevel;
      const dl2 = {
        id: 1,
        value: 'Software',
        children: [],
        level: 1,
        distId: 'Software',
      } as DistributionLevel;
      const dl3 = {
        id: 2,
        value: 'Jupyter Notebook',
        children: [],
        level: 3,
        distId: 'Jupyter Notebook',
      } as DistributionLevel;


      const software = new BasicItem();
      software.code = 'TSU';
      software.color = '#6f9ea8';
      software.distId = 'software1';
      software.name = 'VisualizeVulnerability.ipynb';
      software.isDownloadable = true;
      software.visibility = ['Not viewable', '', '', ''];
      software.levels = [[dl1, dl2, dl3]];
      software.isPinned = false;

      this.data.push(software);

      // sort data results
      this.data.sort((a, b) => {
        return this.sortData(a, b);
      });

      this.dataSource = new MatTableDataSource<BasicItem>(this.data);
      this.dataSource.paginator = this.paginator;
    }
  }

  /**
   * Sort {@link BasicItem} array by name attribute
   * @param {BasicItem} a - The first item to compare.
   * @param {BasicItem} b - BasicItem
   * @returns The sorted array.
   */
  private sortData(a: BasicItem, b: BasicItem) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  private getData(element: Facet<DistributionSummary>, levels: Array<DistributionLevel>, typeFilters: Array<string> | null): void {
    element.getData().forEach((dist: DistributionSummary) => {

      let take = true;

      // if only one filter was chosen => OR
      if (null !== typeFilters && typeFilters.length === 1) {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        take = (dist.isMappable && typeFilters.some(i => i === ViewType.MAP as string))
          || (dist.isGraphable && typeFilters.some(i => i === ViewType.GRAPH as string))
          || (dist.isTabularable && typeFilters.some(i => i === ViewType.TABLE as string));

      } else if (null !== typeFilters && typeFilters.length > 1) {

        if (typeFilters.some(i => i === ViewType.MAP as string)) {
          take = dist.isMappable && take;
        }

        if (typeFilters.some(i => i === ViewType.TABLE as string)) {
          take = dist.isTabularable && take;
        }

        if (typeFilters.some(i => i === ViewType.GRAPH as string)) {
          take = dist.isGraphable && take;
        }
      }

      if (take) {
        this.setBasicItem(dist, levels);
      }
    });
  }

  private setBasicItem(dist: DistributionSummary, levels: Array<DistributionLevel>): void {
    if (dist != null) {
      try {

        // check if it's already present on this.data
        const updateItem = this.data.find((i: BasicItem) => { return i.id === dist.getIdentifier(); });

        if (updateItem !== undefined) {

          // add new facets
          updateItem.levels.push(levels);
        } else {
          const basicItem = this.createDistribution(dist, levels);
          this.data.push(basicItem);
        }

      } catch (e) {
        console.warn('error in createItemsDisplay method ', e);
      }
    }
  }

  private createDistribution(dist: DistributionSummary, levels: Array<DistributionLevel>): BasicItem {
    const basicItem = new BasicItem();
    const info = this.getDomainInfoBy(levels[0].value);
    basicItem.id = dist.getIdentifier();
    basicItem.distId = dist.getIdentifier();
    basicItem.name = dist.getName();
    basicItem.code = info != null ? info.code : '';
    basicItem.icon = info != null ? info.imgUrl : '';
    basicItem.isDownloadable = dist.isDownloadable;
    basicItem.color = info != null ? info.color : '';
    basicItem.lcolor = info != null ? info.lcolor : '';
    const map = dist.isMappable === true ? this.VIEW_TYPE_ENUM.MAP : '';
    const graph = dist.isGraphable === true ? this.VIEW_TYPE_ENUM.GRAPH : '';
    const tab = dist.isTabularable === true ? this.VIEW_TYPE_ENUM.TABLE : '';
    const notViewable = (dist.isMappable === false && dist.isGraphable === false && dist.isTabularable === false) ? 'Not viewable' : '';
    basicItem.visibility = [notViewable, map, tab, graph];
    basicItem.distSummary = dist;
    basicItem.isPinned = this.configurables.isPinned(dist.getIdentifier());
    basicItem.hideToResult = false;
    basicItem.levels = [levels];
    basicItem.status = dist.getStatus() as number;
    basicItem.statusTimestamp = dist.getStatusTimestamp() as string;

    return basicItem;
  }
  private getDomainInfoBy(level0: string, field = 'title'): DomainInfo | null {
    const domain = this.DomainLinks.find(icon => icon[field] === level0);
    return domain != null ? domain : null;
  }

  private formatNotificationMessage(message: NotificationMessage): void {
    this.messageId = message.id ?? '';
    this.messageShow = true;
    this.messageTitle = message.title ?? this.messageTitle;
    this.messageType = message.type;
    this.messageText = message.message;
    this.messageCheckShowAgain = message.showAgain;
  }
}
export class BasicItem {
  id: string;
  distId: string;
  name: string;
  code: string | null;
  icon: string | null;
  color: string | null;
  lcolor: string | null;
  visibility: string[];
  isDownloadable: boolean;
  distSummary: DistributionSummary;
  isPinned: boolean;
  hideToResult: boolean;
  levels: Array<Array<DistributionLevel>>;
  status: number | null;
  statusTimestamp: string | null;
  constructor() { }
}


