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
import { Injectable } from '@angular/core';
import { NotificationService as GeneralNotificationService } from 'services/notification.service';
import { DistributionNotificationText } from '../../pages/dataPortal/enums/distributionNotification.enum';

@Injectable()
export class NotificationService extends GeneralNotificationService {

  // eslint-disable-next-line max-len
  public static MESSAGE_REFINE_DATA = DistributionNotificationText.MESSAGE_REFINE_DATA;
  public static MESSAGE_NO_DATA = DistributionNotificationText.MESSAGE_NO_DATA;
  public static MESSAGE_ERROR_HTML = DistributionNotificationText.MESSAGE_ERROR_HTML;

}
