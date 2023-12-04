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

import 'jquery';

/** The `PopupCloseHeader` class adds a close button to a given HTML element and returns the modified
element. */
export class PopupCloseHeader {
  /**
   * The function adds a close button to a given HTML element and returns the modified element.
   * @param {HTMLElement} content - The content parameter is an HTMLElement that represents the content
   * of a popup. It can be any HTML element such as a div, span, or paragraph.
   * @param closeFunc - The `closeFunc` parameter is a function that will be called when the close
   * button is clicked. It is a callback function that you can define and pass to the
   * `addToContentElement` function.
   * @returns The `content` element with a header containing a close button is being returned.
   */
  public static addToContentElement(content: HTMLElement, closeFunc: () => void): HTMLElement {
    const $header = jQuery('<div class="popup-close-header"></div>');
    const $closeButton = jQuery(
      '<a class="leaflet-popup-close-button" href="javascript:void(0)" style="outline: none;">×</a>',
    )[0];
    $closeButton.addEventListener('click', () => closeFunc());

    $header.append($closeButton);

    jQuery(content).prepend($header);
    return content;
  }
}
