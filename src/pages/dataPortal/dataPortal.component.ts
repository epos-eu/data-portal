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
import { DataSearchConfigurablesServiceResource } from './modules/dataPanel/services/dataSearchConfigurables.service';
import { Subscription } from 'rxjs';
import { ResultsPanelService } from 'pages/dataPortal/services/resultsPanel.service';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';
import { environment } from 'environments/environment';
import { MapInteractionService } from 'utility/eposLeaflet/services/mapInteraction.service';
import { MatButtonToggle } from '@angular/material/button-toggle';
import { CONTEXT_RESOURCE } from 'api/api.service.factory';
import { DialogService } from 'components/dialog/dialog.service';

@OnAttachDetach()
@Unsubscriber('subscriptions')
@Component({
  selector: 'app-data-portal',
  templateUrl: './dataPortal.component.html',
  styleUrls: ['dataPortal.component.scss']
})
export class DataPortalComponent implements AfterViewInit {

  @ViewChild('dataPanel') dataPanel: ElementRef;
  @ViewChild('dataPanelButton') dataPanelButton: MatButtonToggle;
  @ViewChild('dataPanelSidenav') dataPanelSidenav: MatSidenav;
  @ViewChild('tablePanelSidenav') tablePanelSidenav: MatSidenav;
  @ViewChild('graphPanelSidenav') graphPanelSidenav: MatSidenav;
  public tableInResults = true;
  public graphInResults = true;
  public checkIsNewSelected = true;

  public currentScreenWidth;
  public leftNavWidth;
  public counterData = 0;
  public counterTable = 0;
  public counterGraph = 0;

  public hasModuleData = false;

  public hasHiddenMarker = false;

  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  private updateTimeout: NodeJS.Timeout;

  constructor(
    private readonly configurables: DataSearchConfigurablesServiceResource,
    private readonly panelsEvent: PanelsEmitterService,
    private readonly resultPanelService: ResultsPanelService,
    private readonly localStoragePersister: LocalStoragePersister,
    private readonly mapInteractionService: MapInteractionService,
    private readonly dialogService: DialogService,
    private renderer: Renderer2,
  ) {

    this.hasModuleData = environment.modules.data;

    this.leftNavWidth = this.getWidthLeftPanels();

    this.subscriptions.push(

      this.resultPanelService.counterDataObs.subscribe((counter: number) => {
        this.counterData = counter;
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
        this.setDataPanel(true);
      }),

      this.panelsEvent.invokeTablePanelToggle.subscribe((itemId: string) => {

        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          // if the right sidenav is closed
          if (!this.tablePanelSidenav.opened || !this.checkIsNewSelected) {
            this.tablePanelToggle();
          }
        }, 50);
      }),

