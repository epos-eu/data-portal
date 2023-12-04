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
import { DataPanelComponent } from './dataPanel.component';
import { ResultsPanelComponent } from './resultsPanel/resultsPanel.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { FormsModule } from '@angular/forms';
import { FilterSearchModule } from './filterSearchPanel/filterSearchPanel.module';
import { LandingPanelComponent } from './landingPanel/landingPanel.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ComponentsModule } from 'components/components.module';
import { SpatialTemporalControlsModule } from '../temporalSpatialControls/spatialTemporalControls.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { VisibleOnComponent } from './resultsPanel/visibleOn/visibleOn.component';
import { MyPaginatorIntl } from './resultsPanel/paginator/myPaginatorIntl';
import { MatBadgeModule } from '@angular/material/badge';
import { ResultPanelFluidHeightDirective } from './resultsPanel/directive/resultPanelFluidHeight.directive';
import { FacetDropdownComponent } from './resultsPanel/facetDropdown/facetDropdown.component';
import { MatTreeModule } from '@angular/material/tree';
import { BreadcrumbComponent } from './resultsPanel/breadcrumb/breadcrumb.component';
import { DirectivesModule } from 'directives/directives.module';
import { ServicesModule } from 'services/services.module';
import { NotificationComponent } from './resultsPanel/notification/notification.component';
import { DataConfigurationModule } from './configuration/dataConfiguration.module';

@NgModule({
  declarations: [
    DataPanelComponent,
    ResultsPanelComponent,
    LandingPanelComponent,
    VisibleOnComponent,
    BreadcrumbComponent,
    ResultPanelFluidHeightDirective,
    FacetDropdownComponent,
    NotificationComponent,
  ],
  imports: [
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatGridListModule,
    NgxMatDatetimePickerModule,
    FormsModule,
    FilterSearchModule,
    MatProgressSpinnerModule,
    ComponentsModule,
    SpatialTemporalControlsModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatTreeModule,
    MatCheckboxModule,
    DirectivesModule,
    ServicesModule,
    DataConfigurationModule,
  ],
  exports: [
    DataPanelComponent,
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
    { provide: MatPaginatorIntl, useClass: MyPaginatorIntl },
    { provide: ResultsPanelComponent },
  ]
})

export class DataPanelModule { }
