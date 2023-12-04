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
/** The Button class represents a button element with an action, text, and CSS class. */
export class Button {
  /**
   * The constructor takes in an action, text, and cssClass as parameters and assigns them to private
   * readonly properties.
   * @param action - The `action` parameter is a function that takes no arguments and returns nothing
   * (`void`). It represents the action that will be executed when the corresponding event occurs.
   * @param {string} text - The `text` parameter is a string that represents the text content of an
   * element. It can be used to display a label or a message associated with the element.
   * @param {string} cssClass - The `cssClass` parameter is a string that represents the CSS class to
   * be applied to an element. It is used to style the element according to the specified class.
   */
  constructor(
    private readonly action: () => void,
    private readonly text: string,
    private readonly cssClass: string,
  ) { }

  /**
   * The function "getButton" returns an object with properties "action", "text", and "cssClass".
   * @returns An object with three properties: action, text, and cssClass.
   */
  public getButton(): { action; text; cssClass } {
    return {
      action: this.action,
      text: this.text,
      cssClass: this.cssClass
    };
  }
}
