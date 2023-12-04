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
import { Component, OnInit, Input, ViewChild, AfterViewInit, HostListener, ElementRef, Renderer2, Output } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ExecutionService } from 'services/execution.service';
import { ResizeEvent } from 'angular-resizable-element';
import { GeoJSONHelper } from 'utility/maplayers/geoJSONHelper';
import { PopupPropertyType, PopupProperty } from 'utility/maplayers/popupProperty';
import { DistributionFormatType } from 'api/webApi/data/distributionFormatType';
import moment from 'moment-es6';
import { FeatureCollection } from 'geojson';
import { DataConfigurableI } from 'utility/configurables/dataConfigurableI.interface';
import { AuthenticatedClickService } from 'services/authenticatedClick.service';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { MapInteractionService } from 'utility/eposLeaflet/services/mapInteraction.service';
import { MatSelectChange } from '@angular/material/select';
import { DataSearchConfigurablesService } from 'pages/dataPortal/services/dataSearchConfigurables.service';
import { UserNotificationService } from 'pages/dataPortal/services/userNotification.service';
import { NotificationService } from 'services/notification.service';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
export interface TableExportObject {
  headers: Array<string>;
  data: Array<Array<string>>;
  fileName: string;
}
@Unsubscriber('subscriptions')
@Component({
  selector: 'app-table-display',
  templateUrl: './tableDisplay.component.html',
  styleUrls: ['./tableDisplay.component.scss']
})
export class TableDisplayComponent implements OnInit, AfterViewInit {
  @Input() dataConfigurable: DataConfigurableI;
  @Output() exportData = new Subject<TableExportObject>();

  @ViewChild(MatPaginator, { static: true }) matPaginator: MatPaginator;
  @ViewChild(MatSort) matSort: MatSort;
  @ViewChild('containerTable') containerTable: ElementRef;

  public readonly DISPLAY_ITEM_TYPES = PopupPropertyType;

  public tableHeaders: Array<string>;
  public customHeaders: Array<string>;
  public dataSource = new MatTableDataSource<Array<null | PopupProperty>>([]);

  public showSpinner = true;
  public showTable = true;
  public selectedRow: null | number;

  public rowInPage = 5;
  public pointsOnMapHeader = PopupProperty.POINTS_ON_MAP;
  public propertyIdHeader = PopupProperty.PROPERTY_ID;
  public rowActionsHeader = PopupProperty.ROW_ACTIONS;
  public isMappable = true;
  public pageNumber = 1;
  public activeColumnCount: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public totalColumnCount = 0;
  public maxPageNumber = 0;

  public showFilterRowCounter = false;


  /** Variable for keeping track of subscriptions, which are cleaned up by Unsubscriber */
  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  private data: FeatureCollection;

  private filterTimeout: NodeJS.Timeout;

  private featureIndexToSelect: string | null;

  private headersToRemove = [this.rowActionsHeader, this.pointsOnMapHeader, this.propertyIdHeader];

  private imageOverlay = false;

  constructor(
    private readonly executionService: ExecutionService,
    private readonly authentificationClickService: AuthenticatedClickService,
    private readonly panelsEvent: PanelsEmitterService,
    private readonly mapInteractionService: MapInteractionService,
    private renderer: Renderer2,
    private readonly notificationService: NotificationService,
    private readonly configurables: DataSearchConfigurablesService,
  ) {
  }

