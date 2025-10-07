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
import { BaseUrl } from 'api/webApi/classes/baseurl.interface';
import { Rest } from 'api/webApi/classes/rest.interface';
import { UrlBuilder } from 'api/webApi/classes/urlBuilder.interface';
import { JSONEnvironmentFactory } from 'api/webApi/data/environments/impl/jsonEnvironmentFactory';
import { EnvironmentType } from 'api/webApi/data/environments/environmentType.interface';

/**
 * Responsible for triggering calls to the webApi module "environment" endpoints.
 * - Accepts criteria from caller
 * - Triggers the webApi call via the {@link Rest} class
 * - Processes response data into internal objects
 * - Returns the appropriate response to the caller
 */
export class DevEnvironmentTypeApi {
  // path
  public static readonly PROCESSING = 'processing';
  private static readonly SEARCH = 'search';

  constructor(
    private readonly baseUrl: BaseUrl,
    private readonly rest: Rest,
  ) { }

  /**
   * Get (all) environments for user.
   * @param user
   */
  public getEnvironmentTypes(): Promise<Array<EnvironmentType>> {

    const urlBulder: UrlBuilder = this.baseUrl.urlBuilder()
      .addPathElements(DevEnvironmentTypeApi.PROCESSING, DevEnvironmentTypeApi.SEARCH);

    return this.rest
      .get(urlBulder.build()).then(json => {
        return JSONEnvironmentFactory.jsonToEnvironmentTypeArray(json);
      });
    // }
  }

}
