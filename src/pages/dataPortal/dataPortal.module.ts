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
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MapInteractionService } from '../../utility/eposLeaflet/services/mapInteraction.service';
import { DataPortalComponent } from './dataPortal.component';
import { DataPanelModule } from './modules/dataPanel/dataPanel.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FilterSearchModule } from './modules/dataPanel/filterSearchPanel/filterSearchPanel.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TablePanelModule } from './modules/tablePanel/tablePanel.module';
import { GraphPanelModule } from './modules/graphPanel/graphPanel.module';
import { MatBadgeModule } from '@angular/material/badge';
import { DataSearchConfigurablesService } from './services/dataSearchConfigurables.service';
import { ResultsPanelService } from './services/resultsPanel.service';
import { LandingService } from './services/landing.service';
import { UserNotificationService } from './services/userNotification.service';
import { MapModule } from './modules/map/map.modules';



@NgModule({
  declarations: [
    DataPortalComponent,
  ],
  imports: [
    CommonModule,
    MapModule,
    DataPanelModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    FilterSearchModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatBadgeModule,
    TablePanelModule,
    GraphPanelModule,
  ],
  exports: [
  ],
  providers: [
    MapInteractionService,
    DataSearchConfigurablesService,
    ResultsPanelService,
    LandingService,
    UserNotificationService,
  ]
})

export class DataPortalModule { }
