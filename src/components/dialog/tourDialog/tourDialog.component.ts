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

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataSearchConfigurablesService } from 'pages/dataPortal/services/dataSearchConfigurables.service';
import { LoadingService } from 'services/loading.service';
import { TourService } from 'services/tour.service';
import { DialogData } from '../baseDialogService.abstract';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';

@Component({
  selector: 'app-tour-dialog',
  templateUrl: './tourDialog.component.html',
  styleUrls: ['./tourDialog.component.scss']
})
export class TourDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialogRef: MatDialogRef<TourDialogComponent>,
    private readonly tourService: TourService,
    private readonly configurables: DataSearchConfigurablesService,
    private readonly loadingService: LoadingService,
    private readonly panelsEvent: PanelsEmitterService,
  ) { }

  public handleClose(): void {
    this.dialogRef.close();
  }

  public handleShowAgain(checked: boolean): void {
    if (checked) {
      // Don't show again
      localStorage.setItem('tourCompleted', 'true');
    } else {
      // Keep showing
      localStorage.setItem('tourCompleted', 'false');
    }
  }

  public handleStartTour(event: Event): void {
    this.tourService.startEposFiltersTour(event);
    // }, 100);
    this.data.close();
    this.panelsEvent.invokeTablePanelClose.emit();
    this.panelsEvent.invokeGraphPanelClose.emit();
  }
}
