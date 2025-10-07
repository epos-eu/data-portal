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
import { Component } from '@angular/core';
import { MapInteractionService } from 'utility/eposLeaflet/services/mapInteraction.service';
import { VisibleOnComponent as MainVisibileOnComponent } from 'components/visibleOn/visibleOn.component';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { DialogService } from 'components/dialog/dialog.service';
import { LeafletLoadingService } from 'utility/eposLeaflet/services/leafletLoading.service';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';

@Component({
  selector: 'app-visible-on-registry',
  templateUrl: './visibleOn.component.html',
  styleUrls: ['./visibleOn.component.scss'],
  animations: [
  ],
})
export class VisibleOnComponent extends MainVisibileOnComponent {

  constructor(
    protected readonly panelsEvent: PanelsEmitterService,
    protected readonly mapInteractionService: MapInteractionService,
    protected readonly leafletLoadingService: LeafletLoadingService,
    protected readonly dialogService: DialogService,
    protected localStoragePersister: LocalStoragePersister
  ) {
    super(panelsEvent, mapInteractionService, leafletLoadingService, dialogService, localStoragePersister);
  }

}

