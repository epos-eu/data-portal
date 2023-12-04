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
import { Injectable } from '@angular/core';
import { ParameterDefinition } from 'api/webApi/data/parameterDefinition.interface';
import { ParameterValue } from 'api/webApi/data/parameterValue.interface';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { DataConfigurableI } from 'utility/configurables/dataConfigurableI.interface';

@Injectable({
  providedIn: 'root'
})
export class ParametersDialogService {

  public parametersToShow: Array<ParameterDefinition>;
  public currentValues: Record<string, unknown> = {};
  public dataConfigurableSource: BehaviorSubject<null | DataConfigurableI>;
  public extraParameterDefinition: BehaviorSubject<null | Array<ParameterDefinition>>;
  public extraParameterValues: BehaviorSubject<null | Array<ParameterValue>>;

  constructor() { }

  public setParametersToShow(params: Array<ParameterDefinition>): void {
    this.parametersToShow = params;
  }
  public setCurrentValues(params: Record<string, unknown>): void {
    this.currentValues = params;
  }
  public setDataConfiguration(data: BehaviorSubject<null | DataConfigurableI>): void {
    this.dataConfigurableSource = data;
  }
  public getDataConfiguration(): BehaviorSubject<null | DataConfigurableI> {
    return this.dataConfigurableSource;
  }
  public setExtraParameterDefinitions(data: BehaviorSubject<null | Array<ParameterDefinition>>): void {
    this.extraParameterDefinition = data;
  }
  public getExtraParameterDefinitions(): BehaviorSubject<null | Array<ParameterDefinition>> {
    return this.extraParameterDefinition;
  }
  public setExtraParameterValues(data: BehaviorSubject<null | Array<ParameterValue>>): void {
    this.extraParameterValues = data;
  }
  public getExtraParameterValues(): BehaviorSubject<null | Array<ParameterValue>> {
    return this.extraParameterValues;
  }
}
