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
import { AfterViewInit, Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { OnAttachDetach } from 'decorators/onAttachDetach.decorator';
import { DataSearchConfigurablesService } from './services/dataSearchConfigurables.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ResultsPanelService } from 'pages/dataPortal/services/resultsPanel.service';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { DataConfigurableDataSearchI } from 'utility/configurablesDataSearch/dataConfigurableDataSearchI.interface';
import { DataConfigurableDataSearch } from 'utility/configurablesDataSearch/dataConfigurableDataSearch';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';
import { environment } from 'environments/environment';

@OnAttachDetach()
@Unsubscriber('subscriptions')
@Component({
  selector: 'app-data-portal',
  templateUrl: './dataPortal.component.html',
  styleUrls: ['dataPortal.component.scss']
})
export class DataPortalComponent implements AfterViewInit {

  @ViewChild('element') element: ElementRef;
  @ViewChild('filterPanel') filterPanel: MatSidenav;
  @ViewChild('tablePanel') tablePanel: MatSidenav;
  @ViewChild('graphPanel') graphPanel: MatSidenav;
  @ViewChild('environmentPanel') environmentPanel: ElementRef;
  @ViewChild('environmentPanelButton') environmentPanelButton: ElementRef;
  public tableInResults = true;
  public graphInResults = true;
  public checkIsNewSelected = true;
  public visPanelConfigurablesArraySource = new BehaviorSubject<Array<DataConfigurableDataSearchI>>([]);
  public currentScreenWidth;
  public leftNavWidth;
  public counterData = 0;
  public counterEnvironment = 0;
  public counterTable = 0;
  public counterGraph = 0;

  public hasModuleData = false;

  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  private updateTimeout: NodeJS.Timeout;


  constructor(
    private readonly configurables: DataSearchConfigurablesService,
    private readonly panelsEvent: PanelsEmitterService,
    private readonly resultPanelService: ResultsPanelService,
    private readonly localStoragePersister: LocalStoragePersister,
    private renderer: Renderer2,
  ) {

    this.hasModuleData = environment.modules.data;

    this.subscriptions.push(
      this.configurables.watchAll().subscribe(() => {
        this.updateConfigs();
      }),

      this.resultPanelService.counterDataObs.subscribe((counter: number) => {
        this.counterData = counter;
      }),

      this.resultPanelService.counterEnvironmentObs.subscribe((counter: number) => {
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          this.counterEnvironment = counter;
        }, 50);
      }),

      this.resultPanelService.counterTableObs.subscribe((counter: number) => {
        this.counterTable = counter;
      }),

      this.resultPanelService.counterGraphObs.subscribe((counter: number) => {
        this.counterGraph = counter;
      }),

      this.panelsEvent.invokeNewSelected.subscribe((newSelected: boolean) => {
        this.checkIsNewSelected = newSelected;
      }),

      this.panelsEvent.invokeDataPanelOpen.subscribe(() => {
        void this.filterPanel.open();
      }),

      this.panelsEvent.invokeTablePanelToggle.subscribe((itemId: string) => {

        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          // if the right sidenav is closed
          if (!this.tablePanel.opened || !this.checkIsNewSelected) {
            this.tablePanelToggle();
          }
        }, 50);
      }),

      this.panelsEvent.invokeTablePanelClose.subscribe(() => {
        void this.tablePanel.close();
        this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, JSON.stringify(false), false, LocalStorageVariables.LS_RIGHT_TOP_SIDENAV);
      }),

      this.panelsEvent.invokeGraphPanelToggle.subscribe(() => {

        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          // if the bottom sidenav is closed
          if (!this.graphPanel.opened || !this.checkIsNewSelected) {
            this.graphPanelToggle();
          }
        }, 50);
      }),

      this.panelsEvent.invokeGraphPanelOpen.subscribe((itemId: string) => {
        void this.graphPanel.open();
        this.panelsEvent.invokeGraphPanel.emit(true);
        this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, JSON.stringify(true), false, LocalStorageVariables.LS_RIGHT_BOTTOM_SIDENAV);
      }),

      this.panelsEvent.invokeGraphPanelClose.subscribe(() => {
        void this.graphPanel.close();
        this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, JSON.stringify(false), false, LocalStorageVariables.LS_RIGHT_BOTTOM_SIDENAV);
      }),

    );

    this.currentScreenWidth = window.innerWidth;
  }

  ngAfterViewInit(): void {
    this.currentScreenWidth = window.innerWidth;

    setTimeout(() => {

      if (this.hasModuleData) {
        // leftSidenav opened at first time
        this.filterPanel.opened = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_LEFT_TOP_SIDENAV) === 'false' ? false : true;

        // rightSidenav and bottomSidenav closed at first time
        this.tablePanel.opened = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_RIGHT_TOP_SIDENAV) === 'true' ? true : false;

        this.graphPanel.opened = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_RIGHT_BOTTOM_SIDENAV) === 'true' ? true : false;
      }

    }, 100);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @HostListener('window:resize', ['$event'])
  public onWindowResize(): void {
    this.currentScreenWidth = window.innerWidth;
    this.leftNavWidth = (this.element.nativeElement as HTMLElement).offsetWidth;
  }

  public filterPanelStatusChange(closing: boolean): void {
    if (closing) {
      this.leftNavWidth = 0;
    } else {
      this.leftNavWidth = (this.element.nativeElement as HTMLElement).offsetWidth;
    }
  }

  public filterPanelToggle(): void {
    void this.filterPanel.toggle().then(() => {
      this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, JSON.stringify(this.filterPanel.opened), false, LocalStorageVariables.LS_LEFT_TOP_SIDENAV);
    });
  }

  /**
   * It toggles the right sidenav and emits an event
   */
  public tablePanelToggle(): void {
    void this.tablePanel.toggle().then(() => {
      this.panelsEvent.invokeTablePanel.emit();
      this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, JSON.stringify(this.tablePanel.opened), false, LocalStorageVariables.LS_RIGHT_TOP_SIDENAV);
    });
  }

  public graphPanelToggle(): void {
    void this.graphPanel.toggle().then(() => {
      this.panelsEvent.invokeGraphPanel.emit(this.graphPanel.opened);
      this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, JSON.stringify(this.graphPanel.opened), false, LocalStorageVariables.LS_RIGHT_BOTTOM_SIDENAV);
    });
  }

  /**
   * Updates the visulisation configurables array source with the selected item, or an empty array if nothing is
   * selected
   */
  private updateConfigs(): void {
    const allConfigurables = this.configurables.getAll().slice();
    this.ensureReloadFuncSet(allConfigurables);
    this.visPanelConfigurablesArraySource.next(allConfigurables);
  }

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
}
