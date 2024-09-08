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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationService } from './notification.service';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {

  @Input() showMessage = true;
  @Input() type = NotificationService.TYPE_INFO;
  @Input() id = '';
  @Input() checkShowAgain = false;
  @Input() title = '';
  @Input() message = '';

  @Output() showMessageEvent = new EventEmitter<boolean>();

  public icon = 'info';

  constructor(
    private readonly localStoragePersister: LocalStoragePersister,
  ) {
  }
  ngOnInit(): void {
    switch (this.type) {
      case NotificationService.TYPE_INFO:
        this.icon = 'info';
        break;
      case NotificationService.TYPE_WARNING:
        this.icon = 'warning';
        break;
      case NotificationService.TYPE_ERROR:
        this.icon = 'error';
        break;
    }
  }

  public handleShowAgain(checked: boolean): void {
    if (this.checkShowAgain) {
      if (checked) {
        // Don't show again
        this.localStoragePersister.set(this.id, false);
      } else {
        // Keep showing
        this.localStoragePersister.set(this.id, true);
      }
    }
  }

  public handleClose(): void {
    this.showMessage = false;
    this.showMessageEvent.emit(false);
  }

}
