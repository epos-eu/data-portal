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
import { Button } from 'utility/button';

export enum notificationType {
  POSITIVE,
  NEGATIVE,
  WARNING
}
export class UserNotification {
  private readonly id: string;

  constructor(
    private readonly type: notificationType,
    private readonly notificationText: string,
    private readonly showFor: number,
    private readonly action?: Button,
  ) {
    this.id = Math.random().toString(36).substring(2, 5);
  }

  public getId(): string {
    return this.id;
  }

  public getType(): string {
    const value: string = notificationType[this.type].toString().toLowerCase();
    return value;
  }

  public getNotificationText(): string {
    return this.notificationText;
  }

  public getShowFor(): number {
    return this.showFor;
  }

  public getAction(): null | Button {
    return this.action ?? null;
  }

}
