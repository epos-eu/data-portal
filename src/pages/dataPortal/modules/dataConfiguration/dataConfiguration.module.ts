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
import { ParameterValidatorDirective } from './parameterValidator.directive';
import { DataConfigurationComponent } from './dataConfiguration.component';
import { SelectCheckAllComponent } from './selectCheckAll/selectCheckAll.component';
import { StringToMomentPipe } from './stringToMoment.pipe';
import { FirstErrorMessagePipe } from './firstErrorMessage.pipe';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { SpatialTemporalControlsModule } from '../temporalSpatialControls/spatialTemporalControls.module';

@NgModule({
  declarations: [
    ParameterValidatorDirective,
    DataConfigurationComponent,
    SelectCheckAllComponent,
    StringToMomentPipe,
    FirstErrorMessagePipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatOptionModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    NgxMatDatetimePickerModule,
    MatSlideToggleModule,
    MatInputModule,
    SpatialTemporalControlsModule,
  ],
  exports: [
    DataConfigurationComponent,
    ParameterValidatorDirective,
    StringToMomentPipe,
    SelectCheckAllComponent,
    FirstErrorMessagePipe,
  ],
  providers: [
  ]
})

export class DataConfigurationModule { }
