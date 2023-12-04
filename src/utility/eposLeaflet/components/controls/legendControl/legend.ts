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

import { LegendItem } from './legendItem.abstract';

/** The `Legend` class represents a legend for a chart and provides methods for adding legend items,
customizing the display of the legend, and generating the HTML representation of the legend. */
export class Legend {

  /** The line `public legendItems = new Array<LegendItem>();` is declaring a public property
  `legendItems` and initializing it with an empty array of `LegendItem` objects. This property will
  hold the legend items for the `Legend` class. */
  public legendItems = new Array<LegendItem>();

  /** The line `protected displayFunction: (legend: Legend) => HTMLElement;` is declaring a protected
  property `displayFunction` of type function. This property is used to store a function that takes a
  `Legend` object as an argument and returns an `HTMLElement`. This function is used to customize the
  display of the legend content. By providing a custom display function, you can override the default
  display behavior of the `Legend` class and create a custom HTML structure for the legend items. */
  protected displayFunction: (legend: Legend) => HTMLElement;

  /**
   * The constructor function initializes the layerId and legendTitleHtml properties of an object.
   * @param {string} layerId - The layerId parameter is a string that represents the ID of a layer.
   * @param [legendTitleHtml] - The `legendTitleHtml` parameter is a string that represents the HTML
   * content for the legend title. It is optional and has a default value of an empty string.
   */
  constructor(
    public layerId: string,
    public legendTitleHtml = '',
  ) {
  }

  /**
   * The addLegendItem function adds a LegendItem to an array of legendItems and returns the updated
   * array.
   * @param {LegendItem} item - The `item` parameter is of type `LegendItem`. It represents a single
   * item in the legend.
   * @returns The updated instance of the object with the added legend item.
   */
  addLegendItem(item: LegendItem): this {
    this.legendItems.push(item);
    return this;
  }

  /**
   * The function sets the legend items for a chart and returns the updated object.
   * @param items - The `items` parameter is an array of `LegendItem` objects.
   * @returns The method is returning the instance of the class that the method is being called on.
   */
  setLegendItems(items: Array<LegendItem>): this {
    this.legendItems = items;
    return this;
  }

  /**
   * The `setDisplayFunction` function sets the display function for a Legend object.
   * @param displayFunction - The `displayFunction` parameter is a function that takes a `legend`
   * object as an argument and returns an `HTMLElement`. This function is used to generate the HTML
   * representation of the legend.
   * @returns The "this" keyword is being returned.
   */
  setDisplayFunction(
    displayFunction: (legend: Legend) => HTMLElement,
  ): this {
    this.displayFunction = displayFunction;
    return this;
  }

  /**
   * The function creates and returns an HTML element containing a title for a legend.
   * @returns an HTMLElement, specifically a div element that contains the legend title HTML content.
   */
  createDisplayTitle(): HTMLElement {
    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = this.legendTitleHtml;
    return titleDiv;
  }

  /**
   * The function returns the result of either the displayFunction or the defaultDisplayFunction,
   * depending on whether the displayFunction is defined.
   * @returns The function `createDisplayContent()` returns an HTMLElement.
   */
  createDisplayContent(): HTMLElement {
    return (this.displayFunction) ? this.displayFunction(this) : this.defaultDisplayFunction(this);
  }

  /**
   * The function creates and returns an HTML element that displays a legend with icon and label
   * elements.
   * @param {Legend} legend - The `legend` parameter is an object of type `Legend`. It contains
   * information about the legend, such as the legend items.
   * @returns an HTMLElement, specifically a div element with class names 'legend-details-grid' and
   * 'nice-scrollbar'.
   */
  protected defaultDisplayFunction(legend: Legend): HTMLElement {
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('legend-details-grid');
    contentDiv.classList.add('nice-scrollbar');

    legend.legendItems.forEach((legendItem: LegendItem) => {
      if (null != legendItem) {

        const contentRowDiv = document.createElement('div');
        contentRowDiv.classList.add('legend-details-row');

        contentRowDiv.appendChild(legendItem.getIconElement());
        contentRowDiv.appendChild(legendItem.getLabelElement());

        contentDiv.appendChild(contentRowDiv);
      }
    });

    return contentDiv;
  }
}
