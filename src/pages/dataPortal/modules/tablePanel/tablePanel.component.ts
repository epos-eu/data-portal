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
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataSearchConfigurablesService } from 'pages/dataPortal/services/dataSearchConfigurables.service';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { ResultsPanelService } from 'pages/dataPortal/services/resultsPanel.service';
import { DataConfigurableI } from 'utility/configurables/dataConfigurableI.interface';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { UnparseData } from 'ngx-papaparse/lib/interfaces/unparse-data';
import { Papa } from 'ngx-papaparse';
import { TableExportObject } from './tableDisplay/tableDisplay.component';
import { NotificationService } from 'services/notification.service';

@Unsubscriber('subscriptions')
@Component({
  selector: 'app-table-panel',
  templateUrl: './tablePanel.component.html',
  styleUrls: ['./tablePanel.component.scss'],
})

export class TablePanelComponent implements OnInit {
  /** The full Array of {@link DataConfigurables} from the pinned and selected items. */
  @Input() dataConfigurablesArraySource: BehaviorSubject<Array<DataConfigurableI>>;
  @Input() displayChangedSource: Subject<void>;
  /** Output observable to close the sidenav from the graph visulisation component */
  @Output() closeSideNav = new EventEmitter<void>();

  public currentDataConfigurables = new Array<DataConfigurableI>();

  public showSpinner = false;
  public selectedIndex = 0;
  public layerId: string;

  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(
    private readonly configurables: DataSearchConfigurablesService,
    private readonly resultPanelService: ResultsPanelService,
    private readonly panelsEvent: PanelsEmitterService,
    private readonly notificationService: NotificationService,
    private readonly parser: Papa,

  ) { }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public closeNav(): void {
    this.closeSideNav.emit();
  }

  public checkFavourite(id: string): boolean | undefined {
    return this.configurables.get(id)?.isPinned();
  }

  /** Use @Papa to parse data into csv format for user download */
  public exportFile(exportTableObj: TableExportObject): void {
    const exportObjectArray: UnparseData = {
      fields: exportTableObj.headers,
      data: exportTableObj.data,
    };

    const csvData = this.parser.unparse(exportObjectArray, {
      header: true,
    });

    if (csvData != null) {
      const a = document.createElement('a');
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      a.href = url;
      a.download = `${exportTableObj.fileName}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      this.notificationService.sendNotification('Exported data will reflect the current table filters', 'x', 'info', 10000);
    }
  }

  private initSubscriptions(): void {

    this.subscriptions.push(
      this.dataConfigurablesArraySource.subscribe((dataConfigurables: Array<DataConfigurableI>) => {

        if (dataConfigurables != null) {
          /** Checks if service data can be displayed in a tabular format (Currently epos geoJson). */
          const tabularConfigurables = dataConfigurables.filter((thisConfig: DataConfigurableI) => {
            return thisConfig.isTabularable;
          });

          /** remove any config that no longer exists */
          const filteredConfigurables = this.currentDataConfigurables.filter((thisConfig: DataConfigurableI) => {
            return (tabularConfigurables.includes(thisConfig));
          });

          /** array of configurables to add */
          const configsToAdd = tabularConfigurables.filter((thisConfig: DataConfigurableI) => {
            const currentItem = this.currentDataConfigurables.find((testConfig: DataConfigurableI) => {
              return (testConfig === thisConfig);
            });
            return (currentItem == null);
          });

          this.currentDataConfigurables = filteredConfigurables.concat(configsToAdd);

          // sort array results by name
          this.currentDataConfigurables.sort((a, b) => {
            return this.sortData(a, b);
          });

          setTimeout(() => {
            if (this.configurables.getSelected() !== null) {
              // index to selected item
              this.selectedIndex = this.currentDataConfigurables.findIndex((thisConfig: DataConfigurableI) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                return this.configurables.isSelected(thisConfig.id);
              });
            }

          }, 100);
        }

        this.resultPanelService.setCounterTable(this.currentDataConfigurables.length);
      }),

      this.panelsEvent.invokeTablePanelToggle.subscribe((id: string) => {
        this.selectedIndex = this.currentDataConfigurables.findIndex(tab => tab.id === id);
      })
    );
  }

  /**
   * It sorts the data by name.
   * @param {DataConfigurableI} a - The first DataConfigurableI object.
   * @param {DataConfigurableI} b - The data to be sorted.
   * @returns Nothing.
   */
  private sortData(a: DataConfigurableI, b: DataConfigurableI) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

}
