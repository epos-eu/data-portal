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
import { } from 'jasmine';
import moment from 'moment-es6';
import { CovJsonData } from './covJsonData';

fdescribe('test axis values - long form - numbers', () => {
  it('forwards : 51 numbers : 0.22 increments', () => {
    const expectedResult = new Array<number>();
    for (let i = 10.1; i <= 21.1; i += 0.22) {
      expectedResult.push(i);
    }

    const result = new CovJsonData('123')
      .getAxisValues({
        values: expectedResult,
      });

    expect(result.length).toBe(expectedResult.length);
    expect(result).toEqual(expectedResult);
  });

  it('backwards : 11 numbers : 0.5 decrements', () => {
    const expectedResult = new Array<number>();
    for (let i = 15; i >= 10; i -= 0.5) {
      expectedResult.push(i);
    }

    const result = new CovJsonData('123')
      .getAxisValues({
        values: expectedResult,
      });

    expect(result.length).toBe(expectedResult.length);
    expect(result).toEqual(expectedResult);
  });
});


fdescribe('test axis values - short form - numbers', () => {
  it('forwards : 51 numbers : 0.22 increments', () => {
    const expectedResult = new Array<number>();
    for (let i = 10.1; i <= 21.1; i += 0.22) {
      expectedResult.push(i);
    }

    const result = new CovJsonData('123')
      .getAxisValues({
        start: 10.1,
        stop: 21.1,
        num: 51,
      });

    expect(result.length).toBe(expectedResult.length);
    expect(result).toEqual(expectedResult);
  });

  it('backwards : 11 numbers : 0.5 decrements', () => {
    const expectedResult = new Array<number>();
    for (let i = 15; i >= 10; i -= 0.5) {
      expectedResult.push(i);
    }

    const result = new CovJsonData('123')
      .getAxisValues({
        start: 15,
        stop: 10,
        num: 11,
      });

    expect(result.length).toBe(expectedResult.length);
    expect(result).toEqual(expectedResult);
  });
});


fdescribe('test axis values - long form - dates', () => {
  it('forwards : 51 dates : 1y 1m 1d 1h 1min 1s increment', () => {
    const currentMoment = moment('2015-01-01T01:01:01.000Z');
    const expectedResult = [currentMoment.toISOString()];
    for (let i = 0; i < 50; i++) {
      expectedResult.push(currentMoment
        .add(1, 'year')
        .add(1, 'month')
        .add(1, 'day')
        .add(1, 'hour')
        .add(1, 'minute')
        .add(1, 'second')
        .toISOString());
    }

    const result = new CovJsonData('123')
      .getAxisValues({
        values: expectedResult,
      });

    expect(result.length).toBe(expectedResult.length);
    expect(result).toEqual(expectedResult);
  });

  it('backwards : 11 dates : 2y 2m 2d 2h 2min 2s decrement', () => {
    const currentMoment = moment('2015-01-01T01:01:01.000Z');
    const expectedResult = [currentMoment.toISOString()];
    for (let i = 0; i < 10; i++) {
      expectedResult.push(currentMoment
        .subtract(2, 'year')
        .subtract(2, 'month')
        .subtract(2, 'day')
        .subtract(2, 'hour')
        .subtract(2, 'minute')
        .subtract(2, 'second')
        .toISOString());
    }

    const result = new CovJsonData('123')
      .getAxisValues({
        values: expectedResult,
      });

    expect(result.length).toBe(expectedResult.length);
    expect(result).toEqual(expectedResult);
  });
});

fdescribe('test axis values - short form - dates', () => {
  it('forwards : 51 dates : 100d 1h 1min 1s increment', () => {
    const currentMoment = moment.utc('2015-01-01T01:01:01.000Z');
    const expectedResult = [currentMoment.toISOString()];
    for (let i = 0; i < 50; i++) {
      expectedResult.push(currentMoment
        .add(100, 'day')
        .add(1, 'hour')
        .add(1, 'minute')
        .add(1, 'second')
        .toISOString());
    }

    const result = new CovJsonData('123')
      .getAxisValues({
        start: expectedResult[0],
        stop: expectedResult[expectedResult.length - 1],
        num: expectedResult.length,
      });
    expect(result.length).toBe(expectedResult.length);
    expect(result).toEqual(expectedResult);
  });

  it('backwards : 11 dates : 200d 2h 2min 2s decrement', () => {
    const currentMoment = moment.utc('2015-01-01T01:01:01.000Z');
    const expectedResult = [currentMoment.toISOString()];
    for (let i = 0; i < 10; i++) {
      expectedResult.push(currentMoment
        .subtract(200, 'day')
        .subtract(2, 'hour')
        .subtract(2, 'minute')
        .subtract(2, 'second')
        .toISOString());
    }

    const result = new CovJsonData('123')
      .getAxisValues({
        start: expectedResult[0],
        stop: expectedResult[expectedResult.length - 1],
        num: expectedResult.length,
      });

    expect(result.length).toBe(expectedResult.length);
    expect(result).toEqual(expectedResult);
  });
});
