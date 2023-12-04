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
import { SearchApi } from './searchApi.interface';
import { DetailsApi } from './detailsApi.interface';
import { DictionaryApi } from './dictionaryApi.interface';
import { AaaiApi } from './aaaiApi.interface';
import { ExecutionApi } from './executionApi.interface';
import { DiscoverApi } from './discoverApi.interface';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Api extends DiscoverApi, DictionaryApi, SearchApi, DetailsApi, AaaiApi, ExecutionApi {
}
