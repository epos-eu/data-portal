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
import { Style } from 'utility/styler/style';
import { Stylable } from 'utility/styler/stylable.interface';
import { YAxis } from './yAxis';
import { BehaviorSubject } from 'rxjs';
import { Data, PlotType } from 'plotly.js';


export type ModePlotly =
  | 'lines'
  | 'markers'
  | 'text'
  | 'lines+markers'
  | 'text+markers'
  | 'text+lines'
  | 'text+lines+markers'
  | 'none'
  | 'gauge'
  | 'number'
  | 'delta'
  | 'number+delta'
  | 'gauge+number'
  | 'gauge+number+delta'
  | 'gauge+delta';


export class Trace implements Stylable {
  public yAxis: null | YAxis;

  public yErrorMaxValues: Array<string> | null = null;

  public yErrorMinValues: Array<string> | null = null;

  private readonly styleSrc = new BehaviorSubject<null | Style>(null);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly styleObs = this.styleSrc.asObservable();

  constructor(
    public readonly originatingConfigurableId: string,
    public readonly id: string,
    public readonly type: PlotType,
    public readonly name: string,
    public readonly description: string,
    public readonly yUnit: string,
    public readonly yUnitLabel: string,
    public readonly yValues: Array<string>,
    public readonly xValues: Array<string>,
    public readonly mode?: ModePlotly,
  ) {}

  public setStyle(style: null | Style): void {
    this.styleSrc.next(style);
  }

  public getStyle(): null | Style {
    return this.styleSrc.value;
  }

  public getPlotlyTrace(): null | Data {
    if (null == this.yAxis) {
      console.warn(`No yAxis set on Trace id:"${this.id}", name:"${this.name}"`);
      return null;
    } else {
      const trace: Data = {
        x: this.xValues,
        y: this.yValues,
        name: this.name,
        yaxis: `y${this.yAxis.index + 1}`,
        showlegend: false,
        type: this.type,
        mode: this.mode,
        line: {
          color: this.getStyle()!.getColor1String(),
        },
      };
      // Check if error values are present and add them to the trace
      if (this.yErrorMaxValues && this.yErrorMinValues) {
        trace.error_y = {
          type: 'data',
          array: this.yErrorMaxValues, // Upper error values
          arrayminus: this.yErrorMinValues, // Lower error values
          visible: true,
          color: this.getStyle()!.getColor1String(),
          thickness: 0.2,
          width: 6,
        };
      }
      return trace;
    }
  }

  public generateYAxis(): YAxis {
    let label = '';
    if (this.description.includes('error')) {
      label = `${this.yUnitLabel} (${this.description})`;
    } else {
      label = `${this.yUnitLabel} (${this.yUnit})`;
    }
    return new YAxis(this.yUnit, label);
  }
}

