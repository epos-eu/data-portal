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
import { Injectable, Injector } from '@angular/core';
import { Model } from 'services/model/model.service';
import { Observable } from 'rxjs';
import { Style } from 'utility/styler/style';
import { defaultStyles } from 'utility/styler/styler';
import { SearchService } from 'services/search.service';
import { DistributionDetails } from 'api/webApi/data/distributionDetails.interface';
import { BoundingBox } from 'api/webApi/data/boundingBox.interface';
import { TemporalRange } from 'api/webApi/data/temporalRange.interface';
import { DiscoverResponse } from 'api/webApi/classes/discoverApi.interface';
import { ParameterDefinitions } from 'api/webApi/data/parameterDefinitions.interface';
import { DistributionLevel } from 'api/webApi/data/distributionLevel.interface';
import { DataConfigurableDataSearchI } from 'utility/configurablesDataSearch/dataConfigurableDataSearchI.interface';
import { DataSearchConfigurablesMI } from 'services/model/modelItems/dataSearchConfigurablesMI';
import { DataConfigurableDataSearch } from 'utility/configurablesDataSearch/dataConfigurableDataSearch';
import { DataConfigurableDataSearchLoading } from 'utility/configurablesDataSearch/dataConfigurableDataSearchLoading';

@Injectable()
export class DataSearchConfigurablesService {

  // cache of configurables we last set
  private previouslySetConfigurables: Array<DataConfigurableDataSearchI>;
  private readonly configurables: DataSearchConfigurablesMI;

  constructor(
    private readonly model: Model,
    private readonly searchService: SearchService,
    private readonly injector: Injector,
  ) {
    this.configurables = this.model.dataSearchConfigurables;

    this.configurables.valueObs.subscribe((configurables: Array<DataConfigurableDataSearchI>) => {
      // if something else set the configurables, refresh them to make sure consistent
      if (configurables !== this.previouslySetConfigurables && configurables.length > 0) {
        this.refresh();
      }
    });
    this.model.dataSearchBounds.valueObs.subscribe((bbox: BoundingBox) => {
      this.updateSpatialBounds(bbox);
    });
    this.model.dataSearchTemporalRange.valueObs.subscribe((tempRange: TemporalRange) => {
      this.updateTemporalRange(tempRange);
    });
    this.model.dataDiscoverResponse.valueObs.subscribe((discoverResponse: DiscoverResponse) => {
      const selectedItem = this.getSelected();
      if ((selectedItem != null) && (discoverResponse != null)) {
        if (!selectedItem.isPinned()) {
          const results = discoverResponse.results();
          const selectedItemId = selectedItem.id;

          const foundItem = results.getFlatData().find((item) => {
            return (item.getIdentifier() === selectedItemId);
          });

          if (foundItem == null) {
            this.setSelected(null, true);
          }
        }
      }
    });
  }

  /**
   * Get a DataConfigurableDataSearchI by its id
   * @param {string} id - The id of the data search.
   * @returns An object with the following properties:
   */
  public get(id: string): DataConfigurableDataSearchI | null {
    return this.getAll().find((item) => (item.id === id)) ?? null;
  }

  /**
   * The function getAll() returns an array of objects that implement the DataConfigurableDataSearchI
   * interface.
   * @returns An array of objects that implement the `DataConfigurableDataSearchI` interface.
   */
  public getAll(): Array<DataConfigurableDataSearchI> {
    return this.configurables.get();
  }

  /**
   * The function "watchAll" returns an Observable that emits an array of DataConfigurableDataSearchI
   * objects.
   * @returns The method is returning an Observable of an array of objects that implement the
   * DataConfigurableDataSearchI interface.
   */
  public watchAll(): Observable<Array<DataConfigurableDataSearchI>> {
    return this.configurables.valueObs;
  }

