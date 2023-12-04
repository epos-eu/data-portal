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
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { EposLeafletComponent } from './components/eposLeaflet.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LayerControlComponent } from './components/layerControlComponent/layerControl.component';
import { LayerLegendComponent } from './components/layerControlComponent/layerLegendComponent/layerLegend.component';
import { LayerCustomizeComponent } from './components/layerControlComponent/layerCustomizeComponent/layerCustomize.component';
import { LayersService } from './services/layers.service';
import { MccColorPickerModule } from 'material-community-components/color-picker';
import { MatSelectModule } from '@angular/material/select';
import { LayerToggleComponent } from './components/layerToggleComponent/layerToggle.component';
import { LayerTabsControlComponent } from './components/layerControlComponent/layerTabControlComponent/layerTabsControl.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { BaseLayerSelectionComponent }
  from './components/layerControlComponent/baseLayerSelectionComponent/baseLayerSelection.component';

@NgModule({
  declarations: [
    EposLeafletComponent,
    LayerControlComponent,
    LayerLegendComponent,
    LayerToggleComponent,
    LayerCustomizeComponent,
    LayerTabsControlComponent,
    BaseLayerSelectionComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    DragDropModule,
    MatTabsModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    FormsModule,
    MccColorPickerModule,
    MatButtonModule,
    MatRadioModule
  ],
  exports: [
    EposLeafletComponent,
  ],
  providers: [
    HttpClient,
    LayersService,
  ]
})
export class EposLeafletModule { }
