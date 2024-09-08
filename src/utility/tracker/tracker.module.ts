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
import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxMatomoTrackerModule } from '@ngx-matomo/tracker';
import { environment } from 'environments/environment';
import { Tracker } from './tracker.service';
import { ServicesModule } from 'services/services.module';

@NgModule({
  declarations: [
  ],
  imports: [
    NgxMatomoTrackerModule.forRoot({
      siteId: environment.matomoSiteId, // your Matomo's site ID (find it in your Matomo's settings)
      trackerUrl: environment.matomoEndpoint, // your matomo server root url
    }),
    ServicesModule.forRoot()
  ],
  providers: [
    Tracker
  ]
})

export class TrackerModule {
  static forRoot(): ModuleWithProviders<TrackerModule> {
    return {
      ngModule: TrackerModule,
    };
  }
}
