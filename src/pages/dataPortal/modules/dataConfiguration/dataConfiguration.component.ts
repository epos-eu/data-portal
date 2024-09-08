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
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { OnAttachDetach } from 'decorators/onAttachDetach.decorator';
import { Subscription, BehaviorSubject, } from 'rxjs';
import { ParameterValue } from 'api/webApi/data/parameterValue.interface';
import { ParameterDefinition } from 'api/webApi/data/parameterDefinition.interface';
import { ParameterType } from 'api/webApi/data/parameterType.enum';
import moment from 'moment-es6';
import { SimpleParameterValue } from 'api/webApi/data/impl/simpleParameterValue';
import { BoundingBox } from 'api/webApi/data/boundingBox.interface';
import { TemporalRange } from 'api/webApi/data/temporalRange.interface';
import { SimpleTemporalRange } from 'api/webApi/data/impl/simpleTemporalRange';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ParameterDefinitions } from 'api/webApi/data/parameterDefinitions.interface';
import { SimpleBoundingBox } from 'api/webApi/data/impl/simpleBoundingBox';
import { NgForm } from '@angular/forms';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { DataConfigurableI } from 'utility/configurables/dataConfigurableI.interface';
import { DataConfigurableActionType } from 'utility/configurables/dataConfigurableAction';
import { DialogService } from 'components/dialog/dialog.service';
import { ParametersDialogService } from 'components/dialog/parametersDialog/parametersDialog.service';
import { ParameterProperty } from 'api/webApi/data/parameterProperty.enum';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';
import { DataConfigurationType } from 'utility/configurables/dataConfigurationType.enum';
import { Tracker } from 'utility/tracker/tracker.service';
import { TrackerAction, TrackerCategory } from 'utility/tracker/tracker.enum';


@OnAttachDetach('onAttachComponents')
@Unsubscriber('subscriptions')
@Component({
  selector: 'app-data-configuration',
  templateUrl: './dataConfiguration.component.html',
  styleUrls: ['./dataConfiguration.component.scss'],
})
export class DataConfigurationComponent implements OnInit, AfterViewInit {

  @Input() dataConfigurableSource: BehaviorSubject<null | DataConfigurableI>;
  @Input() showExpandButton: boolean;
  @ViewChild('thisForm', { static: true }) form!: NgForm;

  public readonly PARAMETER_TYPE_ENUM = ParameterType;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly PARAMETER_OUTPUT_FORMAT_PROPERTY = ParameterProperty.OUTPUT_FORMAT;

  public readonly DATA_CONFIGURATION_TYPE = DataConfigurationType;

  public dataConfigurable: null | DataConfigurableI = null;
  public dataConfigurableActionType = DataConfigurableActionType;
  public isOnlyDownloadable = false;

  public otherParameters = new Array<ParameterDefinition>();
  public currentValues: Record<string, unknown> = {};

  public showLoading = true;

  public spatialBounds: null | BoundingBox;
  public spatialBoundslDisabled = false;

  public hasTemporalRange = false;
  public temporalRangeSource = new BehaviorSubject<TemporalRange>(SimpleTemporalRange.makeUnbounded());
  public temporalControlDisabledSource = new BehaviorSubject<boolean>(false);

  public totPar: number;
  public totParValue: number;
  public showApplyButton = false;

  public serviceDocumentation: string;

  public formType: DataConfigurationType = DataConfigurationType.DATA;

  protected parameterDefinitions: ParameterDefinitions;

  private updateTimeout: NodeJS.Timeout;

  private readonly subscriptions = new Array<Subscription>();

  constructor(
    protected readonly cdr: ChangeDetectorRef,
    protected readonly dialogService: DialogService,
    protected readonly paramsDialogService: ParametersDialogService,
    protected readonly localStoragePersister: LocalStoragePersister,
    protected readonly tracker: Tracker,
  ) {
  }

  public ngOnInit(): void {

    this.subscriptions.push(
      this.dataConfigurableSource.subscribe(() => {
        this.resetInputs();
      }),
    );
  }

  public ngAfterViewInit(): void {
    this.subscriptions.push(
      this.form.valueChanges!.subscribe((value) => {
        this.updateConfigurableValues();

      }),
      this.form.statusChanges!.subscribe((status) => {
        const valid = ('VALID' === status);
        if (null != this.dataConfigurable) {
          this.dataConfigurable.setValid(valid);
        }
        this.updateConfigurableValues();
      })
    );
    this.paramsDialogService.setDataConfiguration(this.dataConfigurableSource);

    if (this.formType !== null) {
      this.temporalControlDisabledSource.next(false);
      this.spatialBoundslDisabled = false;
    }
  }



