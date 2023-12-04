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
import { Rest } from 'api/webApi/classes/rest.interface';
import { BaseUrl } from 'api/webApi/classes/baseurl.interface';
import { DetailsApi } from 'api/webApi/classes/detailsApi.interface';
import { DistributionDetails } from '../../data/distributionDetails.interface';
import { DistributionSummary } from '../../data/distributionSummary.interface';
import { JSONDistributionFactory } from 'api/webApi/data/impl/jsonDistributionFactory';

/**
 * Responsible for triggering calls to the webApi module "details" endpoint.
 * - Accepts criteria from caller
 * - Triggers the webApi call via the {@link Rest} class
 * - Processes response data into internal objects
 * - Returns the appropriate response to the caller
 */
export class DevDetailsApi implements DetailsApi {

  constructor(private readonly baseUrl: BaseUrl, private readonly rest: Rest) { }


  public getDetails(summary: DistributionSummary): Promise<null | DistributionDetails> {
    return this.getDetailsById(summary.getIdentifier());
  }

  public getDetailsById(idIn: string): Promise<null | DistributionDetails> {

    const url = this.buildDetailsURL(idIn);

    return this.rest
      .get(url)
      .then((json: Record<string, unknown>) => {
        const details = JSONDistributionFactory.jsonToDistributionDetails(json);

        if (details.isEmpty()) {
          return Promise.reject();
        }

        return Promise.resolve(details.get());
      });
  }

  private buildDetailsURL(id: string): string {

    return this.baseUrl.urlBuilder().addPathElements('details')
      .addParameter('id', id).build();
  }
}