  /**
   * The function `replaceOrAdd` replaces an existing object in an array with a new object if it exists,
   * otherwise it adds the new object to the array.
   * @param {DataConfigurableDataSearchI} configurable - The `configurable` parameter is an object of
   * type `DataConfigurableDataSearchI`. It represents the data that needs to be replaced or added.
   * @param [doRefresh=true] - The `doRefresh` parameter is a boolean value that determines whether to
   * trigger a refresh after replacing or adding the configurable. If `doRefresh` is `true`, a refresh
   * will be triggered; if `doRefresh` is `false`, no refresh will be triggered.
   */
  public replaceOrAdd(configurable: DataConfigurableDataSearchI, doRefresh = true): void {
    const confs = this.getAll();
    const foundIndex = confs.findIndex((thisConfigurable: DataConfigurableDataSearchI) => {
      return (configurable.id === thisConfigurable.id);
    });

    // if found replace it
    if (foundIndex > -1) {
      // updated configurable so replace old with new
      confs.splice(foundIndex, 1, configurable);
    } else {
      // just add
      this.getAll().push(configurable);
    }
    this.tryDoRefresh(doRefresh);
  }

  /**
   * The function getAllPinned returns an array of DataConfigurableDataSearch objects that are marked as
   * pinned.
   * @returns The method `getAllPinned` returns an array of `DataConfigurableDataSearch` objects.
   */
  public getAllPinned(): Array<DataConfigurableDataSearch> {
    return this.getAll().filter(item => item.isPinned()) as Array<DataConfigurableDataSearch>;
  }

  /**
   * The function `setPinned` updates the pinned status of a data configuration and optionally refreshes
   * the data.
   * @param {string} id - The id parameter is a string that represents the identifier of the data
   * configuration. It is used to retrieve the configuration from the data source.
   * @param {boolean} pinned - A boolean value indicating whether the item should be pinned or not.
   * @param [doRefresh=true] - The `doRefresh` parameter is a boolean value that determines whether or
   * not to refresh the data after updating the configuration. If `doRefresh` is set to `true`, the data
   * will be refreshed. If it is set to `false`, the data will not be refreshed. By default, the
   * @returns a Promise that resolves to void.
   */
  public setPinned(id: string, pinned: boolean, doRefresh = true): Promise<void> {
    return this.getConfig(id)
      .then((conf: DataConfigurableDataSearchI) => {
        if (conf != null) {
          this.updateConfigurable(conf, pinned, conf.isSelected(), doRefresh);
        }
      });
  }
  /**
   * The function `togglePinned` toggles the pinned status of a data configuration and returns a promise
   * that resolves to a boolean indicating whether the configuration is pinned or not.
   * @param {string} id - The `id` parameter is a string that represents the identifier of the data
   * configuration.
   * @param [doRefresh=true] - The `doRefresh` parameter is a boolean value that determines whether or
   * not to refresh the data after toggling the pinned status. If `doRefresh` is set to `true`, the data
   * will be refreshed. If it is set to `false`, the data will not be refreshed.
   * @returns The function `togglePinned` returns a Promise that resolves to a boolean value.
   */
  public togglePinned(id: string, doRefresh = true): Promise<boolean> {
    return this.getConfig(id)
      .then((conf: DataConfigurableDataSearchI) => {
        if (conf != null) {
          this.updateConfigurable(conf, !conf.isPinned(), conf.isSelected(), doRefresh);
        }
        return ((conf != null) && conf.isPinned());
      });
  }

  /**
   * The function checks if an item with a given ID is pinned and returns a boolean value.
   * @param {string} id - A string representing the ID of an item.
   * @returns a boolean value. It returns true if there is an item with the given id in the list of all
   * pinned items, and false otherwise.
   */
  public isPinned(id: string): boolean {
    const pinned = this.getAllPinned().filter(item => item.id === id);
    return pinned.length === 0 ? false : true;
  }

  /**
   * The function `setSelected` checks if the given `id` is different from the currently selected id, and
   * if so, it retrieves the configuration for the new id, ensures that only one item is selected, and
   * optionally refreshes the data.
   * @param {null | string} id - The `id` parameter is of type `null | string`, which means it can either
   * be `null` or a string value. It represents the identifier of the item to be selected.
   * @param [doRefresh=true] - The `doRefresh` parameter is a boolean value that determines whether or
   * not to refresh the data after selecting a new item. If `doRefresh` is `true`, the data will be
   * refreshed; if `doRefresh` is `false`, the data will not be refreshed. By default, `
   * @param [serviceName] - The `serviceName` parameter is a string that represents the name of a
   * service. It is an optional parameter and its default value is an empty string.
   */
  public setSelected(id: null | string, doRefresh = true, serviceName = ''): void {
    const selected = this.getSelected();
    if ((selected == null) || (id !== selected.id)) {

      void this.getConfig(id, true)
        .then(() => {
          const changed = this.ensureOnlyOneSelected(this.getAll(), id);
          this.tryDoRefresh(changed && doRefresh);
        })
        .catch((e) => {

          // remove configurable from list
          const configurables = this.configurables.get();
          configurables.forEach((item, index) => {
            if (item.id === id) {
              configurables.splice(index, 1);
            }
          });
        });
    }

  }

