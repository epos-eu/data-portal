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
import { ModelItem } from './modelItem';
import moment from 'moment-es6';
import { TemporalRange } from 'api/webApi/data/temporalRange.interface';
import { SimpleTemporalRange } from 'api/webApi/data/impl/simpleTemporalRange';

/**
 * A {@link ModelItem} that holds a {@link TemporalRange}.
 *
 * Persists as strings.
 */
export class TemporalRangeMI extends ModelItem<TemporalRange> {

  constructor(
    persist = false,
  ) {
    super(SimpleTemporalRange.makeUnbounded());
    if (persist) {
      this.setPersistFunctions(
        (modelItem: ModelItem<TemporalRange>) => this.convertToPersistanceFormat(modelItem),
        (modelItem: ModelItem<TemporalRange>, value: [string, string]) => this.convertFromPersistanceFormat(value),
      );
    }

    this.persistableOnConfigurables = true;
  }

  private convertToPersistanceFormat(modelItem: ModelItem<TemporalRange>): [null | string, null | string] {
    const lower = modelItem.get().getLowerBound();
    const upper = modelItem.get().getUpperBound();
    return [
      (lower != null) ? lower.format() : null,
      (upper != null) ? upper.format() : null,
    ];
  }

  private convertFromPersistanceFormat(value: [string, string]): Promise<TemporalRange> {
    return Promise.resolve(
      (value == null)
        ? SimpleTemporalRange.makeUnbounded()
        : SimpleTemporalRange.makeUnchecked(
          (value[0] == null) ? null : moment.utc(value[0]),
          (value[1] == null) ? null : moment.utc(value[1]),
        )
    );
  }
}
