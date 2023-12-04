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
import { DictionaryType } from 'api/webApi/classes/dictionaryType.enum';
import { DictionaryApi } from 'api/webApi/classes/dictionaryApi.interface';
import { Rest } from 'api/webApi/classes/rest.interface';
import { BaseUrl } from 'api/webApi/classes/baseurl.interface';
import { Dictionary } from 'api/webApi/data/dictionary.interface';

/**
 * **NOT CURRENTLY IN USE**
 * Responsible for triggering calls to the webApi module "dictionary" endpoint.
 * - Accepts criteria from caller
 * - Triggers the webApi call via the {@link Rest} class
 * - Processes response data into internal objects
 * - Returns the appropriate response to the caller
 */
export class DevDictionaryApi implements DictionaryApi {

  constructor(private readonly baseUrl: BaseUrl, private readonly rest: Rest) { }

  public getDictionary(type: DictionaryType): Promise<Dictionary> {
    throw new Error('API 1.3 - Method not implemented.');
  }

}
