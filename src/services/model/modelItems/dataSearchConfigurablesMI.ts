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
import { Injector } from '@angular/core';
import { DataConfigurableDataSearch } from 'utility/configurablesDataSearch/dataConfigurableDataSearch';
import { DataConfigurableDataSearchI } from 'utility/configurablesDataSearch/dataConfigurableDataSearchI.interface';

/**
 * A {@link ModelItem} that holds an array of {@link DataConfigurableDataSearch} objects.
 *
 * {@link ModelItem} has been extended in this case to provide custom persistance functions
 * for serialising and deserialising the objects.
 */
export class DataSearchConfigurablesMI extends ModelItem<Array<DataConfigurableDataSearchI>> {

  constructor(
  ) {
    super([]);
    this.setPersistFunctions(
      (modelItem: ModelItem<Array<DataConfigurableDataSearchI>>) => {
        const toPersist = modelItem.get()
          .filter(configurable => configurable instanceof DataConfigurableDataSearch)
          .map((configurable: DataConfigurableDataSearch) => {
            return configurable.toSimpleObject();
          });
        return JSON.stringify(toPersist);
      },
      (modelItem: ModelItem<Array<DataConfigurableDataSearchI>>, value: string) => {
        const injector = this.getService('Injector') as Injector;
        const objectsArray = JSON.parse(value) as Array<Record<string, unknown>>;
        return Promise.all(
          objectsArray.map((obj: Record<string, unknown>) => DataConfigurableDataSearch.makeFromSimpleObject(obj, injector))
        ).then((objs: Array<null | DataConfigurableDataSearch>) => {
          // filter out nulls from unsuccessfully cached objects
          return objs.filter((obj) => (obj != null)) as Array<DataConfigurableDataSearchI>;
        });
      }
    );
  }

}
