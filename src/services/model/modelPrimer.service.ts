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
import { Injectable, Injector } from '@angular/core';
import { Model } from './model.service';
import { PageLoadingService } from '../pageLoading.service';
import { DataSearchService } from 'services/dataSearch.service';
import { SearchService } from 'services/search.service';
import { AaaiService } from 'api/aaai.service';

/**
 * All this class does is stop circular dependencies on the model service.
 *
 * Watches the {@link Model} and sets services that it needs when it has initialised.
 *
 * TODO: Look into whether this can be deprecated by passing the Model the "injector",
 * and maybe using interfaces to stop any circular dependencies.
 */
@Injectable()
export class ModelPrimer {

  constructor(
    private readonly model: Model,
    private readonly pageLoadingService: PageLoadingService,
    private readonly dataSearchService: DataSearchService,
    private readonly searchService: SearchService,
    private readonly injector: Injector,
    private readonly aaaiService: AaaiService,
  ) {
  }

  public setServicesAndTriggerInitialValues(): void {
    this.model.setServicesAndTriggerInitialValues({
      PageLoadingService: this.pageLoadingService,
      DataSearchService: this.dataSearchService,
      SearchService: this.searchService,
      Injector: this.injector,
      AaaiService: this.aaaiService,
    });
  }
}
