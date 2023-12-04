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
import { ModelItem } from './modelItem';
import { AAAIUser } from 'api/aaai/aaaiUser.interface';
import { AaaiService } from 'api/aaai.service';

/**
 * A {@link ModelItem} that holds a {@link AAAIUser}.
 */
export class UserMI extends ModelItem<null | AAAIUser> {

  constructor(
  ) {
    super(null);

    this.setInitFunction((modelItem: ModelItem<AAAIUser>) => {
      return new Promise((resolve) => {
        const aaaiService = this.getService('AaaiService') as AaaiService;
        // set current
        this.set(aaaiService.getUser());
        // on init, set up a watch
        aaaiService.watchUser().subscribe((aaaiUser: null | AAAIUser) => {
          if (aaaiUser !== this.get()) {
            this.set(aaaiUser);
          }
        });
        resolve();
      });
    });
  }
}
