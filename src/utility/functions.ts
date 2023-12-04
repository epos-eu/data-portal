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

/**
 * this can be done with css
 *
 */
export class Functions {
  // text-transform: capitalize;
  public static capitalizeFirstLetter(stringy: string): string {
    return stringy.charAt(0).toUpperCase() + stringy.slice(1).toLowerCase();
  }
  // text-overflow: ellipsis;
  public static ellipsisTooLongString(stringy: string, maxLength: number): string {
    return (stringy.length > maxLength)
      ? stringy.substr(0, maxLength - 3).trim().concat('...')
      : stringy;
  }

  public static openContentWindow(content: string | Promise<string>): Promise<void> {
    // open window as direct result of user action to prevent popup bocker
    const myWindow = this._openWindow('Please wait...');
    return Promise.resolve(content) // always a Promise
      .then((thisContent: string) => {
        if (thisContent) {
          myWindow.document.body.innerHTML = thisContent;
        } else {
          console.error('No Download URL returned.');
        }
      });
  }

  public static getElementPosition(el: HTMLElement): { top: number; left: number } {
    let x = 0;
    let y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent as HTMLElement;
    }
    return { top: y, left: x };
  }

  private static _openWindow(initialMessage?: string): Window {
    // open window as direct result of user action to prevent popup bocker
    const myWindow = window.open('', '_blank');
    if (initialMessage != null) {
      myWindow.document.body.innerHTML = initialMessage;
    }
    return myWindow;
  }
}
