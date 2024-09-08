/* eslint-disable @typescript-eslint/member-ordering */
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
import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { DataConfigurable } from 'utility/configurables/dataConfigurable.abstract';
import { Trace } from '../objects/trace';
import { Styler, graphDefaultStyles } from 'utility/styler/styler';
import { YAxis } from '../objects/yAxis';
import { Subscription } from 'rxjs';
import { DataConfigurableDataSearch } from 'utility/configurablesDataSearch/dataConfigurableDataSearch';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { TraceSelectorService } from './traceSelector.service';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';

/**
 * Allows a user to select which traces to display on the associated graph.
 */
@Unsubscriber('subscriptions')
@Component({
  selector: 'app-data-trace-selector',
  templateUrl: './traceSelector.component.html',
  styleUrls: ['./traceSelector.component.scss']
})
export class TraceSelectorComponent implements OnInit, AfterViewInit {
  /** An EventEmitter that allows changes in the selected items to be passed to the parent */
  @Output() selectedTraces = new EventEmitter<Array<Trace>>();

  @Output() loading = new EventEmitter<boolean>();

  /** The `traceSelectorExpanded` variable is a boolean flag that determines whether the trace selector
  component is expanded or collapsed. It is used to control the visibility of the trace selector in
  the user interface. */
  public traceSelectorExpanded: boolean;

  /**
   * A Record associating a {@link DataConfigurable} id with the {@link Trace}s that were derived from it.
   */
  public traceRecord: Record<string, null | Array<Trace>>;

  /** {@link DataConfigurable} associated with traces.  Used for iterating through in the display */
  public configurables = new Array<DataConfigurableDataSearch>();

  /** Used in the display to disable the add buttons when the trace count limit is reached. */
  public addIsDisabled = false;

  /** Array of the currently selected {@link Trace} objects. */
  public _selectedTraces: Record<string, Trace> = {};

  /**
   * Setter that sets {@link #traceMap} then calls {@link #updateDistributionPlotList}.
   */
  @Input() set traceMap(traceMap: Map<DataConfigurableDataSearch, null | Array<Trace>>) {
    this.updateDistributionPlotList(traceMap);
  }

  /**
   * {@link Style} objects assigned to and used in the display of selected traces.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  private readonly TRACE_STYLES = graphDefaultStyles;

  /** Maximum number of {@link Trace}s that can be selected at one time. */
  // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  public readonly MAX_SELECTED_TOGGLES = this.TRACE_STYLES.length;

  /** {@link Styler} object used to manage assigning {@link Style}s to {@link Trace}s. */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  private readonly styler = new Styler(this.TRACE_STYLES);

  /** Variable for keeping track of subscriptions, which are cleaned up by Unsubscriber */
  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(
    private readonly panelsEvent: PanelsEmitterService,
    private readonly traceSelector: TraceSelectorService,
    private readonly localStoragePersister: LocalStoragePersister,
  ) {
    this.traceSelectorExpanded = false;
  }

  public ngAfterViewInit(): void {
    this.loading.emit(true);
    setTimeout(() => {

      const tracesSelected = JSON.parse(this.localStoragePersister.getValue(LocalStorageVariables.LS_CONFIGURABLES, LocalStorageVariables.LS_DATA_TRACES_SELECTED) as string ?? '[]') as Array<string>;

      const allTraces = this.getAllTraces(this.traceRecord);
      const traceToSelect: Array<Trace> = [];

      tracesSelected.forEach((traceId: string) => {

        allTraces.forEach(_t => {
          if (_t.id === traceId) {
            // set yaxis
            _t.yAxis = _t.generateYAxis();
            this.styler.assignStyle(_t, Object.values(traceToSelect));
            traceToSelect.push(_t);
          }
        });

      });

      this.setSelectedTraces(traceToSelect);
      this.loading.emit(false);
    }, 5000);
  }

  public ngOnInit(): void {
    this.subscriptions.push(

      // open and close traceSelector when open and close right bottom sidenav
      this.panelsEvent.invokeGraphPanel.subscribe((sidenavStatus: boolean) => {
        this.traceSelectorExpanded = sidenavStatus;
      }),

      // select trace for specific layerId (used by timeseries popup button)
      this.traceSelector.traceSelectedObs.subscribe((traceSelector) => {
        const layerId = traceSelector[0];
        const traceId = traceSelector[1] ?? '';
        const selected = traceSelector[2] ?? true;
        const trace = this.traceRecord[layerId]?.filter(traceObj => (traceObj.id === traceId));

        if (trace !== undefined && trace.length > 0) {
          this.setSelected(trace[0], selected);
        }

      })
    );
  }


  /** Returns an ARray of {@link Trace} objects associated with the passed in {@link YAxis} object. */
  public getTracesForYAxis(yAxis: YAxis): Array<Trace> {
    return Object.values(this._selectedTraces).filter(thisTrace => (thisTrace.yAxis === yAxis));
  }

