/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
import { Confirm } from './preconditions';
import { } from 'jasmine';

describe('test Check.isValidBoolean', () => {

  it('test for valid boolean', () => {
    expect(Confirm.isValidBoolean(true)).toBe(true);
    expect(Confirm.isValidBoolean(false)).toBe(true);
  });

  it('test for invalid boolean', () => {
    const isNull = null;
    const isUndefined = undefined;
    expect(Confirm.isValidBoolean(isNull)).toBe(false);
    expect(Confirm.isValidBoolean(isUndefined)).toBe(false);
  });
});

describe('test Check.isValidString', () => {

  it('test for valid strings', () => {
    expect(Confirm.isValidString('abc')).toBe(true);
    expect(Confirm.isValidString('  abc  ')).toBe(true);
    expect(Confirm.isValidString('123')).toBe(true);
    expect(Confirm.isValidString('0')).toBe(true);
    expect(Confirm.isValidString('true')).toBe(true);

    const isWhitespace = '    ';
    const isEmpty = '';
    expect(Confirm.isValidString(isWhitespace)).toBe(true);
    expect(Confirm.isValidString(isEmpty)).toBe(true);
  });

  it('test for invalid strings', () => {
    const isNull = null;
    const isUndefined = undefined;

    expect(Confirm.isValidString(isNull)).toBe(false);
    expect(Confirm.isValidString(isUndefined)).toBe(false);

  });
});

describe('test Check.isValidString strict', () => {

  it('test for valid strings', () => {
    expect(Confirm.isValidString('abc', true)).toBe(true);
    expect(Confirm.isValidString('  abc  ', true)).toBe(true);
    expect(Confirm.isValidString('123', true)).toBe(true);
    expect(Confirm.isValidString('0', true)).toBe(true);
    expect(Confirm.isValidString('true', true)).toBe(true);
  });

  it('test for invalid strings', () => {
    const isNull = null;
    const isUndefined = undefined;
    const isWhitespace = '    ';
    const isEmpty = '';
    expect(Confirm.isValidString(isNull, true)).toBe(false);
    expect(Confirm.isValidString(isUndefined, true)).toBe(false);
    expect(Confirm.isValidString(isWhitespace, true)).toBe(false);
    expect(Confirm.isValidString(isEmpty, true)).toBe(false);
  });
});

describe('test Check.isValidNumber', () => {

  it('test for valid number', () => {
    expect(Confirm.isValidNumber(0)).toBe(true);
    expect(Confirm.isValidNumber(123)).toBe(true);
    expect(Confirm.isValidNumber(1.23)).toBe(true);
    expect(Confirm.isValidNumber(-123)).toBe(true);
  });

  it('test for invalid number', () => {
    const isNull = null;
    const isUndefined = undefined;

    expect(Confirm.isValidNumber(isNull)).toBe(false);
    expect(Confirm.isValidNumber(isUndefined)).toBe(false);
    expect(Confirm.isValidNumber(NaN)).toBe(false);
    expect(Confirm.isValidNumber(Infinity)).toBe(false);
  });
});

describe('test Check.isValid', () => {

  it('test for valid any', () => {
    expect(Confirm.isValid(0)).toBe(true);
    expect(Confirm.isValid(false)).toBe(true);
    expect(Confirm.isValid('abc')).toBe(true);
    expect(Confirm.isValid('  abc  ')).toBe(true);
    expect(Confirm.isValid({})).toBe(true);
  });

  it('test for invalid any', () => {
    const isNull = null;
    const isUndefined = undefined;

    expect(Confirm.isValid(isNull)).toBe(false);
    expect(Confirm.isValid(isUndefined)).toBe(false);
    expect(Confirm.isValid(NaN)).toBe(false);
    expect(Confirm.isValid(Infinity)).toBe(false);
  });
});
