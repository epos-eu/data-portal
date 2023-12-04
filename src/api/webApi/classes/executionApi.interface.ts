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
import { DistributionSummary } from '../data/distributionSummary.interface';
import { DistributionFormat } from '../data/distributionFormat.interface';
import { ParameterValue } from '../data/parameterValue.interface';

export interface ExecutionApi {

  executeAuthenticatedUrl(
    url: string,
  ): Promise<Blob>;

  executeUrl(
    url: string,
  ): Promise<Blob>;

  executeDistributionFormat(
    format: DistributionFormat,
    params: null | Array<ParameterValue>,
    asBlob: boolean,
  ): Promise<Record<string, unknown> | Blob>;

  getExecuteUrl(
    format: DistributionFormat,
    params: null | Array<ParameterValue>,
  ): string;


  /**
   * Not for execution, just for reference to the originator (TCS)
   */
  getOriginatorUrl(
    distribution: DistributionSummary,
    params: null | Array<ParameterValue>
  ): Promise<string>;
}
