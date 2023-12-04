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
import { AfterContentInit, AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../baseDialogService.abstract';
import { DataConfigurableDataSearch } from 'utility/configurablesDataSearch/dataConfigurableDataSearch';
import { PopupProperty } from 'utility/maplayers/popupProperty';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ExecutionService } from 'services/execution.service';
import { HttpClient } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { DistributionFormat } from 'api/webApi/data/distributionFormat.interface';
import { DistributionDetails } from 'api/webApi/data/distributionDetails.interface';
import { ParameterValue } from 'api/webApi/data/parameterValue.interface';
import { ParameterProperty } from 'api/webApi/data/parameterProperty.enum';
import { DataConfigurableActionType } from 'utility/configurables/dataConfigurableAction';
import { DistributionFormatType } from 'api/webApi/data/distributionFormatType';
import { FeatureCollection } from '@turf/turf';
import { ObjectHelper } from 'utility/maplayers/objectHelper';
import { GeoJSONHelper } from 'utility/maplayers/geoJSONHelper';
import { AuthenticatedClickService } from 'services/authenticatedClick.service';
import { NotificationService } from 'services/notification.service';
import { JsonHelper } from 'utility/maplayers/jsonHelper';
import { Subscription } from 'rxjs';

export interface ConfigurableDataIn {
  dataConfigurable: DataConfigurableDataSearch;
  environmentOps: boolean;
}

interface FormatElement {
  name: string;
  position: number;
  format: string;
  originalFormat: string;
  url: string;
  type: string;
  origin: PopupProperty | null;
}

/**
 * General purpose downloads dialog
 */
