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

export interface Rest {

  get(url: string, fullResponse?: boolean, asBlob?: boolean): Promise<unknown>;

  put(url: string, body: unknown, fullResponse?: boolean, extraHeaders?: Record<string, string>): Promise<unknown>;

  post(url: string, body: unknown, fullResponse?: boolean, extraHeaders?: Record<string, string>): Promise<unknown>;

  delete(url: string): Promise<unknown>;

}

