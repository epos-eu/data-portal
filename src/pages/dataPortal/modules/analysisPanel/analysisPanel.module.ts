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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ComponentsModule } from 'components/components.module';
import { AnalysisPanelComponent } from './analysisPanel.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ResourcesComponent } from './components/resourcesComponent/resources.component';
import { MatTableModule } from '@angular/material/table';
import { ConfigurationModule } from './components/configurationComponent/configuration.module';
import { DataSearchConfigurablesServiceAnalysis } from './services/dataSearchConfigurables.service';

@NgModule({
  declarations: [
    AnalysisPanelComponent,
    ResourcesComponent,
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    ConfigurationModule,
  ],
  exports: [
    AnalysisPanelComponent,
    ResourcesComponent,
  ],
  providers: [
    DataSearchConfigurablesServiceAnalysis
  ]
})

export class AnalysisModule { }
