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
import { LegendDisplay } from './legendDisplay.interface';

/** The `StackedLegendDisplay` class is responsible for creating and displaying legends in a stacked
format on a webpage. */
export class StackedLegendDisplay implements LegendDisplay {
  /** The line `public cssClassName = 'legend-display-stacked';` is declaring a public property
  `cssClassName` and assigning it the value `'legend-display-stacked'`. This property is used to store
  the CSS class name that will be applied to the stacked legend display element. */
  public cssClassName = 'legend-display-stacked';

  /**
   * The `displayLegend` function takes an array of `Legend` objects and a function to set the content
   * of an HTML element, and creates and displays the legends on the webpage.
   * @param legends - An array of Legend objects. Each Legend object represents a legend to be
   * displayed.
   * @param setContentFunction - The `setContentFunction` is a function that takes two parameters:
   * `contentElement` and `headerElements`. It is responsible for setting the content of the legend
   * display and optionally setting the header elements.
   */
  public displayLegend(
    legends: Array<Legend>,
    setContentFunction: (contentElement: HTMLElement, headerElements?: Array<HTMLElement>) => void,
  ): void {
    const legendDisplayArray = new Array<HTMLElement>();

    legends.forEach((legend: Legend) => {
      const legendDiv = document.createElement('div');
      legendDiv.classList.add('single-legend-wrapper');

      const titleDisplay = legend.createDisplayTitle();
      titleDisplay.classList.add('legend-title');
      legendDiv.appendChild(titleDisplay);

      // call individual legend display function
      const legendDetailsDiv = document.createElement('div');
      legendDetailsDiv.classList.add('legend-details');
      legendDetailsDiv.appendChild(legend.createDisplayContent());
      legendDiv.appendChild(legendDetailsDiv);

      legendDisplayArray.push(legendDiv);
    });

    const contentDiv = document.createElement('div');
    legendDisplayArray.forEach((legendDiv: HTMLElement) => contentDiv.appendChild(legendDiv));

    setContentFunction(contentDiv);
  }
}
