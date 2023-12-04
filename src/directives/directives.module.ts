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
import { ShowDisclaimerDirective } from './showDisclaimer.directive';
import { AppRouterOutletDirective } from './appRouterOutlet.directive';
import { LinkIfUrlDirective } from './linkIfUrl.directive';
import { TourStageDirective } from './tour-stage-directive';

/**
 * Module for registering new directives that may be used anywhere in the app.
 */
@NgModule({
  declarations: [
    ShowDisclaimerDirective,
    AppRouterOutletDirective,
    LinkIfUrlDirective,
    TourStageDirective,
  ],
  imports: [
  ],
  providers: [],
  exports: [
    ShowDisclaimerDirective,
    AppRouterOutletDirective,
    LinkIfUrlDirective,
    TourStageDirective,
  ],
  bootstrap: []
})
export class DirectivesModule { }
