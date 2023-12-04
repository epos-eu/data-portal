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

import { Legend } from './legend';

/** The `export interface LegendDisplay` statement is defining an interface named `LegendDisplay`. This
interface specifies the structure and behavior of an object that represents a legend display. It
includes properties and methods that can be implemented by classes that want to provide a legend
display functionality. */
export interface LegendDisplay {

  /** The `cssClassName` property is defining a string that represents the CSS class name for the legend
  display. This class name can be used to apply specific styles to the legend display element in the
  HTML/CSS code. */
  cssClassName: string;

  /** The `displayLegend` function is a method that takes in two parameters: `legends` and
  `setContentFunction`. */
  displayLegend(
    legends: Array<Legend>,
    setContentFunction: (contentElement: HTMLElement, headerElements?: Array<HTMLElement>) => void,
  ): void;
}