  public static sortPredicate(data: Array<Array<null | PopupProperty>>, sort: Sort): Array<Array<null | PopupProperty>> {

    let sortedData = data.slice();

    // const data = this.dataSource.data.slice();
    if (sort.active && sort.direction !== '') {
      sortedData = data.sort((a: Array<PopupProperty>, b: Array<PopupProperty>) => {
        const isAsc = (sort.direction === 'asc');
        const propA = a.filter((value: PopupProperty) => null != value).find((value: PopupProperty) => value.name === sort.active);
        const propB = b.filter((value: PopupProperty) => null != value).find((value: PopupProperty) => value.name === sort.active);

        const momentA = (null != propA) ? moment.utc(String(propA.values[0]).valueOf(), 'YYYY-MM-DDTHH:mm:SS', true) : null;
        const momentB = (null != propB) ? moment.utc(String(propB.values[0]).valueOf(), 'YYYY-MM-DDTHH:mm:SS', true) : null;
        let isALessThanB: boolean;
        switch (true) {
          case (null == propA): // Test for null values
            isALessThanB = true;
            break;
          case (null == propB): // Test for null values
            isALessThanB = false;
            break;
          case (propA!.name === PopupProperty.LONG_LAT): // Test for long/lat values
            isALessThanB = (Number(propA!.values[0]).valueOf() === Number(propB!.values[0]).valueOf())
              ? Number(propA!.values[1]).valueOf() < Number(propB!.values[1]).valueOf()
              : Number(propA!.values[0]).valueOf() < Number(propB!.values[0]).valueOf();
            break;
          case ((null != momentA) && momentA.isValid() && (null != momentB) && momentB.isValid()): // Test for date values
            isALessThanB = momentA!.isBefore(momentB!);
            break;
          case ((typeof propA!.values[0] === 'number') && (typeof propB!.values[0] === 'number')): // tests for numerical values
            isALessThanB = propA!.values[0] < propB!.values[0];
            break;
          default: // default tests primative string value
            isALessThanB = propA!.valuesConcatString < propB!.valuesConcatString;
            break;
        }
        return (isALessThanB ? -1 : 1) * (isAsc ? 1 : -1);
      });
    }
    return sortedData;
  }

  @HostListener('window:resize', ['$event'])
  resizeWindow(checkCurrentHeight = true): void {

    const containerTableRect = (this.containerTable.nativeElement as HTMLElement).getBoundingClientRect();
    const height = (window.innerHeight / 2) - containerTableRect.top - 20;

    if (height < containerTableRect.height || checkCurrentHeight) {
      this.renderer.setStyle(this.containerTable.nativeElement, 'height', `${height}px`);
    }

  }

