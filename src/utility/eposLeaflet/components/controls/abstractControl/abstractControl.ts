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

import * as L from 'leaflet';
import { SetMapComponentable } from '../../setMapComponentable';
import { EposLeafletComponent } from '../../eposLeaflet.component';

/** The line `export abstract class AbstractControl extends L.Control implements SetMapComponentable {`
is declaring an abstract class named `AbstractControl` that extends the `L.Control` class from the
Leaflet library and implements the `SetMapComponentable` interface. */
export abstract class AbstractControl extends L.Control implements SetMapComponentable {

  /** The line `protected leafletMapObj: L.Map;` is declaring a protected property named `leafletMapObj`
  of type `L.Map`. This property is used to store an instance of the `L.Map` class from the Leaflet
  library, representing a Leaflet map object. It is used within the `addTo` method to set the map
  object to which the control will be added, and it can be accessed within the class to perform
  operations related to the map object. */
  protected leafletMapObj: L.Map;

  /** The line `protected eposLeaflet: EposLeafletComponent;` is declaring a protected property named
  `eposLeaflet` of type `EposLeafletComponent`. This property is used to store an instance of the
  `EposLeafletComponent` class, which represents a Leaflet map component. It is used within the
  `setMapComponent` method to set the map component for the control, and it can be accessed within
  the class to perform operations related to the map component. */
  protected eposLeaflet: EposLeafletComponent;

  /**
   * The function sets the EposLeafletComponent for the map component and returns the instance of the
   * class.
   * @param {EposLeafletComponent} eposLeaflet - The eposLeaflet parameter is of type
   * EposLeafletComponent.
   * @returns The method is returning the current instance of the class.
   */
  public setMapComponent(eposLeaflet: EposLeafletComponent): this {
    this.eposLeaflet = eposLeaflet;
    return this;
  }

  /**
   * The function adds the current object to a Leaflet map and returns the object itself.
   * @param leafletMapObj - The `leafletMapObj` parameter is an instance of the `L.Map` class from the
   * Leaflet library. It represents a Leaflet map object to which you want to add your custom object.
   * @returns The "this" keyword is being returned.
   */
  public addTo(leafletMapObj: L.Map): this {
    this.leafletMapObj = leafletMapObj;
    super.addTo(leafletMapObj);
    return this;
  }

  /**
   * The function creates a control container element with a specified ID, icon classes, title, and
   * content.
   * @param {string} controlId - A string representing the ID of the control container. This ID is used
   * to uniquely identify the container element in the HTML document.
   * @param {string} faIconClasses - A string representing the Font Awesome icon classes to be applied
   * to the expander element. These classes determine the appearance of the icon.
   * @param {string} title - The title parameter is a string that represents the title of the control
   * container.
   * @param {HTMLElement} content - The `content` parameter is an HTMLElement that represents the
   * content to be displayed within the control container. It can be any valid HTML element such as a
   * div, span, or paragraph.
   * @returns an HTMLElement, specifically the wrapperDiv element.
   */
  protected getControlContainer(
    controlId: string,
    faIconClasses: string,
    title: string,
    content: HTMLElement,
  ): HTMLElement {
    const wrapperDiv = document.createElement('div');
    wrapperDiv.id = controlId;
    wrapperDiv.classList.add('control-wrapper');
    wrapperDiv.classList.add('leaflet-bar');
    wrapperDiv.addEventListener('wheel', (event: Event) => {
      event.stopPropagation();
    });
    L.DomEvent.disableClickPropagation(wrapperDiv);

    wrapperDiv.appendChild(this.createExpander(faIconClasses, title));

    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('control-content');
    contentWrapper.classList.add('bordered');
    contentWrapper.appendChild(content);
    wrapperDiv.appendChild(contentWrapper);

    return wrapperDiv;
  }

  /**
   * The function creates an expander element with a FontAwesome icon and a title.
   * @param {string} faIconClasses - The `faIconClasses` parameter is a string that represents the
   * classes for the Font Awesome icon that will be displayed in the expander. These classes should be
   * separated by spaces.
   * @param {string} title - The title parameter is a string that represents the title or tooltip text
   * for the expander icon.
   * @returns an HTMLElement, specifically the expanderWrapper element.
   */
  protected createExpander(faIconClasses: string, title: string): HTMLElement {
    const expanderWrapper = document.createElement('div');
    expanderWrapper.classList.add('control-expander-wrapper');

    const expander = document.createElement('span');
    expander.classList.add('control-expander');

    const expanderIcon = document.createElement('i');
    faIconClasses.split(' ').forEach((cssClass: string) => {
      cssClass = cssClass.trim();
      if (cssClass !== '') {
        expanderIcon.classList.add(cssClass);
      }
    });

    const iconWrapper = document.createElement('span');
    iconWrapper.classList.add('icon-wrapper');
    iconWrapper.classList.add('bordered');
    iconWrapper.title = title;
    iconWrapper.addEventListener('click', (event: Event) => {
      event.stopPropagation();
      const wasOpen = this.getContainer()!.classList.contains('control-expanded');
      this.closeExpanders(event.target as HTMLElement);
      if (!wasOpen) {
        this.getContainer()!.querySelector('.icon-wrapper')!.dispatchEvent(new CustomEvent('open'));
      }
    });
    iconWrapper.addEventListener('open', (event: Event) => {
      event.stopPropagation();
      this.getContainer()!.classList.add('control-expanded');
    });
    iconWrapper.addEventListener('close', (event: Event) => {
      event.stopPropagation();
      this.getContainer()!.classList.remove('control-expanded');
    });
    iconWrapper.appendChild(expanderIcon);

    expander.appendChild(iconWrapper);
    expanderWrapper.appendChild(expander);
    return expanderWrapper;
  }

  /**
   * The function closes all expanded elements within a specific container when a specific element is
   * clicked.
   * @param {HTMLElement} clickedElement - The `clickedElement` parameter is an HTMLElement that
   * represents the element that was clicked.
   */
  protected closeExpanders(clickedElement: HTMLElement): void {
    Array.from(
      clickedElement.closest('.leaflet-control-container')!.querySelectorAll('.control-expanded .icon-wrapper'),
    ).forEach((element: HTMLElement) => element.dispatchEvent(new Event('close')));
  }
}
