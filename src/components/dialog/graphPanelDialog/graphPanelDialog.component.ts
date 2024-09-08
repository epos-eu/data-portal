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
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { DialogData } from '../baseDialogService.abstract';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BaseDialogComponent } from '../baseDialog/baseDialog.component';
import { LocalStoragePersister } from '../../../services/model/persisters/localStoragePersister';
import { PanelsEmitterService } from '../../../services/panelsEventEmitter.service';
import { LocalStorageVariables } from '../../../services/model/persisters/localStorageVariables.enum';

export interface DetailsDataIn {
  title: string;
}

@Component({
  selector: 'app-graph-panel-dialog',
  templateUrl: './graphPanelDialog.component.html',
})
export class GraphPanelDialogComponent implements OnInit {

  // Hold a reference to the base dialog
  @ViewChild(BaseDialogComponent) baseDialogComponent: BaseDialogComponent;

  public title: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<DetailsDataIn>,
    private readonly localStoragePersister: LocalStoragePersister,
    private readonly panelsEvent: PanelsEmitterService,
  ) {
    this.title = this.data.dataIn.title;
  }

  ngOnInit(): void {
    // Set the local storage variable to indicate that the graph dialog is opened
    this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, true, false, LocalStorageVariables.LS_GRAPH_DIALOG_OPENED);

    // Subscribe to the event to close the dialog
    this.panelsEvent.invokeGraphDialogClose.subscribe(() => {
      this.close();
    });
  }

  /**
   * Close the dialog
   */
  public close(): void {
    this.onClose();
    this.baseDialogComponent.data.close();
  }

  /**
   * Updates the local storage variable to indicate that the graph dialog is closed.
   */
  public onClose() {
    this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, false, false, LocalStorageVariables.LS_GRAPH_DIALOG_OPENED);
  }
}
