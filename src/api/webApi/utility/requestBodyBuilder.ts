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
import { Confirm } from './preconditions';
import { RequestBodyBuilder } from '../classes/requestBodyBuilder.interface';


export class SimpleRequestBodyBuilder implements RequestBodyBuilder {

  private readonly parameters: Map<string, unknown> = new Map<string, unknown>();

  private constructor() {
  }
  static makeRequestBodyBuilder(): RequestBodyBuilder {

    return new SimpleRequestBodyBuilder();
  }


  build(): string {
    return JSON.stringify(Object.fromEntries(this.parameters));
  }

  addParameters(map: Map<string, unknown>): RequestBodyBuilder {

    Confirm.isValid(map, true);

    map.forEach((v, k) => {
      this.addParameter(k, v);
    });

    return this;
  }

  addParameter(key: string, value: unknown): RequestBodyBuilder {
    Confirm.isValidString(key, true);
    Confirm.isValid(value, true);
    this.parameters.set(key, value);
    return this;
  }

}
