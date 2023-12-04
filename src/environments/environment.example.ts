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
/**
 * Inherits from {@link environmentBase}.
 *
 * The alternative environment file should be referenced in the angular.json file.  This will
 * enable the default environment.ts file to be replaced by the alternative one at build time,
 * depending on the parameter set in the command line.  For example:
 * "ng serve --env=example",
 */
import { environmentBase } from './environmentBase';

export const environment = {
  ...environmentBase,
  ...{
    environmentName: 'example_environment',
    githash: 'example_hash',
    commitDate: 'example_date',
  }
};
