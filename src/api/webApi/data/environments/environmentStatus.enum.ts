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

export enum EnvironmentStatus {
  NONE = 'none',
  NOT_READY = 'NOT_READY',
  CREATING = 'CREATING',
  UPDATING = 'UPDATING',
  READY = 'READY'
}

export enum EnvironmentStatusText {
  NONE = 'none',
  NOT_READY = 'Not ready',
  CREATING = 'Creating',
  UPDATING = 'Updating',
  READY = 'Ready'
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace EnvironmentStatus {
  export const fromProperty = (name: string): EnvironmentStatusText => {
    const key = Object.keys(EnvironmentStatus).find((thisKey: string) => EnvironmentStatus[thisKey] === name);
    return (key != null) ? EnvironmentStatusText[key] as EnvironmentStatusText : EnvironmentStatusText.NONE;
  };
}
