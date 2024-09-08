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
import moment from 'moment-es6';
import { PlotType } from 'plotly.js';
import { Trace } from '../trace';

export class CovJsonData {
  private readonly _traces = new Array<Trace>();

  constructor(
    private readonly dataConfigurableId: string,
  ) {
  }

  get traces(): Array<Trace> {
    return this._traces;
  }

  public createTraces(data: Record<string, unknown>): Array<Trace> {
    Object.keys(this.getDataValue(data, ['parameters'])).forEach((key: string) => {
      const type = this.getType(this.getDataValue(data, ['domain', 'domainType']));
      const name = this.getDataValue<string>(data, ['parameters', key, 'observedProperty', 'label', 'en']);
      const description = this.getDataValue<string>(data, ['parameters', key, 'description', 'en']);
      const yUnit = this.getDataValue<string>(data, ['parameters', key, 'unit', 'symbol', 'value'], true);
      let yUnitLabel = this.getDataValue<string>(data, ['parameters', key, 'unit', 'label', 'en'], true);
      if (yUnitLabel === '') {
        yUnitLabel = this.getDataValue<string>(data, ['parameters', key, 'observedProperty', 'label', 'en'], true);
      }

      const yValues = this.getAxisValues(this.getDataValue(data, ['ranges', key]));
      const xValues = this.getAxisValues(this.getDataValue(data, ['domain', 'axes', 't']));

      if (null != type) {
        this._traces.push(new Trace(
          this.dataConfigurableId,
          key + this.dataConfigurableId,
          type,
          name,
          description,
          yUnit,
          yUnitLabel,
          yValues,
          xValues,
        ));
      }

    });
    return this._traces;
  }

  /**
   * @param valuesObject either of form:
   * numbers:
   * { "values": [0.1, 0.2, ... ,0.3] }
   * { "start": -179.5, "stop": 179.5, "num": 360 }
   * date/time:
   * { "values": ["2018-01-01T00:00:00.000Z", "2018-01-02T00:00:00.000Z", ..., "2018-01-01T23:59:00.000Z"] }
   * { "start": "2018-01-01T00:00:00.000Z", "stop": "2018-01-01T23:59:00.000Z", "num": 1440 }
   */
  // TODO lint: new return type and forced conversions to string need testing!
  public getAxisValues(valuesObject: Record<string, unknown>): Array<string> {
    let axisValues = new Array<string>();
    try {
      // values in array form
      if (null != valuesObject.values) {
        axisValues = (valuesObject.values as Array<unknown>).map(val => String(val));
      } else if (typeof valuesObject.num === 'number') {
        // values need expanding
        const count = valuesObject.num;
        if (typeof valuesObject.start === 'number') {
          axisValues = this.temporalValuesFromNumbers(valuesObject.start, Number(valuesObject.stop), count);

        } else if ((typeof valuesObject.start === 'string') && (moment.utc(valuesObject.start).isValid())) {
          axisValues = this.temporalValuesFromDateStrings(valuesObject.start, String(valuesObject.stop), count);
        }
      }
    } catch (e) {
      console.warn('CovJSON data: problem proceessing axis values', valuesObject);
    }
    return axisValues;
  }

  private temporalValuesFromDateStrings(
    startString: string,
    stopString: string,
    count: number,
  ): Array<string> {
    const start = moment.utc(startString);
    const stop = moment.utc(stopString);
    const min = Math.min(start.valueOf(), stop.valueOf());
    const max = Math.max(start.valueOf(), stop.valueOf());
    const increment = (max - min) / (count - 1);
    const expandedValues = new Array<string>();
    for (let i = min; i <= max; i += increment) {
      expandedValues.push(moment.utc(i).toISOString());
    }
    if (start.isAfter(stop)) {
      expandedValues.reverse();
    }
    return expandedValues;
  }

  private temporalValuesFromNumbers(
    start: number,
    stop: number,
    count: number,
  ): Array<string> {
    // numbers
    const min = Math.min(start, stop);
    const max = Math.max(start, stop);
    const increment = (max - min) / (count - 1);
    const expandedValues = new Array<string>();
    for (let i = min; i <= max; i += increment) {
      expandedValues.push(String(i));
    }
    if (start > stop) {
      expandedValues.reverse();
    }
    return expandedValues;
  }

  private getDataValue<T = unknown>(data: Record<string, unknown>, path: Array<string>, onlyString = false): T {
    let value = data as unknown;
    path.forEach((pathSection: string) => {
      if ((value as Record<string, unknown>)[pathSection] !== undefined) {
        value = (value as Record<string, unknown>)[pathSection];
        if (null == value) {
          return null;
        }
      }
    });

    if (onlyString === true && typeof value === 'object') {
      value = '';
    }

    return value as T;
  }

  private getType(type: string): null | PlotType {
    switch (type) {
      case ('PointSeries'): return 'scatter';
      default:
        console.warn(`Unrecognised trace type: '${type}' `);
        return null;
    }
  }

}
