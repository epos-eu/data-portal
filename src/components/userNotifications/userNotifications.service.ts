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
import { UserNotification } from 'components/userNotifications/userNotification';
import { Observable } from 'rxjs';
import { Button } from 'utility/button';

/**
 * Interface of the service.
 *
 * Must be an abstract class because an adapter needs to use a factory method, which demands this.
 */
export abstract class UserNotificationService {
  abstract sendWarningNotification(notificationText: string, showFor?: number, action?: Button): void;
  abstract sendErrorNotification(notificationText: string, showFor?: number, action?: Button): void;
  abstract sendPositiveNotification(notificationText: string, showFor?: number, action?: Button): void;
  abstract listenForNotification(): Observable<UserNotification>;
}
