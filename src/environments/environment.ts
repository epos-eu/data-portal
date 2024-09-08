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
 * The file contents for the current environment will overwrite these during build if an
 * environment argument is added to the build command.
 *
 * See notes in environment.example.ts
 */

import { environmentDevel } from './environment.devel';
import { environmentLatest } from './environment.latest';
import { environmentProd } from './environment.prod';
import { environmentStage } from './environment.stage';
import { environmentBase } from './environmentBase';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function getEnvironment() {
  switch (window.location.host) {

    case 'EPOS_ENV_PROD_URL':
      return { ...environmentProd };
      break;

    case 'EPOS_ENV_STAGE_URL':
      return { ...environmentStage };
      break;

    case 'EPOS_ENV_LATEST_URL':
      return { ...environmentLatest };
      break;

    case 'localhost:4200':
      return { ...environmentDevel };
      break;

    default:
      return {
        ...environmentBase,
        ...{
        }
      };
      break;
  }

}

export const environment = getEnvironment();
