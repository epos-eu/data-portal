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
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import { Injectable } from '@angular/core';

/**
 * This reuse strategy is designed to ensure that the state of a page that a user navigates away
 * from is maintained for when they navigate back to it.
 *
 *
 * See the {@link AppRouterOutletDirective} and {@link OnAttachDetach} decorator for additional lifecyle hooks that are available
 * for when navigating to or from a routed component.
 */
@Injectable()
export class CustomReuseStrategy implements RouteReuseStrategy {

  handlers = {} as Record<string, DetachedRouteHandle>;

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    if ((null != route.routeConfig) && (null != route.routeConfig.path)) {
      this.handlers[route.routeConfig.path] = handle;
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && (null != route.routeConfig.path) && !!this.handlers[route.routeConfig.path];
  }

  retrieve(route: ActivatedRouteSnapshot): null | DetachedRouteHandle {
    return ((!route.routeConfig) || (null == route.routeConfig.path))
      ? null
      : this.handlers[route.routeConfig.path];
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  clearRoutes(): void {
    this.handlers = {};
  }

}
