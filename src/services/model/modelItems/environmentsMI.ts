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
import { Environment } from 'api/webApi/data/environments/environment.interface';
import { ModelItem } from './modelItem';
import { EnvironmentService } from 'services/environment.service';

/**
 * A {@link ModelItem} that holds an array of {@link Environment} items.
 *
 */
export class EnvironmentsMI extends ModelItem<null | Array<Environment>> {
  constructor(
  ) {
    super(null);
  }

  /**
   * Refreshes the {@link Environment}s associated with this user by calling out to the API
   * and replacing the items currently held.
   */
  public refresh(): Promise<void> {
    if (this.initialised) {
      this.set(null);
      // fetch from api
      const environmentService = this.services.EnvironmentService as EnvironmentService;
      return environmentService.getAllEnvironments()
        .then((environments: Array<Environment>) => {
          this.set(environments);
        });
    } else {
      return Promise.resolve();
    }
  }
}
