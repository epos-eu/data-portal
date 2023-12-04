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
import { Identifiable } from 'api/webApi/data/identifiable.interface';
import { Confirm } from 'api/webApi/utility/preconditions';


export class SimpleIdentifiable implements Identifiable {

  constructor(private readonly id: string, private readonly name: string) {
    this.id = Confirm.requiresValidString(id);
    this.name = Confirm.requiresValidString(name);
  }

  getName(): string {
    return this.name;
  }
  getIdentifier(): string {
    return this.id;
  }

}
