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
import { DataConfigurable } from './dataConfigurable.abstract';
import { ParameterValue } from 'api/webApi/data/parameterValue.interface';
import { DistributionDetails } from 'api/webApi/data/distributionDetails.interface';
import { Injector } from '@angular/core';
import { BoundingBox } from 'api/webApi/data/boundingBox.interface';
import { TemporalRange } from 'api/webApi/data/temporalRange.interface';

export class DataConfigurableParamValues extends DataConfigurable {
  constructor(
    protected injector: Injector,
    distributionDetails: DistributionDetails,
    paramValues: Array<ParameterValue>,
    spatialOverrides?: BoundingBox,
    temporalOverrides?: TemporalRange,
  ) {
    super(distributionDetails, paramValues, spatialOverrides, temporalOverrides);
  }


}