  public resetInputs(): void {
    this.dataConfigurable = this.dataConfigurableSource.getValue();

    this.showLoading = (this.dataConfigurable == null);

    if (null != this.dataConfigurable) {

      this.isOnlyDownloadable = this.dataConfigurable.isOnlyDownloadable();

      this.parameterDefinitions = this.dataConfigurable.getParameterDefinitions();

      this.initSpatialControl(this.dataConfigurable);
      this.initTemporalControl(this.dataConfigurable);
      this.initParameters(this.dataConfigurable);

      const distributionDetails = this.dataConfigurable.getDistributionDetails();
      this.serviceDocumentation = distributionDetails.getDocumentation().trim();

      // saves the last selected distribution
      this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, distributionDetails.getIdentifier(), false, LocalStorageVariables.LS_LAST_SELECTED_ID);

      this.updateConfigurableValues();

      this.showLoading = false;
    }
  }

  public changeBBox(bbox?: BoundingBox): void {
    this.spatialBounds = (null == bbox) ? SimpleBoundingBox.makeUnbounded() : bbox;
    this.updateConfigurableValues();
  }

  public spatialLinkToggle(change: MatSlideToggleChange): void {
    this.dataConfigurable!.setSpatialLinked(!change.checked);
  }

  public temporalLinkToggle(change: MatSlideToggleChange): void {
    this.dataConfigurable!.setTemporalLinked(!change.checked);
  }

  public openParametersDialog(): void {

    // track
    this.tracker.trackEvent(TrackerCategory.DISTRIBUTION, TrackerAction.EXPAND_PARAMETERS, this.dataConfigurable?.getDistributionDetails().getDomainCode() + Tracker.TARCKER_DATA_SEPARATION + this.dataConfigurable?.getDistributionDetails().getName());


    const elemPosition = document.getElementById('distributionListTable')!.getBoundingClientRect();

    void this.dialogService.openParametersDialog(
      this.dataConfigurable?.getDistributionDetails().getIdentifier(),
      '50vw',
      '100px',
      String(elemPosition.right + 45) + 'px',
      DataConfigurationType.DATA,
      this.dataConfigurable?.getDistributionDetails().getName()
    ).then(() => {
      this.updateConfigurableValues();
    });
  }

  public openServiceDocumentation(): void {
    // track
    this.tracker.trackEvent(TrackerCategory.DISTRIBUTION, TrackerAction.OPEN_DOCUMENTATION, this.dataConfigurable?.getDistributionDetails().getDomainCode() + Tracker.TARCKER_DATA_SEPARATION + this.dataConfigurable?.getDistributionDetails().getName());

    window.open(this.serviceDocumentation, '_blank');
  }

  public openDownloadsDialog(): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const elemPosition = document.getElementById('sidenavleft')!.getBoundingClientRect();

    // track
    this.tracker.trackEvent(TrackerCategory.DISTRIBUTION, TrackerAction.OPEN_DOWNLOAD, this.dataConfigurable?.getDistributionDetails().getDomainCode() + Tracker.TARCKER_DATA_SEPARATION + this.dataConfigurable?.getDistributionDetails().getName());

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    void this.dialogService.openDownloadsDialog(
      this.dataConfigurable,
      '50vw',
      String(elemPosition.top) + 'px',
      String(elemPosition.right) + 'px',
    );
  }

  public openAddToEnvDialog(): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const elemPosition = document.getElementById('sidenavleft')!.getBoundingClientRect();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    void this.dialogService.openAddToEnvDialog(
      this.dataConfigurable,
      '50vw',
      String(elemPosition.top) + 'px',
      String(elemPosition.right) + 'px',
    );
  }

  /**
   * The saveForm function closes a popup.
   */
  protected saveForm(): void {
  }

  protected refreshParameterValues(paramValues: Array<SimpleParameterValue>): void {

    const otherParams = this.parameterDefinitions.getOtherParameters();
    this.otherParameters = ((null != otherParams) ? otherParams : [])
      .sort((a: ParameterDefinition, b: ParameterDefinition) => {
        if (a.optional !== b.optional) {
          return (a.optional ? 1 : -1);
        } else {
          return (a.label < b.label ? -1 : 1);
        }
      });

    paramValues.forEach((paramVal: ParameterValue) => {
      const paramDef = this.otherParameters.find(def => (def.name === paramVal.name));

      if (null != paramDef) {
        if (paramDef.multipleValue === 'true') {
          this.currentValues[paramVal.name] = (this.stringToValue(paramDef, paramVal.value) as string).split(',');
        } else {
          this.currentValues[paramVal.name] = this.stringToValue(paramDef, paramVal.value);
        }
      }
    });
  }

  private initParameters(dataConfigurable: DataConfigurableI): void {
    const paramValues: Array<SimpleParameterValue> = [];

    // reloads the parameters of the last selected distribution
    const lastSelectedId = this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_LAST_SELECTED_ID);
    if (lastSelectedId === dataConfigurable?.id) {
      paramValues.push(...dataConfigurable.currentParamValues.slice());
    }

    paramValues.push(...dataConfigurable.getNewParameterValues().slice());

    // update values
    this.currentValues = {};
    this.otherParameters = [];

    // ensure changes take effect
    this.cdr.detectChanges();

    this.refreshParameterValues(paramValues);
  }

  private initSpatialControl(dataConfigurable: DataConfigurableI): void {
    this.spatialBounds = (this.parameterDefinitions.hasSpatialParameters())
      ? dataConfigurable.getNewSpatialBounds()
      : null;

    this.spatialBoundslDisabled = dataConfigurable.isSpatialLinked();
  }

  private initTemporalControl(dataConfigurable: DataConfigurableI): void {
    this.hasTemporalRange = this.parameterDefinitions.hasTemporalParameters();
    if (this.hasTemporalRange) {
      this.temporalRangeSource.next(dataConfigurable.getNewTemporalRange());
      this.subscriptions.push(
        this.temporalRangeSource.subscribe(() => {
          this.updateConfigurableValues();
        })
      );
      this.temporalControlDisabledSource.next(dataConfigurable.isTemporalLinked());
    }
  }

  private updateConfigurableValues(): void {
    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => {

      this.totParValue = 0;
      this.totPar = 0;
      if (this.dataConfigurable != null) {
        const paramValues = new Array<ParameterValue>();

        this.otherParameters.forEach((paramDef: ParameterDefinition) => {
          const control = this.form.control.get(paramDef.name);
          if (null != control) {

            const value = this.valueToString(paramDef, control.value);

            if (paramDef.type === ParameterType.BOOLEAN) {
              if (value === 'true') {
                this.totParValue++;
              }
            } else {
              if (value !== '' && paramDef.readOnlyValue !== 'true' && paramDef.property !== this.PARAMETER_OUTPUT_FORMAT_PROPERTY) {
                this.totParValue++;
              }
            }

            paramValues.push(new SimpleParameterValue(paramDef.name, value));
          }

          if (paramDef.readOnlyValue !== 'true' && paramDef.property !== this.PARAMETER_OUTPUT_FORMAT_PROPERTY) {
            this.totPar++;
            this.showApplyButton = true;
          }
        });

        if (null != this.spatialBounds) {
          this.parameterDefinitions.updateSpatialParamsUsingBounds(this.spatialBounds, paramValues);

          this.totPar++;
          this.showApplyButton = true;

          if (this.spatialBounds.isBounded()) {
            this.totParValue++;
          }
        }

        if (this.hasTemporalRange) {
          this.parameterDefinitions.updateTemporalParamsUsingRange(this.temporalRangeSource.getValue(), paramValues);

          this.totPar++;
          this.showApplyButton = true;

          const temporalRangeParams = this.dataConfigurable.getNewTemporalRange();
          if (!temporalRangeParams.isUnbounded()) {
            this.totParValue++;
          }

        }

        this.dataConfigurable.setNewParams(paramValues);
      }

    }, 50);
  }

  private valueToString(def: ParameterDefinition, value: unknown): string {
    let returnVal;
    switch (def.type) {
      case (ParameterType.DATE):
      case (ParameterType.DATETIME):
        returnVal = (null === value) ? '' : moment.utc(value as moment.MomentInput).format(def.format);
        break;
      case (ParameterType.BOOLEAN):
        returnVal = (value === true) ? 'true' : 'false';
        break;
      default: returnVal = value;
    }

    // TODO lint: check the adding of this String func call
    return String(returnVal ?? '');// convert nullish to empty string
  }

  private stringToValue(def: ParameterDefinition, value: string): unknown {
    let returnVal;
    switch (def.type) {
      case (ParameterType.DATE):
      case (ParameterType.DATETIME):
        returnVal = ('' === value) ? null : moment.utc(value, def.format);
        break;
      case (ParameterType.BOOLEAN):
        returnVal = (value.toLowerCase() === 'true') ? true : false;
        break;
      default: returnVal = value;
    }
    return returnVal;
  }

}