@Component({
  selector: 'app-downloads-dialog',
  templateUrl: './downloadsDialog.component.html',
  styleUrls: ['./downloadsDialog.component.scss']
})
export class DownloadsDialogComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) matPaginator: MatPaginator;
  @ViewChild(MatSort) matSort: MatSort;

  public dataSource = new MatTableDataSource<FormatElement>([]);
  public displayedColumns: string[] = ['select', 'name', 'format', 'download', 'copy'];
  public selection = new SelectionModel<FormatElement>(true, []);

  public serviceName = '';
  public spinner = true;
  public hasFeatureTable = true;
  public dataConfigurable: DataConfigurableDataSearch;
  public properties: Array<PopupProperty> = [];

  public onlyDownload = false;
  public subTitle = 'Files available for download';

  private distributionDetails: DistributionDetails;
  private distributionFormat: Array<DistributionFormat>;
  private parameterValues: Array<ParameterValue>;

  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<ConfigurableDataIn>,
    private readonly executionService: ExecutionService,
    private readonly http: HttpClient,
    private readonly authentificationClickService: AuthenticatedClickService,
    private readonly notifier: NotificationService,
  ) {
  }

  public ngOnInit(): void {

    this.dataConfigurable = this.data.dataIn.dataConfigurable;

    this.distributionDetails = this.dataConfigurable.getDistributionDetails();
    this.distributionFormat = this.distributionDetails.getDownloadableFormats();
    this.parameterValues = this.dataConfigurable.currentParamValues;

    this.onlyDownload = this.dataConfigurable.isOnlyDownloadable();

    this.serviceName = this.dataConfigurable.name;

    this.hasFeatureTable = this.distributionDetails.isTabularable || this.distributionDetails.isTabularable;

    this.getServiceTableData();

    if (this.hasFeatureTable) {
      let distributionFormat = this.dataConfigurable.getDistributionDetails().getTabularableFormats()[0];
      if (this.distributionDetails.isMappable && distributionFormat === undefined) {
        distributionFormat = this.dataConfigurable.getDistributionDetails().getMappableFormats()[0];
      } else if (this.distributionDetails.isGraphable && distributionFormat === undefined) {
        distributionFormat = this.dataConfigurable.getDistributionDetails().getGraphableFormats()[0];
      }

      void this.executionService.executeDistributionFormat(
        this.dataConfigurable.getDistributionDetails(),
        distributionFormat,
        this.dataConfigurable.getParameterDefinitions(),
        this.dataConfigurable.currentParamValues.slice()
      ).then((data: unknown) => {
        if (DistributionFormatType.in(
          distributionFormat.getFormat(), [DistributionFormatType.APP_EPOS_GEOJSON, DistributionFormatType.APP_EPOS_TABLE_GEOJSON]
        )) {

          let index = 0;

          // check there are external_link on featureCollection
          (data as FeatureCollection).features.forEach(feature => {
            const externalLinks = ObjectHelper.getObjectArray(feature.properties ?? [], GeoJSONHelper.EXTERNAL_LINK_ATTR);
            const links = JsonHelper.createExternalLinksAsHTMLProperties(externalLinks as Array<Record<string, unknown>>, true);
            if (links.length > 0) {

              links.forEach((link: PopupProperty) => {
                this.dataSource.data.push({
                  name: link.authenticatedDownloadFileName !== '' ? link.authenticatedDownloadFileName : link.name,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  format: link.formatType,
                  originalFormat: '',
                  position: index++,
                  url: link.values[0] as string,
                  type: 'feature',
                  origin: link,
                });
              });

            }
          });
        }
      })
        .finally(() => {
          this.dataSource.sort = this.matSort;
          this.dataSource.sortData = (data: Array<FormatElement>, sort: Sort) => this.sortPredicate(data, sort);
          this.dataSource.paginator = this.matPaginator;
          this.spinner = false;
        });
    } else {
      this.spinner = false;
    }
  }

  public ngAfterViewInit(): void {
    this.dataSource.sort = this.matSort;
    this.dataSource.sortData = (data: Array<FormatElement>, sort: Sort) => this.sortPredicate(data, sort);
    this.dataSource.paginator = this.matPaginator;
  }

  public close(): void {
    this.data.close();
  }

  public isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  public toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.filteredData);
  }


  public checkboxLabel(row?: FormatElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  /**
   * The function `download` checks if the given element is a feature and has an origin, and if so, it
   * downloads the feature; otherwise, it downloads the element's format using the download service.
   * @param {MouseEvent} event - The event parameter is of type MouseEvent, which represents a mouse
   * event that occurred. It can be used to access information about the event, such as the target
   * element or the mouse coordinates.
   * @param {FormatElement} elem - The `elem` parameter is of type `FormatElement`.
   */
  public download(event: MouseEvent, elem: FormatElement): void {
    if (this.isElemFeature(elem) && elem.origin !== null) {
      this.downloadFeature(event, elem.origin);
    } else {
      this.downloadService(elem.format);
    }
  }

  /**
   * The function `copyUrl` copies the URL of a given `FormatElement` object, either from its `url`
   * property if it is a feature, or from its `originalFormat` property if it is a service.
   * @param {FormatElement} elem - The `elem` parameter is of type `FormatElement`.
   */
  public copyUrl(elem: FormatElement): void {
    if (this.isElemFeature(elem)) {
      this.copyUrlFeature(elem.url);
    } else {
      this.copyUrlService(elem.originalFormat);
    }
  }

  public downloadUrls(): void {

    const paramOutput = this.getOutputFormatParam();
    const promiseArray: Array<Promise<FormatElement>> = [];

    this.spinner = true;

    this.selection.selected.forEach(elem => {

      if (elem.type !== 'CONVERTED') {

        // set new format
        if (paramOutput !== undefined) {
          // change format on parameter value
          paramOutput.value = elem.originalFormat;

        }

        promiseArray.push(
          this.getCsvElement(elem)
        );
      }

    });

    void Promise.all(promiseArray).then(results => {
      this.downloadFile(results, this.serviceName.replace(/\s/g, ''));
      this.spinner = false;
    });

  }

  /**
   * It loops through the selected rows and calls the download function for each one.
   */
  public downloadSelected(event: MouseEvent): void {
    this.spinner = true;
    // fake deplay
    setTimeout(() => {
      this.selection.selected.forEach(elem => {
        this.download(event, elem);
      });

      this.spinner = false;
    }, 1000);
  }


  /**
   * The function clears the selection, waits 100 milliseconds, and then sets the dataSource's filter to
   * the value of the input element
   * @param {KeyboardEvent} event - KeyboardEvent - This is the event that is triggered when the user
   * types in the search box.
   */
  public applyFilter(event: KeyboardEvent): void {
    this.selection.clear();
    setTimeout(() => {
      this.dataSource.filter = String((event.target as HTMLInputElement).value).trim().toUpperCase();
    }, 100);
  }

  /**
 * It copies the URL of the current page to the clipboard
 * @param {string} format - The format of the output.
 */
  private copyUrlService(format: string): void | string {
    const paramOutput = this.getOutputFormatParam();

    // set new format
    if (paramOutput !== undefined) {
      paramOutput.value = format;
    }

    const copyAction = this.dataConfigurable.actions.find(a => a.type === DataConfigurableActionType.LINK);
    copyAction?.doAction();

  }

  private copyUrlFeature(url: string | null): void | string {
    if (null != url) {
      // try to add to clipboard (fails in some ie)
      setTimeout(() => {

        let success = false;
        try {
          success = this.copyToClipboard(url);
        } finally {
          if (success) {
            this.notifier.sendNotification('Successfully copied URL', 'Close', 'success', 5000);
          } else {
            this.notifier.sendNotification('Failed to copy URL', 'Close', 'error', 5000);
          }
        }
      }, 100);
    }
  }

  private copyToClipboard(val: string): boolean {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    const success = document.execCommand('copy');
    document.body.removeChild(selBox);
    return success;
  }

  /**
   * The function downloads the data from the distribution if the format is available, otherwise it
   * downloads the data from the originator URL
   * @param {string} format - the format of the file to download
   */
  private downloadService(format: string): void {

    const distributionFormat = this.distributionFormat.find(e => { return e.getFormat() === format; });

    if (distributionFormat !== undefined) {
      // download from distribution
      const paramValues = (null === this.parameterValues) ? [] : this.parameterValues;
      this.executionService.downloadDistributionFormat(this.distributionDetails, distributionFormat, paramValues, true);
    } else {

      // download from URL (default output format)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      void this.dataConfigurable.getOriginatorUrl().then(url => {
        if (url !== null) {
          void this.http.get(url, { responseType: 'blob' }).subscribe((blob) => {
            this.executionService.openDownload(blob, 'raw_service_response_' + this.serviceName);
          });
        }
      })
        .finally(() => {
        });
    }
  }


  private downloadFeature(event: MouseEvent, item: PopupProperty): void {
    event.preventDefault();

    GeoJSONHelper.popupClick(event, this.executionService, this.authentificationClickService, item);
  }


  /**
   * It returns a promise that resolves to a `FormatElement` object
   * @param {FormatElement} elem - FormatElement - this is the element that is being passed in from the
   * dataConfigurable.getFormatElements() function.
   * @returns A promise that resolves to a FormatElement.
   */
  private getCsvElement(elem: FormatElement): Promise<FormatElement> {
    const promise: Promise<FormatElement> = new Promise((resolve) => {

      if (this.isElemFeature(elem)) {
        resolve(elem);
      } else {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        void (this.dataConfigurable.getOriginatorUrl() as Promise<null | string>).then((url) => {
          const result = {
            name: '',
            position: 0,
            format: elem.format,
            originalFormat: elem.originalFormat,
            url: url ?? '',
            type: '',
            origin: null,
          };
          resolve(result);
        });
      }
    });

    return promise;
  }

  private isElemFeature(elem: FormatElement): boolean {
    return elem.type === 'feature' && elem.origin !== null;
  }

  private getServiceTableData(): void {
    let name = this.dataConfigurable.name;

    // eslint-disable-next-line max-len
    if (this.distributionDetails.isOnlyDownloadable) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const url = this.distributionDetails.getDownloadURL();
      name = url.substring(url.lastIndexOf('/') + 1);
    }

    if (this.distributionFormat.length > 0) {
      this.dataSource.data = this.distributionFormat.map((e, index): FormatElement => ({
        name: 'raw service response',
        format: e.getFormat(),
        originalFormat: e.getOriginalFormat(),
        position: index,
        url: '',
        type: e.getType(),
        origin: null,
      }));
    } else {
      const defaultOutputFormat = this.getOutputFormatParam() as ParameterValue;
      this.dataSource.data.push({
        name: name,
        format: defaultOutputFormat.value,
        originalFormat: defaultOutputFormat.value,
        position: 0,
        url: '',
        type: 'original',
        origin: null
      });
    }
  }

  private getOutputFormatParam(): ParameterValue | undefined {
    const parameterDefinitions = this.dataConfigurable.getParameterDefinitions();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const outputFormatParameter = parameterDefinitions.getParameterByProperty(ParameterProperty.OUTPUT_FORMAT as ParameterProperty);

    if (outputFormatParameter !== undefined) {

      // retrieve parameter name
      // eslint-disable-next-line max-len
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const outputFormatFromFieldName = parameterDefinitions.getParameterByProperty(ParameterProperty.OUTPUT_FORMAT).name;

      return this.parameterValues.find(param =>
        param.name === outputFormatFromFieldName
      );
    }
  }

  private sortPredicate(data: Array<FormatElement>, sort: Sort): Array<FormatElement> {

    let sortedData = data.slice();

    if (sort.active && sort.direction !== '') {
      sortedData = data.sort((a: FormatElement, b: FormatElement) => {
        const isAsc = (sort.direction === 'asc');
        const sortName = sort.active;
        const propA = (a[sortName] as string).toUpperCase();
        const propB = (b[sortName] as string).toUpperCase();

        let isALessThanB: boolean;
        switch (true) {
          case (null == propA): // Test for null values
            isALessThanB = true;
            break;
          case (null == propB): // Test for null values
            isALessThanB = false;
            break;
          default: // default tests primative string value
            isALessThanB = propA < propB;
            break;
        }
        return (isALessThanB ? -1 : 1) * (isAsc ? 1 : -1);
      });
    }
    return sortedData;
  }

  /**
   * It takes an array of objects, converts it to a CSV string, and then downloads it
   * @param data - Array<FormatElement> - this is the data that will be converted to CSV
   * @param [filename=data] - The name of the file to be downloaded.
   */
  private downloadFile(data: Array<FormatElement>, filename = 'data'): void {
    const csvData = this.convertToCSV(data, ['format', 'url']);
    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });

    this.executionService.openDownload(blob, filename);
  }

  /**
   * It takes an array of objects and an array of strings as parameters and returns a string
   * @param objArray - The array of objects that you want to convert to CSV.
   * @param headerList - Array of strings that are the headers of the CSV file.
   * @returns A string
   */
  private convertToCSV(objArray: Array<FormatElement>, headerList: Array<string>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const array: Array<FormatElement> = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    const separator = ';';
    let str = '';
    let row = '';

    headerList.forEach((e, i) => {
      row += e + separator;
    });
    row = row.slice(0, -1);
    str += row + '\r\n';

    array.forEach((e, i) => {
      let line = '';
      headerList.forEach((h, hi) => {
        if (hi > 0) {
          line += separator;
        }
        line += (array[i][h] as string);
      });
      str += line + '\r\n';
    });
    return str;
  }

}
