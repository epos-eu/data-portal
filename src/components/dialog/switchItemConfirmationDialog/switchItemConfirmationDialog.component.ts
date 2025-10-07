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
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SwitchDistributionItemService } from 'services/switchDistributionItem.service';
import { DialogData } from '../baseDialogService.abstract';

export interface ConfirmationDataIn {
  dialogTitle: string;
  addTofavouriteAndContinueButtonCssClass: string;
  expandedElementName: string;
  continueButtonHtml: string;
}

@Component({
  selector: 'app-switch-item-confirmation-dialog',
  templateUrl: './switchItemConfirmationDialog.component.html',
  styleUrls: ['./switchItemConfirmationDialog.component.scss', '../../baseResultsPanel/baseResultsPanel.component.scss']
})
export class SwitchItemConfirmationDialogComponent{

  public noShowAgain: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<ConfirmationDataIn, boolean>,
    private switchDistributionItem: SwitchDistributionItemService
  ) {
    this.noShowAgain = false;
  }

  public setCheckbox(): void {
    this.setNoShowAgain(this.noShowAgain);
  }

  public setNoShowAgain(noShowAgain: boolean){
    this.switchDistributionItem.setNoShowAgain(noShowAgain);
  }

  public favouriteAndContinue(): void {
    this.close(true);
  }
  public continue(): void {
    this.close(false);
  }

  private close(confirmed: boolean): void {
    this.data.dataOut = confirmed;
    this.data.close();
  }

}
