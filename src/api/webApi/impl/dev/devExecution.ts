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
import { DistributionSummary } from 'api/webApi/data/distributionSummary.interface';
import { ExecutionApi } from 'api/webApi/classes/executionApi.interface';
import { BaseUrl } from 'api/webApi/classes/baseurl.interface';
import { Rest } from 'api/webApi/classes/rest.interface';
import { DistributionFormat } from 'api/webApi/data/distributionFormat.interface';
import { ParameterValue } from 'api/webApi/data/parameterValue.interface';
import { JSONDistributionFactory } from 'api/webApi/data/impl/jsonDistributionFactory';

/**
 * Responsible for triggering calls to the webApi module "execute" endpoint.
 * - Accepts criteria from caller
 * - Triggers the webApi call via the {@link Rest} class
 * - Processes response data into internal objects
 * - Returns the appropriate response to the caller
 */
export class DevExecutionApi implements ExecutionApi {

  // path
  private static readonly GET_ORIGINAL = 'getoriginalurl';
  // params
  private static readonly ID = 'id';
  private static readonly PARAMS = 'params';

  constructor(private readonly baseUrl: BaseUrl, private readonly rest: Rest) { }

  public executeAuthenticatedUrl(
    url: string,
  ): Promise<Blob> {
    return this.rest.get(url, false, true) as Promise<Blob>;
  }

  public executeUrl(
    url: string,
  ): Promise<Blob> {
    return this.rest.get(url, false, true) as Promise<Blob>;
  }

  public executeDistributionFormat(
    format: DistributionFormat,
    params: null | Array<ParameterValue>,
    asBlob: boolean,
  ): Promise<Record<string, unknown> | Blob> {
    const url = this.getExecuteUrl(format, params);
    return this.rest.get(url, false, asBlob) as Promise<Record<string, unknown> | Blob>;
  }

  public getExecuteUrl(
    format: DistributionFormat,
    params: null | Array<ParameterValue>,
  ): string {
    let url = format.getUrl();

    url += (url.indexOf('?') < 0) ? '?' : '';

    if (params != null) {
      const paramsValueString = encodeURIComponent(this.paramsToJSONString(params));
      url += `&${DevExecutionApi.PARAMS}=${paramsValueString}`;
    }
    return url;
  }

  public getOriginatorUrl(distribution: DistributionSummary, params: null | Array<ParameterValue>): Promise<string> {

    const urlBuilder = this.baseUrl.urlBuilder()
      .addPathElements(DevExecutionApi.GET_ORIGINAL, distribution.getIdentifier());

    if (params != null) {
      const paramsValueString = this.paramsToJSONString(params);
      urlBuilder.addParameter(DevExecutionApi.PARAMS, paramsValueString);
    }

    const url = urlBuilder.build();

    return this.rest
      .get(url)
      .then((json: Record<string, unknown>) => {
        const optional = JSONDistributionFactory.jsonToOriginalUrl(json);

        if (optional.isEmpty()) {
          return Promise.reject();
        }

        return Promise.resolve(optional.get()!);
      });

  }

  private paramsArrayToObject(params: Array<ParameterValue>): Record<string, unknown> {
    const obj = {};
    params.forEach((param: ParameterValue) => {
      obj[param.name] = param.value;
    });
    return obj;
  }

  private paramsToJSONString(params: Array<ParameterValue>) {
    const paramsValue = this.paramsArrayToObject(params);
    return JSON.stringify(paramsValue);
  }
}
