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

import { DistributionLevel } from 'api/webApi/data/distributionLevel.interface';
import { ParameterValue } from 'api/webApi/data/parameterValue.interface';
import { Observable } from 'rxjs';
import { DataConfigurableI } from 'utility/configurables/dataConfigurableI.interface';

/** The line `export interface DataConfigurableDataSearchI extends DataConfigurableI {` is defining an
interface named `DataConfigurableDataSearchI` that extends another interface `DataConfigurableI`. */
export interface DataConfigurableDataSearchI extends DataConfigurableI {

  /** The `id` property is defining a variable of type `string` in the `DataConfigurableDataSearchI`
  interface. This property is used to store the unique identifier of a data configurable object. */
  id: string;

  /** The `pinnedObs` property is defining a variable of type `Observable<boolean>` in the
  `DataConfigurableDataSearchI` interface. This property is used to store an observable that emits
  boolean values indicating whether the data configurable object is pinned or not. Observables are
  used in reactive programming to handle asynchronous data streams. In this case, the `pinnedObs`
  observable can be subscribed to in order to receive updates whenever the pinned status of the data
  configurable object changes. */
  pinnedObs: Observable<boolean>;

  /** The `selectedObs` property is defining a variable of type `Observable<boolean>` in the
  `DataConfigurableDataSearchI` interface. This property is used to store an observable that emits
  boolean values indicating whether the data configurable object is selected or not. Observables are
  used in reactive programming to handle asynchronous data streams. In this case, the `selectedObs`
  observable can be subscribed to in order to receive updates whenever the selected status of the data
  configurable object changes. */
  selectedObs: Observable<boolean>;

  /** The `currentParamValues` property is defining a variable of type `Array<ParameterValue>` in the
  `DataConfigurableDataSearchI` interface. This property is used to store an array of `ParameterValue`
  objects. */
  currentParamValues: Array<ParameterValue>;

  /** The `levels` property in the `DataConfigurableDataSearchI` interface is defining a variable of type
  `Array<DistributionLevel>`. This property is used to store an array of `DistributionLevel` objects.
  The `DistributionLevel` interface likely represents different levels of distribution for the data
  configurable object. This property allows for storing and accessing the distribution levels
  associated with the data configurable object. */
  levels: Array<DistributionLevel>;

  /** The `isPinned(): boolean;` method is defining a function in the `DataConfigurableDataSearchI`
  interface. This function does not take any parameters and returns a boolean value. */
  isPinned(): boolean;

  /** The `isSelected(): boolean;` method is defining a function in the `DataConfigurableDataSearchI`
  interface. This function does not take any parameters and returns a boolean value. */
  isSelected(): boolean;

  /** The `setPinned(pinned: boolean): this;` method is defining a function in the
  `DataConfigurableDataSearchI` interface. This function takes a boolean parameter `pinned` and
  returns `this`, which refers to the current instance of the object implementing the interface. */
  setPinned(pinned: boolean): this;

  /** The `setSelected(selected: boolean): this;` method is defining a function in the
  `DataConfigurableDataSearchI` interface. This function takes a boolean parameter `selected` and
  returns `this`, which refers to the current instance of the object implementing the interface. */
  setSelected(selected: boolean): this;

  /** The `setLevels` method is defining a function in the `DataConfigurableDataSearchI` interface. This
  function takes an array parameter `value` of type `Array<DistributionLevel>`, which represents
  different levels of distribution for the data configurable object. The method returns `this`, which
  refers to the current instance of the object implementing the interface. */
  setLevels(value: Array<DistributionLevel>): this;
}