      this.panelsEvent.invokeTablePanelClose.subscribe(() => {
        void this.tablePanelSidenav.close();
        this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, JSON.stringify(false), false, LocalStorageVariables.LS_RIGHT_TOP_SIDENAV);
      }),

      this.panelsEvent.invokeGraphPanelToggle.subscribe(() => {

        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          // if the bottom sidenav is closed
          if (!this.graphPanelSidenav.opened || !this.checkIsNewSelected) {
            this.graphPanelToggle();
          }
        }, 50);
      }),

      this.panelsEvent.invokeGraphPanelOpen.subscribe((itemId: string) => {
        void this.graphPanelSidenav.open();
        this.panelsEvent.invokeGraphPanel.emit(true);
        this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, JSON.stringify(true), false, LocalStorageVariables.LS_RIGHT_BOTTOM_SIDENAV);
      }),

      this.panelsEvent.invokeGraphPanelClose.subscribe(() => {
        void this.graphPanelSidenav.close();
        this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, JSON.stringify(false), false, LocalStorageVariables.LS_RIGHT_BOTTOM_SIDENAV);
      }),

      this.mapInteractionService.featureOnlayerToggle.subscribe((featureOnLayer: Map<string, Array<number> | string | boolean>) => {
        this.checkHiddenMarkerOnMap();
      }),

    );

    this.currentScreenWidth = window.innerWidth;
  }

  ngAfterViewInit(): void {
    this.currentScreenWidth = window.innerWidth;

    setTimeout(() => {

      if (this.hasModuleData) {

        // leftSidenav opened at first time
        this.dataPanelSidenav.opened = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_LEFT_TOP_SIDENAV) === 'false' ? false : true;
        this.setDataPanel(this.dataPanelSidenav.opened);
        // rightSidenav and bottomSidenav closed at first time
        this.tablePanelSidenav.opened = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_RIGHT_TOP_SIDENAV) === 'true' ? true : false;

        this.graphPanelSidenav.opened = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_RIGHT_BOTTOM_SIDENAV) === 'true' ? true : false;
      }

      this.checkHiddenMarkerOnMap();

      // When initializing the page, reset the state of the table and graph dialogs
      this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, false, false, LocalStorageVariables.LS_TABLE_DIALOG_OPENED);
      this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, false, false, LocalStorageVariables.LS_GRAPH_DIALOG_OPENED);
    }, 100);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  @HostListener('window:resize', ['$event'])
  public onWindowResize(): void {
    this.currentScreenWidth = window.innerWidth;
    this.leftNavWidth = this.getWidthLeftPanels();
  }

  public dataPanelStatusChange(closing: boolean): void {
    this.leftNavWidth = this.getWidthLeftPanels();
  }

  public filterPanelToggle(): void {
    void this.dataPanelSidenav.toggle().then(() => {
      this.setDataPanel(this.dataPanelSidenav.opened);
    });
  }

  /**
   * It toggles the right sidenav and emits an event.
   *
   * If the table panel dialog is open, it will close it and skip the rest of the function.
   */
  public tablePanelToggle(): void {
    // If the table dialog is open
    if (this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_TABLE_DIALOG_OPENED)) {
      this.panelsEvent.invokeTableDialogClose.emit();
      // Don't open the table panel if closing the dialog
      return;
    }

    void this.tablePanelSidenav.toggle().then(() => {
      this.panelsEvent.invokeTablePanel.emit();
      this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, JSON.stringify(this.tablePanelSidenav.opened), false, LocalStorageVariables.LS_RIGHT_TOP_SIDENAV);
    });
    this.checkHiddenMarkerOnMap();
  }

  public graphPanelToggle(): void {
    // If the graph dialog is open
    if (this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_GRAPH_DIALOG_OPENED)) {
      this.panelsEvent.invokeGraphDialogClose.emit();
      // Don't open the graph panel if closing the dialog
      return;
    }

    void this.graphPanelSidenav.toggle().then(() => {
      this.panelsEvent.invokeGraphPanel.emit(this.graphPanelSidenav.opened);
      this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, JSON.stringify(this.graphPanelSidenav.opened), false, LocalStorageVariables.LS_RIGHT_BOTTOM_SIDENAV);
    });
  }

  public detachPanel(type: string): void {

    switch (type) {
      case 'table':
        this.tablePanelToggle();
        void this.dialogService.openTablePanel();
        break;

      case 'graph':
        this.graphPanelToggle();
        void this.dialogService.openGraphPanel();
        break;

      default:
        break;
    }
  }

  /**
   * The function returns the width of the left panels based on whether the data panel is opened.
   * @returns a number.
   */
  private getWidthLeftPanels(): number {
    if (this.dataPanelSidenav !== undefined && this.dataPanelSidenav.opened) {
      return (this.dataPanel.nativeElement as HTMLElement).offsetWidth;
    }

    return 0;
  }

  private checkHiddenMarkerOnMap(): void {

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let dataSearchToggleOnMap: Array<string> = JSON.parse(this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_TOGGLE_ON_MAP) as string || '[]');

    // if no layer selected => remove all dataSearchToggleOnMap records
    setTimeout(() => {
      if (this.configurables.getAll().length === 0) {
        dataSearchToggleOnMap = [];
        this.localStoragePersister.set(
          LocalStorageVariables.LS_CONFIGURABLES,
          JSON.stringify(dataSearchToggleOnMap),
          false,
          LocalStorageVariables.LS_TOGGLE_ON_MAP
        );
      }

      this.hasHiddenMarker = dataSearchToggleOnMap.length !== 0 ? true : false;
    }, 1000);

  }

  private setDataPanel(open = true): void {
    if (open) {
      void this.dataPanelSidenav.open();
      // change map context to data
      this.mapInteractionService.bboxContext.set(CONTEXT_RESOURCE);
    } else {
      void this.dataPanelSidenav.close();
    }
    this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, JSON.stringify(this.dataPanelSidenav.opened), false, LocalStorageVariables.LS_LEFT_TOP_SIDENAV);
  }
}
