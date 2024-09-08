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
import { Observable } from 'rxjs';
import { Style } from './style';

/** The `export interface Stylable` is defining an interface in TypeScript called `Stylable`. This
interface has three members: */
export interface Stylable {
  /** The line `readonly styleObs: Observable<null | Style>;` is declaring a property called `styleObs` of
  type `Observable<null | Style>`. */
  readonly styleObs: Observable<null | Style>;


  /* The `setStyle(style: null | Style, force?: boolean): void;` method in the `Stylable` interface is
  a function that allows setting the style of an object that implements the `Stylable` interface. It
  takes two parameters: */
  setStyle(style: null | Style, force?: boolean): void;

  /** The `getStyle()` method is a function that does not take any parameters and returns a value of type
  `null | Style`. This method is used to retrieve the style of an object implementing the `Stylable`
  interface. The return value can be either `null` if no style has been set, or an instance of the
  `Style` class representing the current style of the object. */
  getStyle(): null | Style;
}
