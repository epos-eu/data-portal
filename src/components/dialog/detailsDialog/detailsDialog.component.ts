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
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../baseDialogService.abstract';
import { DistributionDetails } from 'api/webApi/data/distributionDetails.interface';
import { TemporalRange } from 'api/webApi/data/temporalRange.interface';
import { DialogService } from '../dialog.service';
import { MatTableDataSource } from '@angular/material/table';
import { SpatialRange } from 'api/webApi/data/spatialRange.interface';
import { TourService } from 'services/tour.service';
import * as Driver from 'driver.js';
import { DataProvider } from 'api/webApi/data/dataProvider.interface';
import { DomainInfo, domainLinks } from 'pages/dataPortal/modules/dataPanel/links';
import { AuthenticatedClickService } from 'services/authenticatedClick.service';
import { SearchService } from 'services/search.service';
import { DistributionCategories } from 'api/webApi/data/distributionCategories.interface';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';
import { Subscription } from 'rxjs';

export interface DetailsDataIn {
  distId: string;
}

/**
 * General purpose details dialog
 */
@Component({
  selector: 'app-details-dialog',
  templateUrl: './detailsDialog.component.html',
  styleUrls: ['./detailsDialog.component.scss']
})
export class DetailsDialogComponent implements OnInit, AfterViewInit, OnDestroy {

  public readonly domainLinks = domainLinks;

  public nullDataString = 'Unspecified';
  public nullDataHtml: string;
  public detailsData: DistributionDetails | undefined;
  public disableDoiButton: boolean;
  public displayColumns = ['key', 'value'];
  public spatialRange: SpatialRange;
  public showMap = true;
  public dataSourceCategories = new MatTreeNestedDataSource<DistributionCategories>();
  public treeControlCategories = new NestedTreeControl<DistributionCategories>(node => node.children);

