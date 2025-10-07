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
import { Environment } from '../environment.interface';
import { EnvironmentStatus, EnvironmentStatusText } from '../environmentStatus.enum';
import { EnvironmentResource } from '../environmentResource.interface';
import { EnvironmentResourceStatus } from '../environmentResourceStatus.enum';

export class SimpleEnvironment implements Environment {

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly serviceId: string,
    public readonly accessUrl: string,
    public readonly resources: Array<EnvironmentResource>,
    public readonly created: string,
    public readonly status: EnvironmentStatus,
  ) { }

  public static make(identifier: string, name: string, description: string, serviceId: string, accessUrl: string, resources: Array<EnvironmentResource>, created: string, status: EnvironmentStatus): SimpleEnvironment {
    Confirm.requiresValid(identifier);
    Confirm.requiresValidString(name);
    Confirm.requiresValid(description);
    return new SimpleEnvironment(identifier, name, description, serviceId, accessUrl, resources, created, status);
  }


  getName(): string {
    return this.name;
  }
  getIdentifier(): string {
    return this.id;
  }
  getDescription(): string {
    return this.description;
  }

  getServiceId(): string {
    return this.serviceId;
  }

  getAccessUrl(): string {
    return this.accessUrl;
  }

  getResources(): Array<EnvironmentResource> {
    return this.resources;
  }

  getCreated(): string {
    return this.created;
  }

  getStatus(text = false): EnvironmentStatus | EnvironmentStatusText {
    return text === true ? EnvironmentStatus.fromProperty(this.status) : this.status;
  }

  isEnable(): boolean {
    return this.getStatus() !== EnvironmentStatus.NOT_READY;
  }

  isUpdateable(): boolean {
    let toUpdate = false;
    this.getResources().forEach(res => {
      if (res.status !== EnvironmentResourceStatus.LOADED) {
        toUpdate = true;
      }
    });

    return toUpdate;
  }

}
