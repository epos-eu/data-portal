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
import { UrlBuilder } from '../classes/urlBuilder.interface';


export class SimpleUrlBuilder implements UrlBuilder {

  private readonly pathElements: Array<string> = [];
  private readonly parameters: Map<string, string> = new Map<string, string>();


  private constructor(
    private readonly base: string,
    private readonly pathSeparator: string,
    private readonly querySeparator: string,
    private readonly paramSeparator: string,
    private readonly valueSeparator: string) {
  }

  static makeUrlBulilderWithDefaultSeparators(base: string): UrlBuilder {
    return SimpleUrlBuilder.makeUrlBulilder(base, '/', '?', '&', '=');
  }

  static makeUrlBulilder(base: string, pathSeparator: string,
    querySeparator: string, paramSeparator: string, valueSeparator: string): UrlBuilder {

    Confirm.isValidString(base, true);

    let t = base;
    t = SimpleUrlBuilder.trimLeading(t, pathSeparator);
    t = SimpleUrlBuilder.tirmTrailing(t, pathSeparator);
    Confirm.isValidString(t, true);


    Confirm.isValidString(pathSeparator, true);
    Confirm.isValidString(querySeparator, true);
    Confirm.isValidString(paramSeparator, true);
    Confirm.isValidString(valueSeparator, true);

    return new SimpleUrlBuilder(t, pathSeparator, querySeparator, paramSeparator, valueSeparator);
  }


  private static trimLeading(s: string, remove: string): string {
    let t = s;
    while (t.startsWith(remove)) {
      t = t.substring(remove.length);
    }
    return t;
  }

  private static tirmTrailing(s: string, remove: string) {
    let t = s;
    while (t.endsWith(remove)) {
      t = t.substring(0, t.length - remove.length);
    }
    return t;
  }

  build(): string {

    let url = this.base;
    for (const e of this.pathElements) {
      url = url.concat(this.pathSeparator);
      url = url.concat(e);
    }

    url = encodeURI(url);

    let params = '';
    let sep = this.querySeparator;

    this.parameters.forEach((value: string, key: string) => {
      params = params.concat(sep);
      params = params.concat(key);
      params = params.concat(this.valueSeparator);
      params = params.concat(encodeURIComponent(value));
      sep = this.paramSeparator;
    });



    url = url.concat(params);

    return url;
  }



  addPathElements(...elements: Array<string>): UrlBuilder {

    for (const e of elements) {
      Confirm.isValidString(e, true);

      let t = e;
      t = SimpleUrlBuilder.trimLeading(t, this.pathSeparator);
      t = SimpleUrlBuilder.tirmTrailing(t, this.pathSeparator);
      Confirm.isValidString(t, true);

      this.pathElements.push(t);
    }

    return this;
  }

  addParameter(key: string, value: string): UrlBuilder {
    Confirm.isValidString(key, true);
    Confirm.isValidString(value, true);
    this.parameters.set(key, value);
    return this;
  }
}
