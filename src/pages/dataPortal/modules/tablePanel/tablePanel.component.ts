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
import { DataSearchConfigurablesServiceResource } from '../dataPanel/services/dataSearchConfigurables.service';
import { Subject, Subscription } from 'rxjs';
import { ResultsPanelService } from 'pages/dataPortal/services/resultsPanel.service';
import { DataConfigurableI } from 'utility/configurables/dataConfigurableI.interface';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { UnparseData } from 'ngx-papaparse/lib/interfaces/unparse-data';
import { Papa } from 'ngx-papaparse';
import { TableExportObject } from './tableDisplay/tableDisplay.component';
import { NotificationService } from 'services/notification.service';
import { MapInteractionService } from 'utility/eposLeaflet/services/mapInteraction.service';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { DataConfigurableDataSearchI } from 'utility/configurablesDataSearch/dataConfigurableDataSearchI.interface';
import { DataConfigurableDataSearch } from 'utility/configurablesDataSearch/dataConfigurableDataSearch';
import { DataSearchConfigurablesService } from 'pages/dataPortal/services/dataSearchConfigurables.service';
import { CONTEXT_RESOURCE } from 'api/api.service.factory';

@Unsubscriber('subscriptions')
@Component({
  selector: 'app-table-panel',
  templateUrl: './tablePanel.component.html',
  styleUrls: ['./tablePanel.component.scss'],
})

export class TablePanelComponent implements OnInit {
  /** The full Array of {@link DataConfigurables} from the pinned and selected items. */
  @Input() displayChangedSource: Subject<void>;
  @Input() onDialogComponent: boolean = false;
  /** Output observable to close the sidenav from the graph visulisation component */
  @Output() closeSideNav = new EventEmitter<void>();

  public currentDataConfigurables = new Array<DataConfigurableI>();

  public showSpinner = false;
  public selectedIndex = 0;
  public layerId: string;

  public favouritesList: { [key: string]: boolean } = {};
  public resourcesList: { [key: string]: boolean } = {};
  public hiddenMarkerOnMapList: { [key: string]: boolean } = {};

  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(
    private readonly configurables: DataSearchConfigurablesServiceResource,
    private readonly resultPanelService: ResultsPanelService,
    private readonly panelsEvent: PanelsEmitterService,
    private readonly notificationService: NotificationService,
    private readonly parser: Papa,
    private readonly mapInteractionService: MapInteractionService,
    private readonly localStoragePersister: LocalStoragePersister,

  ) { }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public closeNav(): void {
    this.closeSideNav.emit();
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

      this.configurables.watchAll().subscribe(() => {
        this.configurablesExecute(this.configurables, CONTEXT_RESOURCE);
      }),

      this.mapInteractionService.featureOnlayerToggle.subscribe((featureOnLayer: Map<string, Array<number> | string | boolean>) => {
        const layerId = featureOnLayer.get('layerId') as string;

        this.checkHiddenMarkerOnMap(layerId);
      }),

      this.panelsEvent.invokeTablePanelToggle.subscribe((id: string) => {
        this.selectedIndex = this.currentDataConfigurables.findIndex(tab => tab.id === id);
      })
    );
  }

  /**
* Updates the visulisation configurables array source with the selected item, or an empty array if nothing is
* selected
*/
  private configurablesExecute(configurables: DataSearchConfigurablesService, context: string): void {
    const allConfigurables = configurables.getAll().slice();
    this.ensureReloadFuncSet(allConfigurables, context);

    if (allConfigurables !== null) {

      // set context. TODO: move it on dataConfigurables creation logic
      allConfigurables.map(conf => {
        conf.context = context;
      });

      // Checks if service data can be displayed in a tabular format (Currently epos geoJson).
      const tabularConfigurables = allConfigurables.filter((thisConfig: DataConfigurableI) => {
        return thisConfig.isTabularable;
      });

      // remove any config that no longer exists
      const filteredConfigurables = this.currentDataConfigurables.filter((thisConfig: DataConfigurableI) => {
        return (tabularConfigurables.includes(thisConfig as DataConfigurableDataSearchI));
      });

      /** array of configurables to add */
      const configsToAdd = tabularConfigurables.filter((thisConfig: DataConfigurableI) => {
        const currentItem = this.currentDataConfigurables.find((testConfig: DataConfigurableI) => {
          return (testConfig === thisConfig);
        });
        return (currentItem == null);
      });

      const newDataArray = this.currentDataConfigurables.filter((conf) => {
        return conf.context !== context;
      });

      this.currentDataConfigurables = [...newDataArray, ...filteredConfigurables.concat(configsToAdd)];

      this.currentDataConfigurables.forEach(_c => {
        const tempId = _c.getDistributionDetails().getIdentifier();
        const conf = configurables.get(tempId);

        if (conf !== null && conf.context === context) {

          this.resourcesList[tempId] = conf.context === CONTEXT_RESOURCE;

          if (conf.isPinned()) {
            this.favouritesList[tempId] = true;
          } else {
            this.favouritesList[tempId] = false;
          }
        }
      });

      // sort array results by name
      this.currentDataConfigurables.sort((a, b) => {
        return this.sortData(a, b);
      });

      setTimeout(() => {
        if (configurables.getSelected() !== null) {
          // index to selected item
          this.selectedIndex = this.currentDataConfigurables.findIndex((thisConfig: DataConfigurableI) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            return configurables.isSelected(thisConfig.id);
          });
        }

      }, 100);
    }

    this.resultPanelService.setCounterTable(this.currentDataConfigurables.length);

  }

  private ensureReloadFuncSet(configurables: Array<DataConfigurableDataSearchI>, context: string): void {
    // ensure reset func set
    configurables.forEach((configurable: DataConfigurableDataSearchI) => {
      if (configurable instanceof DataConfigurableDataSearch) {
        configurable.setTriggerReloadFunc((configurableToUpdate: DataConfigurableDataSearch) => {
          if (context === CONTEXT_RESOURCE) {
            this.configurables.replaceOrAdd(configurableToUpdate, true);
          }
        });
      }
    });
  }

  private checkHiddenMarkerOnMap(layerId: string): void {

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dataSearchToggleOnMap: Array<string> = JSON.parse(this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_TOGGLE_ON_MAP) as string || '[]');
    let found = 0;
    dataSearchToggleOnMap.forEach(_v => {
      if (_v.split('#')[0] === layerId) {
        found++;
      }
    });
    this.hiddenMarkerOnMapList[layerId] = found !== 0 ? true : false;

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
