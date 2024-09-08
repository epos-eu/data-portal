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

import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';

/** The class `MyPaginatorIntl` implements `MatPaginatorIntl` interface and provides custom labels and a
method to calculate the current page range label based on page number, page size, and total length
of items. */
@Injectable()
export class MyPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  firstPageLabel = 'First page';
  itemsPerPageLabel = 'Results per page:';
  lastPageLabel = 'Last page';

  nextPageLabel = 'Next page';
  previousPageLabel = 'Previous page';

  /**
   * The function calculates and returns the label for the current page range based on the page number,
   * page size, and total length of items.
   * @param {number} page - The `page` parameter represents the current page number in a paginated list
   * of items.
   * @param {number} pageSize - PageSize refers to the number of items displayed on each page of a
   * paginated list or table. It determines how many items are shown at once before the pagination
   * controls are used to navigate to the next set of items.
   * @param {number} length - The `length` parameter typically refers to the total number of items in a
   * list or collection. It helps determine the total number of pages needed to display all the items
   * based on the `pageSize` (number of items per page).
   * @returns a string that represents the current page and the total number of pages. For example, if
   * the current page is 0 and there are a total of 5 pages, the returned string would be "Page 1 of
   * 5".
   */
  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return 'Page 1 of 1';
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Page ${page + 1} of ${amountPages}`;
  }
}
