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
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { DataConfigurableI } from 'utility/configurables/dataConfigurableI.interface';
import { DialogData } from '../baseDialogService.abstract';
import { ParametersDialogService } from './parametersDialog.service';
import { DataConfigurationType } from 'utility/configurables/dataConfigurationType.enum';
import { ParameterDefinition } from 'api/webApi/data/parameterDefinition.interface';
import { ParameterValue } from 'api/webApi/data/parameterValue.interface';

export interface DetailsDataIn {
  title: string;
  distId: string;
  component: DataConfigurationType;
}
/**
 * General purpose details dialog
 */
@Component({
  selector: 'app-parameters-dialog',
  templateUrl: './parametersDialog.component.html',
  styleUrls: ['./parametersDialog.component.scss']
})
export class ParametersDialogComponent implements OnInit {
  public selectedConfigurableSource: BehaviorSubject<null | DataConfigurableI>;
  public extraParameterDefinitions: BehaviorSubject<null | Array<ParameterDefinition>>;
  public extraParameterValues: BehaviorSubject<null | Array<ParameterValue>>;
  public formType = DataConfigurationType;

  public component: DataConfigurationType;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialog: DialogData<DetailsDataIn>,
    private readonly paramsDialogService: ParametersDialogService,
  ) {
  }

  ngOnInit(): void {
    this.selectedConfigurableSource = this.paramsDialogService.getDataConfiguration();
    this.extraParameterDefinitions = this.paramsDialogService.getExtraParameterDefinitions();
    this.extraParameterValues = this.paramsDialogService.getExtraParameterValues();
    this.component = this.dialog.dataIn.component;
  }

  public close(event: string): void {
    this.dialog.dataOut = event;
    this.dialog.close();
  }
}