  /**
   * The function `selectTrace` sets the trace selector for a specific layer and trace
   * based on the selected boolean value.
   * @param {string} layerId - LayerId is a string that represents the identifier of a specific layer
   * in the application.
   * @param {Trace} trace - The `trace` parameter is an object that likely contains information about a
   * trace, such as its id, name, type, or other relevant data.
   * @param {boolean} selected - The `selected` parameter in the `selectTrace` function is
   * a boolean value that indicates whether the trace should be selected or not. If `selected` is
   * `true`, the trace will be selected; if `selected` is `false`, the trace will be deselected.
   */
  public selectTrace(layerId: string, trace: Trace, selected: boolean): void {
    this.traceSelector.setTraceSelector(layerId, trace.id, selected);
  }

  /**
   *
   * Called by the display to select or deselect a {@link Trace}.
   * @param trace The Trace object.
   * @param selected Whether selecting or deselecting.
   * @param yAxis The Y-axis that this selection will share.
   */
  public setSelected(trace: Trace, selected: boolean, yAxis?: YAxis): void {
    if (selected && this.addIsDisabled) {
      // do nothing
    } else {
      // always try to remove the trace if exists
      const traceToRemove = this._selectedTraces[trace.id];
      if (null != traceToRemove) {
        delete this._selectedTraces[trace.id];
        traceToRemove.setStyle(null);
        traceToRemove.yAxis = null;
      }

      if (selected) {
        // add the trace
        this._selectedTraces[trace.id] = trace;
        // set styling
        this.styler.assignStyle(trace, Object.values(this._selectedTraces));
        // set yaxis
        trace.yAxis = (null == yAxis) ? trace.generateYAxis() : yAxis;
      }

      this.localStoragePersister.set(
        LocalStorageVariables.LS_CONFIGURABLES,
        JSON.stringify(Object.keys(this._selectedTraces)),
        false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        LocalStorageVariables.LS_DATA_TRACES_SELECTED
      );

      this.setSelectedTraces(Object.values(this._selectedTraces));
    }
  }

  /** Called after the {@link #traceRecord} vraiable changes to update component. */
  private updateDistributionPlotList(traceMap: Map<DataConfigurableDataSearch, null | Array<Trace>>): void {
    this.traceRecord = {};
    traceMap.forEach((traces: null | Array<Trace>, config: DataConfigurable) => {
      this.traceRecord[config.id] = traces;
    });

    const newConfigurables = Array.from(traceMap.keys());

    const allTraces = this.getAllTraces(this.traceRecord);

    // refresh selectedTraces
    const newSelectedTraces = Object.values(this._selectedTraces).map((previouslySelectedtrace: Trace) => {
      // find new version of traces
      let traceToKeep = allTraces.find((thisTrace: Trace) => {
        const isUpdateOfTrace = ((thisTrace.originatingConfigurableId === previouslySelectedtrace.originatingConfigurableId)
          && (thisTrace.id === previouslySelectedtrace.id));

        if (isUpdateOfTrace) {
          // transfer Y-axis and style across
          thisTrace.yAxis = previouslySelectedtrace.yAxis;
          thisTrace.setStyle(previouslySelectedtrace.getStyle());
        }
        return (isUpdateOfTrace);
      });
      // if not found, check if currently updating
      if (null == traceToKeep) {
        // if configurable value is null we're updating it, so keep the previous version of traces
        if ((null != previouslySelectedtrace) && (null == this.traceRecord[previouslySelectedtrace.originatingConfigurableId])) {
          traceToKeep = previouslySelectedtrace;
        }
      }
      return traceToKeep;
    }).filter(trace => (null != trace)); // filter nulls

    this.setSelectedTraces(newSelectedTraces as Array<Trace>);

    this.configurables = newConfigurables;
  }

  /** Emits the updated list of selected {@link Trace}s, via {@link #selectedTraces}. */
  private setSelectedTraces(selectedTraces: Array<Trace>): void {
    this.addIsDisabled = (selectedTraces.length === this.MAX_SELECTED_TOGGLES);
    // creates new array with slice to trigger change
    this.selectedTraces.emit(selectedTraces.slice());

    // refresh the variable to trigger change detection
    const traceRecord = {};
    selectedTraces.forEach(trace => traceRecord[trace.id] = trace);
    this._selectedTraces = {
      ...traceRecord,
    };
  }

  /**
   * Returns an Array of all the traces in the values of the passed in Map object.
   * @param traceMap
   */
  private getAllTraces(traceRecord: Record<string, null | Array<Trace>>): Array<Trace> {
    const traceArrays = Object.values(traceRecord).filter(array => (null != array)) as Array<Array<Trace>>;
    return new Array<Trace>().concat(...traceArrays);
  }

}
