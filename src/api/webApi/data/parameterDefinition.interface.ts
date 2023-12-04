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
import { ParameterType } from 'api/webApi/data/parameterType.enum';
import { Parameter } from 'api/webApi/data/parameter.interface';
import { ParameterProperty } from './parameterProperty.enum';

export interface ParameterDefinition extends Parameter {
  label: string;
  property: ParameterProperty;
  type: ParameterType;
  optional: boolean;
  min: string;
  max: string;
  regex: string;
  format: string;
  hasAllowedValues: boolean;
  allowedValues: Array<string>;
  allowedValuesFreeAllowed: boolean;
  defaultValue: string;
  readOnlyValue: string;
  multipleValue: string;
  areValuesSame(val1: string, val2: string): boolean;
}
