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
import { Injectable } from '@angular/core';
import { ModelBase } from './modelBase.abstract';
import { ModelItem } from './modelItems/modelItem';
import { LocalStoragePersister } from './persisters/localStoragePersister';
import { ItemSummary } from 'api/webApi/data/itemSummary.interface';
import { BoundingBox } from 'api/webApi/data/boundingBox.interface';
import { UserMI } from './modelItems/userMI';
import { DiscoverResponse } from 'api/webApi/classes/discoverApi.interface';
import { SimpleBoundingBox } from 'api/webApi/data/impl/simpleBoundingBox';
import { TemporalRangeMI } from './modelItems/temporalRangeMI';
import { DomainMI } from './modelItems/domainMI';
import { DataSearchConfigurablesMI } from 'services/model/modelItems/dataSearchConfigurablesMI';
import { KeywordsMI } from './modelItems/keywordsMI';
import { CountryMI } from './modelItems/countryMI';
import { FacetLeafItemMI } from './modelItems/facetLeafItemMI';
import { TypeDataMI } from './modelItems/typeDataMI';
import { LocalStorageVariables } from './persisters/localStorageVariables.enum';

/**
 * The model service is a globally accessible single point of truth.  It is a wrapper for
 * {@link ModelItem}s, which are publicly accessible, updatable data objects that are
 * instances of the {@link ModelItem} class.
 *
 * In order to keep this class simple, this extends the {@link ModelBase} class, where most of
 * the functionality is defined.
 *
 * NOTE: The infrastructure page is currently not available, so although referenced, the
 * infrastructure variables are not really used and are likely to be removed/changed with the
 * infrastructure page code in the near future.
 *
 * @example
 *  public aSimpleExampleValue = new ModelItem<string>()
 *    .setDefaultValueFunction(() => Promise.resolve('sausage'))
 *    .setPersistable();
 */
@Injectable()
export class Model extends ModelBase {

  // START GENERAL ITEMS
  /**
   * A {@link UserMI} for accessing the current authenticated {@link AAAIUser}.
   */
  public user = new UserMI();

  // END GENERAL ITEMS

  // START DATA SEARCH ITEMS
  /**
   * A {@link ModelItem} for accessing the current {@link BoundingBox} selected on
   * the data search page.
   * Item is persisted.
   */
  public dataSearchBounds = ModelItem.make<BoundingBox>(SimpleBoundingBox.makeUnbounded())
    .setPersistFunctions(
      (modelItem: ModelItem<BoundingBox>) => (!modelItem.get().isBounded())
        ? null
        : modelItem.get().asArray(),
      (modelItem: ModelItem<BoundingBox>, value: null | [number, number, number, number]) => {
        return Promise.resolve((value == null)
          ? SimpleBoundingBox.makeUnbounded()
          : SimpleBoundingBox.makeFromArray(value));
      })
    .setPersistableOnConfigurables(true);

  public dataSearchGeolocation = new CountryMI();

  public dataSearchFacetLeafItems = new FacetLeafItemMI();

  public dataSearchTypeData = new TypeDataMI();

  /**
   * A {@link TemporalRangeMI} for accessing the current {@link TemporalRange} selected on
   * the data search page.
   */
  public dataSearchTemporalRange = new TemporalRangeMI(true);

  /**
 * A {@link KeywordsMI} for accessing the current {@link Array<string>} selected on
 * the data search page.
 */
  public dataSearchKeywords = new KeywordsMI();

  /**
   * A {@link ModelItem} for accessing the current {@link DiscoverResponse} on
   * the data search page.
   */
  public dataDiscoverResponse = ModelItem.makeNullable<DiscoverResponse>();

  /**
   * A {@link DataSearchConfigurablesMI} for accessing the current array of
   * {@link DataConfigurableDataSearch} items on the data search page.
   */
  public dataSearchConfigurables = new DataSearchConfigurablesMI();

  public domainMI = new DomainMI();

  // END DATA SEARCH ITEMS

  // START INFRASTRUCTURE SEARCH ITEMS
  // The infrastructure page is currently not available, so although referenced, these
  // variables are not really used.

  /**
   * An array of four numbers representing the (n,e,s,w) bounds of the bounding box used
   * on the infrastucture search page.
   */
  public infrastructureSearchBounds = ModelItem.makeNullable<[number, number, number, number]>(); // n,e,s,w

  /**
   * A {@link ModelItem} for accessing the selected {@link ItemSummary} item from the
   * infrastructure search page search.
   */
  public infrastructureSearchSelectedItem = ModelItem.makeNullable<ItemSummary>();
  // END INFRASTRUCTURE SEARCH ITEMS

  /**
   * Initialises the object and sets the persistance to use a {@link LocalStoragePersister} as the
   * mechanism for persisting state.  This is primarily used within the GUI to ensure
   * that the state of the GUI is not lost when the page is refreshed or the user logs
   * in (which navigates the browser away from the EPOS GUI).
   */
  constructor() {
    super();
    this.setPersister(new LocalStoragePersister());
    this.init();
  }
}

export interface modelContextInterface {
  variable: string;
  context: string;
}

/** The `modelContext` constant is an array of objects that define the variables used in the `Model`
class and their corresponding context. Each object in the array has two properties: `variable` and
`context`. */
export const modelContext: modelContextInterface[] = [
  {
    variable: LocalStorageVariables.LS_DATA_SEARCH_BOUNDS,
    context: ''
  },
  {
    variable: 'dataSearchGeolocation',
    context: ''
  },
  {
    variable: LocalStorageVariables.LS_DATA_SEARCH_CONFIGURABLES,
    context: ''
  },
  {
    variable: LocalStorageVariables.LS_DATA_SEARCH_TEMPORAL_RANGE,
    context: ''
  },
  {
    variable: 'dataDiscoverResponse',
    context: ''
  },
  {
    variable: LocalStorageVariables.LS_DATA_SEARCH_FACET_LEAF_ITEMS,
    context: ''
  },
  {
    variable: LocalStorageVariables.LS_DATA_SEARCH_TYPE_DATA,
    context: ''
  },
  {
    variable: 'domainMI',
    context: ''
  }
];

