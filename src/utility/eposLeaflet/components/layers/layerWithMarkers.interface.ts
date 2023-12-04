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

/** The `export interface LayerWithMarkers` statement is defining an interface named `LayerWithMarkers`.
This interface specifies the contract for objects that have markers and provides a method
`setZOffset` that can be used to set the z-offset of the markers. The `export` keyword makes the
interface accessible outside of the module. */
export interface LayerWithMarkers {

  /** The `setZOffset` method is a function that belongs to the `LayerWithMarkers` interface. It takes an
  optional parameter `index` of type `number` and does not return any value (`void`). */
  setZOffset(index?: number): void;
}
