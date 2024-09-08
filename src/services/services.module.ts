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
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SearchService } from './search.service';
import { DataSearchService } from './dataSearch.service';
import { ExecutionService } from './execution.service';
import { PageLoadingService } from './pageLoading.service';
import { Model } from './model/model.service';
import { ModelPrimer } from './model/modelPrimer.service';
import { RouteInfoService } from './routeInfo.service';
import { LoggingService } from './logging.service';
import { LiveDeploymentService } from './liveDeployment.service';
import { PoliciesService } from './policiesService.service';
import { InformationsService } from './informationsService.service';
import { LocalStoragePersister } from './model/persisters/localStoragePersister';
import { PanelsEmitterService } from './panelsEventEmitter.service';
import { TourService } from './tour.service';
import { ShareService } from './share.service';
/**
 * Module for registering new services that may be used anywhere in the app.
 */
@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
})

export class ServicesModule {
  static forRoot(): ModuleWithProviders<ServicesModule> {
    return {
      ngModule: ServicesModule,
      providers: [
        SearchService, DataSearchService,
        ExecutionService,
        PageLoadingService,
        Model, ModelPrimer,
        RouteInfoService, LoggingService,
        LiveDeploymentService,
        PoliciesService,
        InformationsService,
        LocalStoragePersister,
        PanelsEmitterService,
        TourService,
        ShareService,
      ]
    };
  }
}
