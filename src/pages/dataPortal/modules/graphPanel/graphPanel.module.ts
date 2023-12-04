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
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

import { TraceSelectorComponent } from './traceSelector/traceSelector.component';

import { PlotlyViaWindowModule } from 'angular-plotly.js';
import { ComponentsModule } from 'components/components.module';
import { ReusableYAxesPipe } from './traceSelector/reusableYAxes.pipe';
import { GraphPanelComponent } from './graphPanel.component';
import { GraphDisplayComponent } from './graphDisplay/graphDisplay.component';
import { MatIconModule } from '@angular/material/icon';
import { TraceSelectorService } from './traceSelector/traceSelector.service';

@NgModule({
  declarations: [
    GraphPanelComponent,
    GraphDisplayComponent,
    TraceSelectorComponent,
    ReusableYAxesPipe,
  ],
  imports: [
    CommonModule,
    RouterModule,
    PlotlyViaWindowModule,
    ComponentsModule,
    // angular materials library
    MatMenuModule,
    MatTooltipModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatExpansionModule,
  ],
  exports: [
    GraphPanelComponent,
  ],
  providers: [
    TraceSelectorService
  ]
})

export class GraphPanelModule { }
