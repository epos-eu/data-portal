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
import { Facet } from 'api/webApi/data/facet.interface';
import { Confirm } from 'api/webApi/utility/preconditions';

/**
 * Represents a node in a tree that may have child nodes, and optionally data of type T.
 */
export class SimpleFacet<T> implements Facet<T> {

  private readonly childrenIdToFacet: Map<string, Facet<T>> = new Map();

  private constructor( //
    private readonly parent: null | Facet<T>,
    private readonly identifier: string, //
    private readonly name: string, //
    private readonly elements = new Array<T>(),
  ) {
  }

  public static make<T>(parent: null | Facet<T>, identifier: string, name: string, data?: Array<T>): Facet<T> {
    Confirm.requiresValidString(identifier);
    Confirm.requiresValidString(name);

    return new SimpleFacet<T>(parent, identifier, name, data);
  }

  addChild(child: Facet<T>): void {
    this.childrenIdToFacet.set(child.getIdentifier(), child);
  }

  getChildren(): Array<Facet<T>> {
    return Array.from(this.childrenIdToFacet.values());
  }
  hasChildren(): boolean {
    return (this.getChildren().length > 0);
  }
  getParent(): null | Facet<T> {
    return this.parent;
  }
  getData(): Array<T> {
    return this.elements;
  }
  getName(): string {
    return this.name;
  }
  getIdentifier(): string {
    return this.identifier;
  }

  getFlatData(): Array<T> {
    const flat: Array<T> = [];
    const stack: Array<Facet<T>> = [];

    stack.push(this);

    while (stack.length > 0) {
      const f: Facet<T> = stack.pop()!;

      // data
      f.getData().forEach(data => flat.push(data));

      // children
      f.getChildren().reverse().forEach(child => stack.push(child));
    }
    return flat;
  }
}
