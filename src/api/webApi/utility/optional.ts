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

export class Optional<T> {
  private constructor(private readonly value: T) { }

  static ofNullable<T>(value: T | null): Optional<null | T> {
    return new Optional(value);
  }

  static ofNonNullable<T>(value: T): Optional<T> {
    if (value == null) {
      throw new TypeError('optional value is null or undefined');
    }
    return new Optional(value);
  }

  static empty(): Optional<null> {
    return new Optional<null>(null);
  }

  isPresent(): boolean {
    return (this.value != null);
  }

  isEmpty(): boolean {
    return !this.isPresent();
  }

  get(): T {
    if (!this.isPresent()) {
      throw new TypeError('optional value is null or undefined');
    }
    return this.value;
  }

  ifPresent(consumer: (value: T) => void): void {
    if (this.isPresent()) {
      consumer(this.value);
    }
  }

  ifEmpty(run: () => void): void {
    if (this.isEmpty()) {
      run();
    }
  }

  map<U>(mapper: (value: T) => U): Optional<null | U> {
    return this.isPresent() ? Optional.ofNullable(mapper(this.value)) : Optional.empty();
  }

  orElse(other: null | T = null): null | T {
    return this.isPresent() ? this.value : other;
  }

  orThrow(error: unknown): T {
    if (!this.isEmpty()) {
      throw error;
    }
    return this.value;
  }

  orUse(supplier: () => T): Optional<null | T> {
    return this.isPresent() ? this : Optional.ofNullable(supplier());
  }

  orNull(): null | T {
    return this.isPresent() ? this.value : null;
  }

  filter(predicate: (value: T) => boolean): Optional<null | T> {
    if (this.isPresent()) {
      return (predicate(this.value)) ? this : Optional.empty();
    }

    return this;
  }

  toJSON(key: string): unknown {
    return this.isPresent() ? this.value : null;
  }
}
