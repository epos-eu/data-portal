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
export class Confirm {
  static isValidNumber(value: number): boolean {
    if (typeof value === 'number' && value != null && !isNaN(value) && isFinite(value)) {
      return true;
    }
    return false;
  }

  static isValidString(value: string, strict = false): boolean {
    if (typeof value === 'string' && value != null && (!strict || value.trim().length > 0)) {
      return true;
    }
    return false;
  }

  static isValidBoolean(value: boolean): boolean {
    if (typeof value === 'boolean' && value != null) {
      return true;
    }
    return false;
  }

  static isValid(value: unknown, strict = false): boolean {

    if (value == null) {
      return false;
    }
    // eslint-disable-next-line brace-style
    else if (typeof value === 'boolean') {
      return Confirm.isValidBoolean(value);
    }
    // eslint-disable-next-line brace-style
    else if (typeof value === 'number') {
      return Confirm.isValidNumber(value);
    }
    // eslint-disable-next-line brace-style
    else if (typeof value === 'string') {
      return Confirm.isValidString(value, strict);
    }
    return true;
  }

  static hasValidProperty(obj: Record<string, unknown>, propertyName: string): boolean {
    if (Confirm.isValid(obj)) {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(propertyName)) {
        const prop = obj[propertyName];
        return Confirm.isValid(prop);
      }

      return false;
    }
    return false;

  }

  static requiresValidNumber(value: number): number {
    if (!Confirm.isValidNumber(value)) {
      throw new Error('expected a valid number: ' + String(value));
    }
    return value;
  }

  static requiresValidString(value: string, strict = false): string {
    if (!Confirm.isValidString(value, strict)) {
      throw new Error('expected a valid string: ' + String(value));
    }
    return value;
  }

  static requiresValidBoolean(value: boolean): boolean {
    if (!Confirm.isValidBoolean(value)) {
      throw new Error('expected a valid boolean: ' + String(value));
    }
    return value;
  }

  static requiresValid<T>(value: null | T): T {
    if (!Confirm.isValid(value)) {
      throw new Error('expected a valid object: ' + String(value));
    }
    return value as T;
  }
}
