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
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from 'pages/notFound/notFound.component';
import { LastPageRedirectComponent } from 'pages/lastPageRedirect/lastPageRedirect.component';
import { DataPortalComponent } from 'pages/dataPortal/dataPortal.component';

export const APP_ROUTES: Routes = [
  // START DATA
  {
    path: '',
    component: DataPortalComponent,
    data: {
      hideHeader: false,
      pageCssClass: '',
    },
  },
  {
    path: 'data/search',
    redirectTo: '',
    data: {
      hideHeader: false,
      pageCssClass: '',
    },
  },
  {
    path: 'last-page-redirect',
    component: LastPageRedirectComponent,
    data: {
      ignoreAsLastPage: true,
    },
  },
  {
    path: '**',
    component: NotFoundComponent,
    data: {
      ignoreAsLastPage: true,
    },
  },
];

/**
 * CAN'T USE 'children' with our custom route reuse strategy, otherwise can't use the onAttach etc. decorator
 */

@NgModule({
  imports: [RouterModule.forRoot(APP_ROUTES, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
