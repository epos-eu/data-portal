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
import {
  MatSnackBarRef,
  MAT_SNACK_BAR_DATA,
} from '@angular/material/snack-bar';
import { NotificationService } from 'services/notification.service';
import { ISnackbar } from './notification.interface';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {

  public typeSuccess = NotificationService.TYPE_SUCCESS;
  public typeInfo = NotificationService.TYPE_INFO;
  public typeWarning = NotificationService.TYPE_WARNING;
  public typeError = NotificationService.TYPE_ERROR;

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: ISnackbar,
    private snackbarRef: MatSnackBarRef<NotificationComponent>
  ) { }

  public handleClose(): void {
    this.snackbarRef.dismiss();
  }
}
