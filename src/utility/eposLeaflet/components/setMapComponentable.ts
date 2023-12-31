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

import { EposLeafletComponent } from './eposLeaflet.component';

/** The `export interface SetMapComponentable {` statement is defining an interface named
`SetMapComponentable`. This interface specifies that any class that implements it must have a method
called `setMapComponent` that takes an argument of type `EposLeafletComponent` and returns an
instance of the class that implements the `SetMapComponentable` interface. */
export interface SetMapComponentable {

  /** The `setMapComponent` method is a function that takes an argument of type `EposLeafletComponent` and
  returns the instance of the class that implements the `SetMapComponentable` interface. */
  setMapComponent(eposLeaflet: EposLeafletComponent): this;
}
