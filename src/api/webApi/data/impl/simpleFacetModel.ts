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
import { FacetModel } from 'api/webApi/data/facetModel.interface';
import { Facet } from 'api/webApi/data/facet.interface';

/**
 * Facet model, holder of root(s).
 */
export class SimpleFacetModel<T> implements FacetModel<T> {


  constructor(private readonly rootMap: Map<string, Facet<T>>) { }

  rootIdentifiers(): Array<string> {
    return Array.from(this.rootMap.keys());
  }
  roots(): Array<Facet<T>> {
    return Array.from(this.rootMap.values());
  }

  root(identifier: string): null | Facet<T> {
    return this.rootMap.get(identifier) ?? null;
  }

  getFlatData(): Array<T> {
    const flat: Array<T> = [];

    this.roots().forEach(root => {
      flat.push(...root.getFlatData());
    });

    return flat;
  }

}