  public dataSource: MatTableDataSource<KeyValue>;
  public dataService: MatTableDataSource<KeyValue>;
  public dataProvider: MatTableDataSource<DataProvider>;

  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<DetailsDataIn>,
    private readonly dialogService: DialogService,
    private readonly tourService: TourService,
    private readonly authService: AuthenticatedClickService,
    private readonly searchService: SearchService,
    private readonly localStoragePersister: LocalStoragePersister,
  ) {
    this.nullDataHtml = '<i>' + this.nullDataString + '</i>';
  }

  public ngOnInit(): void {
    void this.searchService.getDetailsById(this.data.dataIn.distId)
      .then((distributionDetails: DistributionDetails) => {
        this.detailsData = distributionDetails;
        if (this.detailsData !== undefined) {
          this.updateTable();
          setTimeout(() => {
            // resizes tour highlight mode when data is loaded.
            this.tourService.triggerRefresh();
          }, 100);
        }
      }).catch((e) => {
        this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, '', false, LocalStorageVariables.LS_LAST_DETAIL_DIALOG_ID);

        this.data.close();
      });
  }

  public ngAfterViewInit(): void {
    this.addDetailsTourStep();

    setTimeout(() => {
      this.treeControlCategories.expandAll();
    }, 500);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
  }

  public addDetailsTourStep(): void {
    const detailsDialog = document.getElementById('detailsTourId') as HTMLElement;
    const tourName = 'EPOS Overview';
    const options: Driver.PopoverOptions = {
      title: `<span class="tour-title"><strong>Tour:</strong> ${tourName}</span>Details Panel`,
      description: 'This dialog contains details about the service.',
      position: 'left',
    };
    if (null != detailsDialog) {
      this.tourService.addStep(tourName, detailsDialog, options, 14, true);

      this.subscriptions.push(
        this.tourService.tourStepForwardObservable.subscribe((value: ElementRef<HTMLElement>) => {
          if (value.nativeElement.id === 'detailsTourId') {
            this.dialogService.closeDetailsDialog();
          }
        }),

        this.tourService.tourStepBackwardObservable.subscribe((value: ElementRef<HTMLElement>) => {
          if (value.nativeElement.id === 'detailsTourId') {
            this.tourService.triggerAddInfoIconStep();
            this.dialogService.closeDetailsDialog();
          }
        })
      );
    }
  }


  public close(): void {
    this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, '', false, LocalStorageVariables.LS_LAST_DETAIL_DIALOG_ID);

    this.data.close();
  }

  public openSendEmailForm(): void {
    if (this.detailsData !== undefined) {
      this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, this.detailsData.getIdentifier(), false, LocalStorageVariables.LS_LAST_DETAIL_DIALOG_ID);

      if (this.authService.authenticatedContactForm()) {
        // if logged in
        void this.dialogService.openContactFormDialog(this.detailsData.getIdentifier());
      }
    }
  }

  public hasChildCategories = (_: number, node: DistributionCategories) => !!node.children && node.children.length > 0;

  private updateTable() {
    const tableData = new Array<KeyValue>();
    const tableService = new Array<KeyValue>();
    const tableProvider = new Array<DataProvider>();

    const itemDetails = this.detailsData;

    if (null != itemDetails) {
      // Alternative value for missing data
      const alt = this.nullDataHtml;

      tableData.push(this.makeKeyValue('Name', this.stringOrElse(itemDetails.getName(), alt)));
      tableData.push(this.makeKeyValue('Domain', this.stringOrElse(itemDetails.getDomain(), alt)));
      this.getCategories();
      tableData.push(this.makeKeyValue('Categories', ''));
      tableData.push(this.makeKeyValue('Description', this.stringOrElse(itemDetails.getDescription(), alt)));

      // Spatial
      tableData.push(this.makeKeyValue('Spatial Coverage', this.getSpatialValue(itemDetails)));

      tableData.push(this.makeKeyValue('Temporal Coverage', this.getTemporalValue(itemDetails)));
      tableData.push(this.makeKeyValue('Persistent Identifier(s)', this.stringOrElse(this.getDOIAsLink(itemDetails), alt)));
      tableData.push(this.makeKeyValue('License', this.stringOrElse(itemDetails.getLicense(), alt)));
      tableData.push(this.makeKeyValue('Keywords', this.stringOrElse(this.getJoinedKeywords(itemDetails), alt)));
      tableData.push(this.makeKeyValue('Update Frequency', this.stringOrElse(itemDetails.getFrequencyUpdate(), alt)));
      if (itemDetails.getQualityAssurance() !== '') {
        tableData.push(this.makeKeyValue('Quality Assurance', this.stringOrElse(itemDetails.getQualityAssurance(), '')));
      }

      tableData.push(this.makeKeyValue('Data Provider(s)', ''));

      itemDetails.getDataProvider().forEach((provider, index) => {
        tableProvider.push(provider);
      });

      tableData.push(this.makeKeyValue('Further information', this.stringOrElse(this.getDomainLink(), alt)));

      if (itemDetails.isOnlyDownloadable) { // it is a downloadable file
        tableData.push(this.makeKeyValue('Download URL', this.stringOrElse(itemDetails.getDownloadURL(), alt)));
      } else {
        tableService.push(this.makeKeyValue('Service Name', this.stringOrElse(itemDetails.getWebServiceName(), alt)));
        tableService.push(this.makeKeyValue('Service Description', this.stringOrElse(itemDetails.getWebServiceDescription(), alt)));

        const serviceProvider = itemDetails.getWebServiceProvider();
        tableService.push(this.makeKeyValue('Service Provider', serviceProvider));

        tableService.push(this.makeKeyValue('Service Endpoint', this.stringOrElse(itemDetails.getWebServiceEndpoint(), alt)));
        tableService.push(this.makeKeyValue('Service Documentation', this.stringOrElse(itemDetails.getDocumentation(), alt)));
      }
    }

    this.dataSource = new MatTableDataSource(tableData);
    this.dataService = new MatTableDataSource(tableService);
    this.dataProvider = new MatTableDataSource<DataProvider>(tableProvider);
  }

  private getDomainLink(): string | null {
    if (this.detailsData !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const domainName = this.detailsData.getDomain();
      if (domainName !== undefined) {
        const domain: DomainInfo | undefined = this.domainLinks.find((d) => d.title.toLowerCase() === domainName.toLowerCase());
        if (domain !== undefined) {
          return domain.linkUrl;
        }
      }
    }
    return null;
  }

  private getCategories(): void {
    if (this.detailsData !== undefined) {
      const categories = this.detailsData.getCategories();
      if (categories?.children !== undefined) {
        this.dataSourceCategories.data = categories?.children[0].children;
        // work arround to avoid an undefined dataNodes even after ViewInit
        this.treeControlCategories.dataNodes = categories?.children[0].children;
      }
    }
  }

  private makeKeyValue(key: string, value: unknown): KeyValue {
    return {
      key: key,
      value: value,
    };
  }

  private getTemporalValue(itemDetails: DistributionDetails): string {
    const temporalRange: TemporalRange = itemDetails.getTemporalRange();
    const unspecified = this.nullDataHtml;

    if (temporalRange == null || temporalRange.isUnbounded()) {
      return unspecified;
    } else {
      const upper = itemDetails.getTemporalRange().getUpperBound();
      const lower = itemDetails.getTemporalRange().getLowerBound();
      const momentFormat = 'YYYY-MM-DD HH:mm:ss';
      const upperString = (null != upper) ? upper.format(momentFormat) : '<i> till present </i>';
      const lowerString = (null != lower) ? lower.format(momentFormat) : unspecified;
      return lowerString + ' - ' + upperString;
    }
  }

  /**
   * Returns the Spatial value
   */
  private getSpatialValue(itemDetails: DistributionDetails): string {

    // Get the spatial range
    const spatialRange = itemDetails.getSpatialRange();
    this.spatialRange = spatialRange;
    // Spatial rows
    if (spatialRange != null && spatialRange.isBounded()) {
      return '<i>Bounded</i>';
    } else if (spatialRange != null && spatialRange.isUnbounded()) {
      return '<i>Global</i>';
    } else {
      this.showMap = false;
      return this.nullDataHtml;
    }
  }

  private stringOrElse(value: undefined | null | string, alternative: string): string {
    return (value === null || value === undefined) ? alternative : value.trim().length === 0 ? alternative : value.trim();
  }

  private getDOIAsLink(itemDetails: DistributionDetails): string {
    this.disableDoiButton = true;
    const DOIArray = itemDetails.getDOI();
    let DOILink = '';
    if (DOIArray.length > 0) {
      DOIArray.forEach((doi, index) => {
        DOILink += '<a href="https://doi.org/' + doi + '" target="_blank">' + doi + '</a><br />';
      });
    }
    return DOILink;
  }

  private getJoinedKeywords(itemDetails: DistributionDetails): null | string {
    let joined: null | string = null;
    const providers: Array<string> = itemDetails.getKeywords();
    if (providers != null && providers.length > 0) {
      joined = providers.join('; ');
    }
    return joined;
  }

}

interface KeyValue {
  key: string;
  value: unknown;
}
