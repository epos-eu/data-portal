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
import { Pipe, PipeTransform } from '@angular/core';

/** The `UrlToLinkPipe` class is a TypeScript pipe that transforms a URL into an HTML anchor element. */
@Pipe({
  name: 'urlToLink'
})
export class UrlToLinkPipe implements PipeTransform {

  /**
   * The transform function takes a string value and returns an HTML anchor element with the value as
   * the href attribute, and an optional title and class attribute.
   * @param {string} value - The value parameter is a string that represents the URL that needs to be
   * transformed into an HTML anchor tag.
   * @param [title] - The `title` parameter is a string that represents the title or text that will be
   * displayed for the link. If no title is provided, the value of the link will be used as the title.
   * @param [elemclass] - The `elemclass` parameter is used to specify the CSS class for the generated
   * `<a>` element. It allows you to apply custom styling to the link.
   * @returns a string that represents an HTML anchor element. If the `value` parameter is null, empty,
   * or does not start with "http", the function returns the `value` itself. Otherwise, it returns an
   * anchor element with the `value` as the href attribute, the `title` as the inner text (if
   * provided), and the `elemclass` as the class attribute
   */
  public transform(value: string, title = '', elemclass = ''): string {
    return (value == null || value.trim().substring(0, 4) !== 'http')
      ? value
      : `<a href="${value.trim()}" class="${elemclass}" rel="noopener noreferrer" target="_blank">${title !== '' ? title : value.trim()}</a>`;
  }
}
