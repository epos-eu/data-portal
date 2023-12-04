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
import { ParameterValue } from 'api/webApi/data/parameterValue.interface';

export class SimpleParameterValue implements ParameterValue {

  constructor(
    public readonly name: string,
    public readonly value: string,
  ) {
  }

  /**
   * The function "make" creates a new instance of the "SimpleParameterValue" class with the given name
   * and value.
   * @param {string} name - A string representing the name of the parameter.
   * @param {string} value - The value parameter is a string that represents the value of the parameter.
   * @returns An instance of the SimpleParameterValue class with the provided name and value.
   */
  public static make(
    name: string,
    value: string,
  ): SimpleParameterValue {
    // create param
    return new SimpleParameterValue(
      name,
      value,
    );
  }
}