  /**
   * The function returns the first selected item from a list of data items, or null if no item is
   * selected.
   * @returns The method is returning either null or an object that implements the
   * DataConfigurableDataSearchI interface.
   */
  public getSelected(): null | DataConfigurableDataSearchI {
    return this.getAll().find((item) => item.isSelected()) ?? null;
  }

  /**
   * The function checks if a given id is selected and returns a boolean value.
   * @param {string} id - A string representing the ID of an item.
   * @returns a boolean value.
   */
  public isSelected(id: string): boolean {
    const selected = this.getSelected();
    return (selected != null && selected.id === id) ? true : false;
  }

  /**
   * The clearPinned function clears all pinned items and optionally refreshes the data.
   * @param [doRefresh=true] - The `doRefresh` parameter is a boolean value that determines whether to
   * refresh the data after clearing the pinned items. If `doRefresh` is `true`, the data will be
   * refreshed; if `doRefresh` is `false`, the data will not be refreshed.
   */
  public clearPinned(doRefresh = true): void {
    void Promise.all(
      this.getAll()
        .map((item: DataConfigurableDataSearchI) => this.setPinned(item.id, false, false)))
      .then(() => this.tryDoRefresh(doRefresh));
  }

  /**
   * The function updates the spatial bounds of data search configurables based on a given bounding box.
   * @param {BoundingBox} bbox - The parameter "bbox" is of type "BoundingBox".
   */
  public updateSpatialBounds(bbox: BoundingBox): void {
    this.configurables.get().forEach((configurable: DataConfigurableDataSearchI) => {
      if (configurable instanceof DataConfigurableDataSearch) {
        const paramDefs = configurable.getParameterDefinitions();
        configurable.updateLinkedSpatialParams(this.bBoxOrDefaults(paramDefs, bbox), false);
      }
    });
  }

  /**
   * The function updates the temporal range of data search configurables.
   * @param {TemporalRange} tempRange - The `tempRange` parameter is of type `TemporalRange`. It
   * represents a range of time, typically used for filtering or querying data within a specific time
   * period.
   */
  public updateTemporalRange(tempRange: TemporalRange): void {
    this.configurables.get().forEach((configurable: DataConfigurableDataSearchI) => {
      if (configurable instanceof DataConfigurableDataSearch) {
        const paramDefs = configurable.getParameterDefinitions();
        configurable.updateLinkedTemporalParams(this.tempRangeOrDefaults(paramDefs, tempRange), false);
      }
    });
  }

