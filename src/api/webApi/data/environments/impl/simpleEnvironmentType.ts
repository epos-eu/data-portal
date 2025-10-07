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
import { Confirm } from 'api/webApi/utility/preconditions';
import { EnvironmentType } from '../environmentType.interface';
import { EnvironmentServiceType } from '../environmentServiceType.interface';

export class SimpleEnvironmentType implements EnvironmentType {

  private constructor(
    public readonly type: string,
    public readonly services: Array<EnvironmentServiceType>,
  ) { }

  public static make(type: string, services: Array<EnvironmentServiceType>): EnvironmentType {
    Confirm.requiresValidString(type);
    return new SimpleEnvironmentType(type, services);
  }


  getType(): string {
    return this.type;
  }

  getServices(): Array<EnvironmentServiceType> {
    return this.services;
  }

}
