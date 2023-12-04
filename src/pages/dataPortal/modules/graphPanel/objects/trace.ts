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

export class Trace implements Stylable {
  public yAxis: null | YAxis;
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
  ) { }

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
      return {
        x: this.xValues,
        y: this.yValues,
        name: this.name,
        yaxis: `y${this.yAxis.index + 1}`,
        showlegend: false,
        type: this.type,
        line: {
          color: this.getStyle()!.getColor1String(),
        },
      } as Data;
    }
  }

  public generateYAxis(): YAxis {
    return new YAxis(this.yUnit, this.yUnitLabel);
  }
}
