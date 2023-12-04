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
import { Component, OnInit } from '@angular/core';
import { UserNotificationService } from 'components/userNotifications/userNotifications.service';
import { UserNotification } from 'components/userNotifications/userNotification';

/**
 * A component that displays toast-like notifications when the associated service is prompted.
 */
@Component({
  selector: 'app-user-notification',
  templateUrl: 'userNotifications.component.html',
  styleUrls: ['./userNotifications.component.scss']
})
export class UserNotificationsComponent implements OnInit {
  public notificationType: string;
  public notificationText: string;
  public notificationButton: unknown;
  public notifications: Array<UserNotification> = [];
  constructor(
    private readonly userNotificationService: UserNotificationService,
  ) { }

  public ngOnInit(): void {
    this.userNotificationService.listenForNotification().subscribe((notification: UserNotification) => {
      this.notifications.push(notification);
      setTimeout(() => {
        this.hideNotification(notification.getId());
      }, notification.getShowFor());
    });
  }

  public hideNotification(id: string): void {
    this.notifications.forEach((notification, index) => {
      if (notification.getId() === id) {
        this.notifications.splice(index, 1);
      }
    });
  }
}