  /**
   * The function `addLevels` takes an `id` and an array of `DistributionLevel` objects, retrieves a
   * `DataConfigurableDataSearchI` object using the `get` method, sets the levels of the object if it
   * exists, and then triggers a refresh.
   * @param {string} id - The `id` parameter is a string that represents the identifier of the data
   * configuration.
   * @param levels - The `levels` parameter is an array of `DistributionLevel` objects.
   */
  public addLevels(id: string, levels: Array<DistributionLevel>): void {
    const conf: DataConfigurableDataSearchI | null = this.get(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    conf?.setLevels(levels);
    this.tryDoRefresh(true);
  }

  /**
   * The function updates the style of a data search configuration and triggers a refresh.
   * @param {string} id - A string representing the ID of the data to be updated.
   * @param {Style} style - The `style` parameter is of type `Style`. It represents the new style that
   * you want to update for the specified `id`.
   */
  public updateStyle(id: string, style: Style): void {

    const conf: DataConfigurableDataSearchI | null = this.get(id);
    conf?.setStyle(style);
    this.tryDoRefresh(true);
  }

  /**
   * The function creates a configurable data search object based on the distribution details and default
   * parameter values.
   * @param {string} distId - The `distId` parameter is a string that represents the ID of a
   * distribution.
   * @returns A Promise that resolves to a DataConfigurableDataSearch object.
   */
  public createConfigurable(
    distId: string,
  ): Promise<DataConfigurableDataSearch> {
    return this.searchService.getDetailsById(distId)
      .then((distributionDetails: DistributionDetails) => {
        const paramDefs = distributionDetails.getParameters();

        return new DataConfigurableDataSearch(
          this.injector,
          distributionDetails,
          paramDefs.getDefaultParameterValues(),
          this.bBoxOrDefaults(paramDefs, this.model.dataSearchBounds.get()),
          this.tempRangeOrDefaults(paramDefs, this.model.dataSearchTemporalRange.get()),
        );
      });
  }

  private refresh(): void {
    this.setAll(this.getPinnedOrSelected());
  }

  private setAll(configurables: Array<DataConfigurableDataSearchI>): void {
    this.previouslySetConfigurables = configurables;
    this.configurables.set(configurables);
  }

  private ensureOnlyOneSelected(
    items: Array<DataConfigurableDataSearchI>,
    selectedId: null | string,
  ): boolean {
    let changed = false;
    items.forEach((item: DataConfigurableDataSearchI) => {
      const thisChanged = this.updateConfigurable(
        item,
        item.isPinned(),
        (item.id === selectedId),
        false,
      );
      changed = changed || thisChanged;
    });
    return changed;
  }

  private getConfig(id: null | string, setSelectedLoadingPlaceholder = false): Promise<null | DataConfigurableDataSearchI> {
    let returnPromise = Promise.resolve<null | DataConfigurableDataSearchI>(null);
    if (id != null) {
      const conf = this.get(id);

      if (conf != null) {
        returnPromise = Promise.resolve(conf);
      } else {
        if (setSelectedLoadingPlaceholder) {
          // set a "LOADING" placeholder configurable
          this.getAll().push(new DataConfigurableDataSearchLoading(id));
          this.ensureOnlyOneSelected(this.getAll(), id);
          this.refresh();
        }

        returnPromise = this.createConfigurable(id)
          .then((newConf: DataConfigurableDataSearchI) => {
            if (newConf != null) {
              this.replaceOrAdd(newConf, false);
            }
            return newConf;
          });
      }
    }
    return returnPromise;
  }

  private getPinnedOrSelected(): Array<DataConfigurableDataSearchI> {
    return this.getAll().filter((item) => (item.isPinned() || item.isSelected()));
  }

  private tryDoRefresh(doRefresh: boolean): void {
    if (doRefresh) {
      this.refresh();
    }
  }

  private updateConfigurable(
    conf: DataConfigurableDataSearchI,
    newPinned: boolean,
    newSelected: boolean,
    doRefresh: boolean,
  ): boolean {
    const wasPinned = conf.isPinned();
    const wasSelected = conf.isSelected();

    conf.setPinned(newPinned)
      .setSelected(newSelected);

    if (conf.getStyle() === null) {
      this.ensureStylesAssigned();
    }

    const changed = ((wasPinned !== newPinned) || (wasSelected !== newSelected));
    this.tryDoRefresh(doRefresh && changed);
    return changed;
  }

  private ensureStylesAssigned(): void {
    const configurables = this.getAll();
    configurables.forEach((configurable: DataConfigurableDataSearchI) => {
      const style = configurable.getStyle();

      if (style == null) {

        // get random color by defaultStyles
        const randomPredefinedStyle = defaultStyles[Math.floor(Math.random() * defaultStyles.length)];
        randomPredefinedStyle.setId('styler_default_id_' + configurables.length.toString());

        configurable.setStyle(randomPredefinedStyle);
      }

    });
  }

  private bBoxOrDefaults(
    paramDefs: ParameterDefinitions,
    boundingBox: BoundingBox,
  ): BoundingBox {
    if ((null != paramDefs) && (!boundingBox.isBounded())) {
      boundingBox = paramDefs.getSpatialBounds(paramDefs.getDefaultParameterValues());
    }
    return boundingBox;
  }

  private tempRangeOrDefaults(
    paramDefs: ParameterDefinitions,
    tempRange: TemporalRange,
  ): TemporalRange {
    if ((null != paramDefs) && (tempRange.isUnbounded())) {
      tempRange = paramDefs.getTemporalRange(paramDefs.getDefaultParameterValues());
    }
    return tempRange;
  }
}
