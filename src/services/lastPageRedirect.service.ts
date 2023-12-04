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
import { Router, Route } from '@angular/router';
import { RouteInfoService } from './routeInfo.service';

/**
 * A service that monitors page navigations and stores the last navigation in local storage.
 * It also facilitates navigation to the last navigated page.
 */
@Injectable()
export class LastPageRedirectService {
  private readonly KEY = 'last_navigated_page';

  constructor(
    protected readonly router: Router,
    private readonly routeInfo: RouteInfoService,
  ) {
    this.routeInfo.watchCurrentRoute().subscribe((route: Route) => {
      if ((route != null)
        && (this.routeInfo.getDataValue('ignoreAsLastPage') !== true)) {
        this.updateLastPage(route.path ?? null);
      }
    });

  }

  /**
   * Causes the application to navigate to the last page the was set
   * by calling [updateLastPage]{@link #updateLastPage}.
   */
  public goToLastPage(): void {
    // get last navigated to page
    const lastPage = localStorage.getItem(this.KEY);
    void this.router.navigate(
      [(lastPage == null) ? '' : lastPage],
      { preserveFragment: true }, // Needed to retain token info during login redirect
    );
  }

  /**
   * @param url Url of the page to set as the latest page.
   */
  private updateLastPage(url: null | string): void {
    if (null != url) {
      const urlMinusFragment = url;
      localStorage.setItem(this.KEY, urlMinusFragment);
    }
  }

}
