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
import { DistributionSummary } from './distributionSummary.interface';
import { DistributionType } from './distributionType.enum';
import { TemporalRange } from './temporalRange.interface';
import { SpatialRange } from './spatialRange.interface';
import { ParameterDefinitions } from './parameterDefinitions.interface';
import { DataProvider } from './dataProvider.interface';
import { DistributionLevel } from './distributionLevel.interface';
import { DistributionContactPoint } from './distributionContactPoint.interface';
import { DistributionCategories } from './distributionCategories.interface';


export interface DistributionDetails extends DistributionSummary {
  // id, name, usable,  getAvailableFormats

  getEndPoint(): string;

  getType(): DistributionType | string;
  getTypeString(): string;
  getTemporalRange(): TemporalRange;
  getSpatialRange(): SpatialRange;
  getLicense(): string;
  getDescription(): string;
  getWebServiceDescription(): string;
  getWebServiceProvider(): DataProvider | null;
  getWebServiceName(): string;
  getWebServiceSpatialRange(): null | SpatialRange;
  getWebServiceTemporalCoverage(): null | TemporalRange;
  getWebServiceEndpoint(): string;
  getDocumentation(): string;
  getDataProvider(): Array<DataProvider>;
  getInternalID(): Array<string>;
  getParameters(): ParameterDefinitions;
  getDOI(): Array<string>;
  getDownloadURL(): string;
  getContactPoints(): Array<string>;
  getKeywords(): Array<string>;
  getFrequencyUpdate(): string;
  getQualityAssurance(): string;
  getLevel(): Array<DistributionLevel>;
  getDomainCode(): string | undefined;
  getDomain(): string | undefined;
  getCategories(): DistributionCategories | null;
  getAvailableContactPoints(): Array<DistributionContactPoint>;
  getPage(): Array<string>;
}