  public ngOnInit(): void {

    // check height windows
    this.checkRowInPage();

    this.showSpinner = true;

    // check if mappable
    this.isMappable = this.dataConfigurable.isMappable;

    const distributionFormat = this.dataConfigurable.getDistributionDetails().getTabularableFormats()[0];

    void this.executionService.executeDistributionFormat(
      this.dataConfigurable.getDistributionDetails(),
      distributionFormat,
      this.dataConfigurable.getParameterDefinitions(),
      this.dataConfigurable.currentParamValues.slice()
    ).then((data: unknown) => {

      if (null == data || JSON.stringify(data) === '{}') {
        this.createEmptyTable();
      } else {
        switch (true) {
          // eslint-disable-next-line max-len
          case (DistributionFormatType.in(distributionFormat.getFormat(), [DistributionFormatType.APP_EPOS_GEOJSON, DistributionFormatType.APP_EPOS_TABLE_GEOJSON])):
            this.data = data as FeatureCollection;
            this.setTableHeaders(this.data);
            this.updateTable(this.customHeaders);

            // no data
            if (this.data.features.length === 0 && this.configurables.getSelected()?.id === this.dataConfigurable.id) {
              this.notificationService.sendDistributionNotification({
                id: this.dataConfigurable.id,
                title: 'Warning',
                message: UserNotificationService.MESSAGE_NO_DATA,
                type: UserNotificationService.TYPE_WARNING as string,
                showAgain: false,
              });
            }

            // check if imageOverlay
            this.imageOverlay = this.hasImageOverlay();

            break;
        }
      }
    })
      .catch((e) => {
      }).finally(() => {
        this.showSpinner = false;
      });

    this.subscriptions.push(
      this.panelsEvent.invokeGraphPanel.subscribe((graphOpened: boolean) => {
        if (graphOpened) {
          this.resizeWindow(false);
        }
      }),

      this.panelsEvent.invokeRowOnTable.subscribe((featureIndex: string) => {
        this.featureIndexToSelect = featureIndex;
      }),
      this.panelsEvent.invokeTablePanelToggle.subscribe((layerId: string) => {

        if (layerId === this.dataConfigurable.id) {
          void this.getDataSorted().then(res => {

            res.forEach((f: [PopupProperty], index) => {

              if (f.find(p => p.name === PopupProperty.PROPERTY_ID && p.valuesConcatString === this.featureIndexToSelect)) {
                this.matPaginator.pageIndex = Math.floor(index / this.matPaginator.pageSize);
                this.selectedRow = index % this.matPaginator.pageSize;
                this.dataSource.paginator = this.matPaginator;
                this.pageNumber = this.matPaginator.pageIndex + 1;
              }
            });
          });

          setTimeout(() => {
            if (this.selectedRow !== null) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              (this.containerTable.nativeElement as Element).scrollTop = (
                (this.containerTable.nativeElement as Element).scrollHeight * this.selectedRow) / this.matPaginator.pageSize;
            }
          }, 500);
        }
      }),
      this.panelsEvent.invokeClearRowOnTable.subscribe(() => {
        this.selectedRow = null;
      })

    );
  }

  /**
   * The function checks if a GeoJSON object has an image overlay.
   * @returns The method `hasImageOverlay()` is returning a boolean value.
   */
  public hasImageOverlay(): boolean {
    return GeoJSONHelper.hasImageOverlay(this.data.features);
  }

  public ngAfterViewInit(): void {
    /** initiallises sorting and paging functionallities */
    this.dataSource.filterPredicate = (propsArray: Array<PopupProperty>, filter: string): boolean => {
      filter = filter.toLowerCase();
      return (null != propsArray.find((prop: PopupProperty) => {
        return ((null != prop) && (prop.contains(filter)));
      }));
    };
    this.dataSource.sort = this.matSort;
    this.dataSource.sortData = (data: Array<Array<null | PopupProperty>>, sort: Sort) => TableDisplayComponent.sortPredicate(data, sort);

    this.dataSource.paginator = this.matPaginator;
  }

  /**
   * The function expands a row in the table and centers the map on the selected row
   * @param {number} i - the index of the row that was clicked
   * @param element - Array<PopupProperty>
   * @param [centerOnMap=false] - boolean - if true, the map will center on the selected row
   */
  public expandRow(i: number, element: Array<PopupProperty>, centerOnMap = false): void {

    if (this.selectedRow === i && !centerOnMap) {
      this.selectedRow = null;
      this.featureIndexToSelect = null;
    } else {

      const propertyId = element.filter((val: PopupProperty) => val.name === this.propertyIdHeader);
      if (propertyId.length > 0) {
        this.featureIndexToSelect = propertyId[0].valuesConcatString;
      }

      if (this.dataConfigurable.isMappable && centerOnMap) {
        const latlongProp = element.filter((val: PopupProperty) => val.name === this.pointsOnMapHeader);

        const coordinates = this.getCoordinateByProperty(latlongProp[0]);

        if (coordinates[0] !== GeoJSONHelper.NO_DATA[0]) {
          this.mapInteractionService.clickOnMaps(this.dataConfigurable.id, this.featureIndexToSelect, coordinates as Array<number>, this.imageOverlay);
        }

      }

      setTimeout(() => {
        this.checkingPageData();
      }, 100);

    }
  }

  /**
   * It checks if the page number is the same as the page number of the feature that was selected in the
   * map. If it is, it sets the selectedRow variable to the index of the feature in the page
   */
  public checkingPageData(): void {
    this.selectedRow = null;
    if (this.featureIndexToSelect !== undefined) {
      void this.getDataSorted().then(res => {

        res.forEach((f: [PopupProperty], index) => {

          if (f.find(p => p.name === PopupProperty.PROPERTY_ID && p.valuesConcatString === this.featureIndexToSelect)) {
            const foundInPage = Math.floor(index / this.matPaginator.pageSize);
            if (foundInPage === this.matPaginator.pageIndex) {
              this.selectedRow = index % this.matPaginator.pageSize;
            }
          }
        });
      });
    }

    this.pageNumber = this.matPaginator.pageIndex + 1;
  }

  public goToPage(): void {
    if (this.pageNumber > this.maxPageNumber) {
      this.pageNumber = this.maxPageNumber;
    }
    this.matPaginator.pageIndex = this.pageNumber - 1;
    this.matPaginator.page.next({
      pageIndex: this.matPaginator.pageIndex,
      pageSize: this.matPaginator.pageSize,
      length: this.matPaginator.length
    });
  }

  /** Syncs upper paginator with lower paginator. */
  public syncPrimaryPaginator(event: PageEvent): void {
    this.matPaginator.pageIndex = event.pageIndex;
    this.matPaginator.pageSize = event.pageSize;
    this.matPaginator.page.emit(event);
  }

  /**  used for filtering of table results */
  public applyFilter(event: KeyboardEvent): void {
    // only filter after the filter hasn't changed for delay
    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {

      const textFilter = String((event.target as HTMLInputElement).value).trim().toLowerCase();
      this.showFilterRowCounter = textFilter !== '' ? true : false;

      this.dataSource.filter = textFilter;
      this.maxPageNumber = Math.ceil(this.dataSource.filteredData.length / this.matPaginator.pageSize);
      if (this.pageNumber > this.maxPageNumber) {
        this.pageNumber = this.maxPageNumber;
      }
    }, 100);
  }

  /** reset the width of table columns */
  public onResizeEnd(event: ResizeEvent, columnName: string): void {
    if (event.edges.right) {
      const cssValue = String(event.rectangle.width) + 'px';
      const columnElts = document.getElementsByClassName('mat-column-' + columnName);
      Array.from(columnElts).forEach((el: HTMLDivElement) => el.style.width = cssValue);
    }
  }

  /** reloads the table and removes any formating */
  public reload(): void {
    this.showSpinner = true;
    this.showTable = false;
    setTimeout(() => {
      this.selectedRow = null;
      this.showTable = true;
      this.showSpinner = false;
      this.maxPageNumber = Math.ceil(this.dataSource.data.length / this.matPaginator.pageSize);
    }, 100);
  }

  public openAuthLink(event: MouseEvent, item: PopupProperty): void {
    event.preventDefault();

    GeoJSONHelper.popupClick(event, this.executionService, this.authentificationClickService, item);
  }

  public updateTable(headers: Array<string>): void {
    const tableMap = GeoJSONHelper.getTableObjectsFromProperties(this.data.features);

    // check if mappable table
    this.isMappable = tableMap.has(this.pointsOnMapHeader);
    if (this.isMappable === false) {
      headers = headers.filter(obj => { return obj !== this.pointsOnMapHeader; });
    }

    let tableData = Array.from(tableMap.values());

    /** sets value of removed header to null in each array */
    tableData = (null != tableData[0])
      ? tableData.map((value) => value.map((values) => (null != values) ? (headers.includes(values.name) ? values : null) : null))
      : [];

    /** pivot table to get from colArray[rowArray] to rowArray[colArrray] */
    tableData = (null != tableData[0])
      ? tableData[0].map((_, colIndex) => tableData.map(row => row[colIndex]))
      : [];

    /** filter out null values */
    let tableFormatted: PopupProperty[][] = tableData.map((array: Array<PopupProperty>) =>
      array.filter((val: PopupProperty) => val !== null));

    if (this.isMappable) {
      /** shift action custom header at the end */
      tableFormatted = tableFormatted.map((row: Array<PopupProperty>) => {
        // actions
        return this.shiftColumnToTheStart(row, PopupProperty.ROW_ACTIONS);
      });
    }

    /** applies new data to table */
    this.dataSource.data = tableFormatted;
    this.maxPageNumber = Math.ceil(this.dataSource.data.length / this.matPaginator.pageSize);
    this.getActiveColumnCount(this.dataSource.data[0], false);
  }

  public handleSelectionChange(event: MatSelectChange): void {
    this.getActiveColumnCount(event.value, true);
  }

  /** Trigger Subject sending filtered table data and headers to parent for csv export */
  public exportTableData() {
    // Skips first column depending on if data is mappable or not.
    const mappableData = this.dataSource.filteredData.map((popupPropAr: Array<PopupProperty>) => popupPropAr.map((popupProp: PopupProperty) => popupProp.valuesConcatString).slice(1, -2));
    const nonMappableData = this.dataSource.filteredData.map((popupPropAr: Array<PopupProperty>) => popupPropAr.map((popupProp: PopupProperty) => popupProp.valuesConcatString).slice(0, -2));
    const data: TableExportObject = {
      headers: this.dataConfigurable.isMappable ? this.customHeaders.slice(1, -2) : this.customHeaders.slice(0, -2),
      data: this.dataConfigurable.isMappable ? mappableData : nonMappableData,
      fileName: this.dataConfigurable.name,
    };

    this.exportData.next(data);
  }

  private getActiveColumnCount(data, onChange): void {
    if (data !== undefined) {
      let copy = [...data]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment

      if (!onChange) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        copy = copy.filter((el) => !this.headersToRemove.includes(el.name as string));
      } else {
        copy = copy.filter((el: string) => !this.headersToRemove.includes(el));
      }
      this.activeColumnCount.next(copy.length);
    }
  }

  private shiftColumnToTheStart(row: PopupProperty[], column: string): PopupProperty[] {
    // shift header
    this.customHeaders.unshift(this.customHeaders.splice(this.customHeaders.findIndex(r => {
      return r === column;
    }), 1)[0]);
    // shift data
    row.unshift(row.splice(row.findIndex(r => { return r.name === column; }), 1)[0]);

    return row;
  }

  private createEmptyTable() {
    this.tableHeaders = [];
    this.dataSource.data = [];

    this.notificationService.sendDistributionNotification({
      id: this.dataConfigurable.id,
      title: 'Warning',
      message: UserNotificationService.MESSAGE_NO_DATA,
      type: UserNotificationService.TYPE_WARNING as string,
      showAgain: false,
    });
  }

  private setTableHeaders(data: GeoJSON.FeatureCollection) {
    const tableMap = GeoJSONHelper.getTableObjectsFromProperties(data.features);
    this.tableHeaders = Array.from(tableMap.keys());
    this.customHeaders = this.tableHeaders.slice(0, 8);

    if (!this.customHeaders.includes(this.pointsOnMapHeader)) {
      this.customHeaders.push(this.pointsOnMapHeader);
    }

    if (!this.customHeaders.includes(this.propertyIdHeader)) {
      this.customHeaders.push(this.propertyIdHeader);
    }

    if (!this.customHeaders.includes(this.rowActionsHeader)) {
      this.customHeaders.push(this.rowActionsHeader);
    }

    this.totalColumnCount = [...this.tableHeaders].filter((el) => !this.headersToRemove.includes(el)).length;
  }

  private checkRowInPage(): void {
    // check height windows
    if (window.innerHeight > 1300) {
      this.rowInPage = 10;
    }
  }

  private getDataSorted(): Promise<Array<Array<PopupProperty | null>>> {
    return new Promise((resolve) => {
      const dataSorted = this.dataSource.sortData(this.dataSource.data, this.matSort);
      resolve(dataSorted);
    });
  }

  private getCoordinateByProperty(property: PopupProperty) {

    let coordinates: (string | number | boolean)[] = [];

    if (property.isSingleValue) {
      coordinates = property.values[0][0] as (string | number | boolean)[];
    } else {
      coordinates = property.values;
    }

    return coordinates;

  }
}
