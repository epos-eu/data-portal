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
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Subscription, BehaviorSubject, Subject, Observable } from 'rxjs';
import { Model } from 'services/model/model.service';
import { Facet } from 'api/webApi/data/facet.interface';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { UntypedFormControl } from '@angular/forms';
import { SimpleBoundingBox } from 'api/webApi/data/impl/simpleBoundingBox';
import { BoundingBox } from 'api/webApi/data/boundingBox.interface';
import { TemporalRange } from 'api/webApi/data/temporalRange.interface';
import { SimpleTemporalRange } from 'api/webApi/data/impl/simpleTemporalRange';
import { MapInteractionService } from 'utility/eposLeaflet/services/mapInteraction.service';
import { Countries, Country } from 'assets/data/countries';
import { FacetDisplayItem } from '../data/impl/facetDisplayItem';
import { FacetLeafItem } from '../data/impl/facetLeafItem';
import { FacetParentItem } from '../data/impl/facetParentItem';
import { DisplayItemService } from '../services/displayItem.service';
import { BoundingBox as BBEpos } from 'utility/eposLeaflet/eposLeaflet';
import { map, startWith } from 'rxjs/operators';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { TemporalControlsComponent } from 'pages/dataPortal/modules/temporalSpatialControls/temporalControls/temporalControls.component';
import { TourService } from 'services/tour.service';
import * as Driver from 'driver.js';
import { ViewType } from 'api/webApi/data/viewType.enum';
import { SearchService } from '../services/search.service';
import { MapService } from 'pages/dataPortal/modules/map/map.service';

/**
 * This component displays the facet panel and when a user changes their selection,
 * it notifies the parent component ({@link AdvancedSeachPanelComponent}).
 *
 * TODO: the {@link ItemsDisplayTableComponent} and the {@link FacetsComponent} have many
 * similarities. Maybe we can extract common functionality.
 */
@Component({
  selector: 'app-data-facets',
  templateUrl: './searchFacets.component.html',
  styleUrls: ['./searchFacets.component.scss']
})
@Unsubscriber('subscriptions')
export class SearchFacetsComponent implements OnInit {

  public static readonly SELECT_TYPE_GEOLOCATION = 'geolocation';
  public static readonly SELECT_TYPE_COORDINATES = 'coordinates';

  /** rxjs/BehaviorSubject for passing facet selections to the parent component. */
  @Input() facetsSource: BehaviorSubject<Map<string, Array<string>>>;
  /**
* Whether the advanced search panel has changed since the last search. Used for button disabling.
*/
  @Input() public advSearchChanged: boolean;
  /**
   * Whether the "Clear" button should be disabled.
   */
  @Input() public clearEnabled: boolean;

  @Output() public applyEmit = new EventEmitter<void>();
  @Output() public undoEmit = new EventEmitter<void>();
  @Output() public clearEmit = new EventEmitter<void>();

  @ViewChild('allOrganisationsSelected') private allOrganisationsSelected: MatOption;
  @ViewChild('organisationsSelect') private organisationsSelect: MatSelect;
  @ViewChild(TemporalControlsComponent) private temporalControls: TemporalControlsComponent;
  @ViewChild('allTypesSelected') private allTypesSelected: MatOption;
  @ViewChild('typesSelect') private typesSelect: MatSelect;

  public autoCompleteCountryFormControl = new UntypedFormControl();

  /** The display objects relating to all of the available facets. */
  public allDisplayItems: null | Array<FacetDisplayItem> = null;

  /** The filtered display objects only including ones that aren't hidden. */
  public shownDisplayItems: null | Array<FacetDisplayItem> = null;

  public spatialRangeSource = new BehaviorSubject<BoundingBox>(SimpleBoundingBox.makeUnbounded());
  public temporalRangeSource = new BehaviorSubject<TemporalRange>(SimpleTemporalRange.makeUnbounded());

  public countrySource = new BehaviorSubject<Country | null>(null);
  public countries = Countries;
  public demoCountry: Country = this.countries.find((country: Country) => country.name === 'Italy') as Country;
  public filteredCountries: Observable<Array<Country> | null>;


  /**
   * A variable for recording all of the parent facets that have been collapsed.
   * Used for re-collapsing the facets when the search results change.
   */
  public collapsedFacetIds = new Array<string>();

  // TODO: add comments for below variables.
  public locationRadio = new UntypedFormControl();
  public organisations: Array<FacetLeafItem>;
  public types: Array<string> = [ViewType.MAP, ViewType.TABLE, ViewType.GRAPH];
  public selectedOrganisations: Array<FacetLeafItem> = [];
  public selectedTypes: Array<string> = [];
  public locationRadioSelect = SearchFacetsComponent.SELECT_TYPE_COORDINATES;
  public countrySelected: Country | null;
  public bBoxFromModel: BoundingBox;
  public startBBoxSource = new Subject<void>();

  public numberOrganisationSelected = 0;
  public numberTypeSelected = 0;

  public locationRadioSelectTypeCoordinates = SearchFacetsComponent.SELECT_TYPE_COORDINATES;
  public locationRadioSelectTypeGeolocation = SearchFacetsComponent.SELECT_TYPE_GEOLOCATION;

  public searchFacetTypeLabel = SearchService.FILTER_TYPE;

  /** Constant reference for the "organisations" element of the returned facets data. */
  private readonly FACET_ORGANISATIONS = 'organisations';

  /** Variable for keeping track of subscriptions, which are cleaned up by Unsubscriber */
  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  /** Constructor. */
  constructor(
    public tourService: TourService,
    private readonly displayItemService: DisplayItemService,
    private readonly model: Model,
    private mapInteractionService: MapInteractionService,
    private mapService: MapService,
  ) {
    this.countrySelected = null;
  }

  /**
   * Initialises subscriptions to monitor changes on:
   * - the search results in the {@link Model#DataDiscoverResponse}
   * - the internal {@link #facetsSource}
   */
  public ngOnInit(): void {
    this.subscriptions.push(
      this.model.dataDiscoverResponse.valueObs.subscribe(() => {
        this.updateDisplay();
        this.displayItemService.updateDisplayItems(this.allDisplayItems);
      }),
      this.facetsSource.subscribe(() => {
        this.updateDisplay();
      }),
      this.model.dataSearchBounds.valueObs.subscribe((bbox: BoundingBox) => {
        this.spatialRangeSource.next(bbox);
        this.bBoxFromModel = bbox;
      }),
      this.spatialRangeSource.subscribe((bbox: BoundingBox) => {

        this.clearEnabled = bbox.isBounded();

        if (bbox !== this.model.dataSearchBounds.get()) {
          this.model.dataSearchBounds.set(bbox);
        }
      }),
      this.countrySource.subscribe((country: Country) => {

        if (country !== null && country !== this.model.dataSearchGeolocation.get()) {
          this.model.dataSearchGeolocation.set(country);
        }

      }),
      this.model.dataSearchTemporalRange.valueObs.subscribe((tempRange: TemporalRange) => {
        this.temporalRangeSource.next(tempRange);
      }),
      this.temporalRangeSource.subscribe((tempRange: TemporalRange) => {
        if (tempRange !== this.model.dataSearchTemporalRange.get()) {
          this.model.dataSearchTemporalRange.set(tempRange);
        }
      }),
      this.mapInteractionService.startBBox.observable.subscribe((val: boolean) => {
        if (val) {
          this.clearCountriesSelect();
        }
      }),
      this.mapInteractionService.mapBBox.observable.subscribe((bbox: BoundingBox) => {
        this.setBBoxFromControl(bbox);
      }),
      this.tourService.triggerClearFiltersObservable.subscribe(() => this.clearAll()),

    );

    this.filteredCountries = this.autoCompleteCountryFormControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value as string | Country)),
    );

    if (this.model.dataSearchGeolocation.get() !== null) {
      this.locationRadioSelect = SearchFacetsComponent.SELECT_TYPE_GEOLOCATION;
      this.countrySelected = this.model.dataSearchGeolocation.get();
    }

    setTimeout(() => {
      if (this.model.dataSearchFacetLeafItems.get() !== null) {
        this.restoreFacetItems();
      }
    }, 1500);

    this.subscriptions.push(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      this.model.dataSearchTypeData.valueObs.subscribe((arrayType: Array<string> | null) => {
        if (arrayType !== null) {
          this.selectedTypes = arrayType;
          this.numberTypeSelected = arrayType.length;
        }
      })
    );

  }

  /**
   * Changes the selection status of a {@link FacetLeafItem} and adds/removes the facet id
   * from the current selected list.
   * @param eventOpen {@link boolean}.
   */
  public organisationsToggleSelected(eventOpen: boolean, selectedOrganisations: Array<FacetLeafItem> = []): void {

    // only when close select options
    if (!eventOpen) {

      let items = selectedOrganisations.length === 0 ? this.selectedOrganisations : selectedOrganisations;
      items = items.filter(i => i !== null);

      this.numberOrganisationSelected = items.length;

      const thisParentsSelectedIds = this.getSelectedFacetsForParent(this.FACET_ORGANISATIONS);
      // remove all selected items
      thisParentsSelectedIds.length = 0;

      // add selected items to facetSource
      items.forEach(item => {
        if (!thisParentsSelectedIds.some(x => x === item.id)) {
          thisParentsSelectedIds.push(item.id);
        }
      });

      // trigger update
      this.facetsSource.next(this.facetsSource.getValue());

      this.model.dataSearchFacetLeafItems.set(thisParentsSelectedIds);

      this.applyEmit.next();

    }

  }


  /**
   * Toggle all the organisations selection.
   * @param [deselectAllOrganisations=false] - boolean - If true, all organisations option will be deselected.
   * @returns None
   */
  public organisationsToggleAllSelection(deselectAllOrganisations = false): void {

    if (deselectAllOrganisations) {
      this.allOrganisationsSelected.deselect();
    } else {
      if (this.allOrganisationsSelected.selected) {
        this.organisationsSelect.options.forEach((item: MatOption) => item.select());
      } else {
        this.organisationsSelect.options.forEach((item: MatOption) => item.deselect());
      }
    }
  }

  /**
   * When the user clicks the "Clear" button, the facet is cleared.
   * @param {Event} event - Event - The event that triggered the function.
   * @returns None
   */
  public organisationsClear(event: Event): void {
    this.organisationsSelect.options.forEach((item: MatOption) => item.deselect());
    this.facetsSource.next(new Map<string, Array<string>>());
    this.organisationsToggleSelected(false);
  }


  public typesToggleSelected(eventOpen: boolean, selectedTypes: Array<string> = []): void {

    // only when close select options
    if (!eventOpen) {

      const items = selectedTypes.length === 0 ? this.selectedTypes : selectedTypes;

      this.numberTypeSelected = items.length;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      this.model.dataSearchTypeData.set(items);

      this.applyEmit.next();

    }

  }

  /**
   * When the user clicks the "Clear" button, the facet is cleared.
   * @param {Event} event - Event - The event that triggered the function.
   * @returns None
   */
  public typesClear(event: Event): void {
    this.typesSelect.options.forEach((item: MatOption) => item.deselect());
    this.typesToggleSelected(false);
  }


  /**
   * Set the country bounding box and center on the map.
   * @param {Country} country - Country
   * @returns None
   */
  public geolocationSelection(country: Country): void {

    if (country.bboxCoordinates !== undefined) {
      // eslint-disable-next-line max-len
      const bbox = new BBEpos(country.bboxCoordinates[3], country.bboxCoordinates[2], country.bboxCoordinates[1], country.bboxCoordinates[0]);
      this.setBBoxFromControl(bbox);

      // center map on bounding box
      this.mapInteractionService.centerMapOnBoundingBox(bbox);

      this.countrySelected = country;

      this.countrySource.next(country);

    }

  }

  public setBBoxFromControl(bbox: BoundingBox, force = false): void {
    this.mapInteractionService.setBoundingBoxSpatialRangeFromControl(bbox, force);
  }
  public setEditableBBoxFromControl(bbox: BoundingBox): void {
    this.mapInteractionService.editableSpatialRange.set(bbox);
  }

  /**
   * It clears all the values in the form.
   * @returns None
   */
  public clearAll(): void {
    this.model.dataSearchKeywords.set([]);
    this.locationRadioSelect = SearchFacetsComponent.SELECT_TYPE_COORDINATES;
    this.countrySelected = null;
    this.autoCompleteCountryFormControl.setValue('');
    this.setBBoxFromControl(SimpleBoundingBox.makeUnbounded(), true);
    this.model.dataSearchGeolocation.set(null);
    this.model.dataSearchFacetLeafItems.set(null);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    this.model.dataSearchTypeData.set([]);
    this.selectedTypes = [];
    this.clearEmit.next();
  }

  public resetGeolocation(): void {
    this.clearCountriesSelect();
    this.setBBoxFromControl(SimpleBoundingBox.makeUnbounded(), true);
    this.model.dataSearchGeolocation.set(null);
    this.triggerAdvancedSearch();
  }

  public clearCountriesSelect(): void {
    this.countrySelected = null;
    this.autoCompleteCountryFormControl.setValue('');
  }

  public clearTemporal(): void {
    this.temporalControls.datePickerClearClick(new Event(''));
  }

  /**
   * Called by attribute directive displayWith (mat-autocomplete)
   */
  public displayCountry(item: Country): string {
    return item && item.name ? item.name : '';
  }

  public triggerAdvancedSearch(): void {
    this.applyEmit.next();
  }

  public geolocationHighlight(): void {
    const holdingdiv = document.createElement('div') as HTMLElement;
    const boundingBox = document.getElementsByClassName('leaflet-interactive').item(0) as HTMLElement;
    const tourName = 'EPOS Overview';


    // add overlay Pane
    this.mapInteractionService.setOverlayPane(true);

    const options: Driver.PopoverOptions = {
      title: `<span class="tour-title"><strong>Tour:</strong> ${tourName}</span>Bounding Box`,
      description: 'This is the bounding box.',
      position: 'right',
    };
    if (null != boundingBox) {
      this.tourService.addStep(tourName, boundingBox, options, 3, true);
    } else {
      // holding step - replaced by step over bounding box.
      this.tourService.addStep(tourName, holdingdiv, options, 3);
    }

    this.subscriptions.push(
      this.tourService.tourStepEnterObservable.subscribe((element: ElementRef<HTMLElement>) => {
        if (element.nativeElement.tagName === 'path') {
          if (null != this.mapService.getMapRef()) {
            this.mapService.getMapRef().classList.remove('driver-fix-stacking');
          }
        }
      })
    );
  }

  /**
   * Restores facet items after page load or tour exit/completion
   */
  private restoreFacetItems(): void {
    const tempOrganisation: Array<FacetLeafItem> = [];
    this.model.dataSearchFacetLeafItems.get()?.forEach((id: string) => {
      const option = this.organisationsSelect.options.find(item => (item.value as FacetLeafItem)?.id === id);
      if (option !== undefined) {
        tempOrganisation.push(option.value as FacetLeafItem);
      }
    });
    if (tempOrganisation.length > 0) {
      this.organisationsToggleSelected(false, tempOrganisation);
    }
  }

  /**
   * Called to filter value on mat-autocomplete input
   */
  private _filter(value: string | Country): null | Array<Country> {

    if (value === '') {
      return this.countries;
    }

    const filterValue: string = value instanceof Object ? value.name : value;

    return this.countries !== null ? this.countries.filter(
      option => option.name.toLowerCase().includes(filterValue.toLowerCase())
    ) : [];
  }

  /**
   * Called when the source facets or the selections are changed.  Creates the
   * {@link FacetDisplayItem}s taking into account selections, collapsing etc.
   */
  private updateDisplay() {
    const discoverResponse = this.model.dataDiscoverResponse.get();
    let currentProgressArray: null | Array<FacetDisplayItem> = null;

    if (discoverResponse != null) {
      const facets = discoverResponse.filters();

      // Moved outside of below if statement as otherwise might not have been initialised.
      // Seems to not have an adverse affect.
      currentProgressArray = new Array<FacetDisplayItem>();
      if (facets != null) {
        facets.roots().forEach((root: Facet<void>) => {
          this.recursiveDisplayItemCreator(root, currentProgressArray!);
        });
      }

      // restore collapsed status
      this.collapsedFacetIds.forEach((collapsedItemId: string) => {
        const item = currentProgressArray!.find((thisItem: FacetDisplayItem) => (thisItem.id === collapsedItemId));
        if ((item != null) && (item instanceof FacetParentItem)) {
          item.setCollapsed(true);
        }
      });
    }
    this.allDisplayItems = currentProgressArray;
    this.filterHiddenItems();

  }

  /**
   * Retrieves the selected values for a given facet grouping (e.g. "keywords").  If the group
   * isn't known of, it is registered with an empty array of selected values.
   * @param id Id of the facet grouping (e.g. "keywords").
   */
  private getSelectedFacetsForParent(id: string): Array<string> {
    const selectedFacetIds = this.facetsSource.getValue();
    if (!selectedFacetIds.has(id)) {
      selectedFacetIds.set(id, new Array<string>());
    }
    return selectedFacetIds.get(id)!;
  }

  /**
   * Recursively iterates over the facets and creates corresponding appropriate
   * {@link FacetDisplayItem}s.
   * @param facet Reference facet to iterate over.
   * @param currentProgressArray Current array of previously created FacetDisplayItems.
   * @param currentDepth Current depth of iteration.
   */
  private recursiveDisplayItemCreator(
    facet: Facet<void>,
    currentProgressArray: Array<FacetDisplayItem>,
    currentDepth = 0,
  ): FacetParentItem {
    const parentItem = new FacetParentItem(
      currentDepth,
      facet.getIdentifier(),
      facet.getName(),
    );
    currentProgressArray.push(parentItem);

    const thisParentsSelectedIds = this.getSelectedFacetsForParent(facet.getIdentifier());

    facet.getChildren().forEach((child: Facet<void>) => {
      let childItem: FacetDisplayItem;
      if (child.hasChildren()) {
        childItem = this.recursiveDisplayItemCreator(child, currentProgressArray, currentDepth + 1);
      } else {
        childItem = new FacetLeafItem(
          currentDepth + 1,
          child.getIdentifier(),
          child.getName(),
          (thisParentsSelectedIds.find((id: string) => (id === child.getIdentifier())) != null),
        );
        currentProgressArray.push(childItem);
      }
      parentItem.addChild(childItem);
    });
    return parentItem;
  }

  /**
   * Sets {@link #shownDisplayItems} by re-filtering the {@link #allDisplayItems} variable based
   * on its collapsed/hidden status.
   */
  private filterHiddenItems(): void {

    this.shownDisplayItems = (this.allDisplayItems == null)
      ? null
      : this.allDisplayItems.filter((item: FacetDisplayItem) => (!item.isHidden));

    if (this.shownDisplayItems != null) {
      this.shownDisplayItems.forEach((item: FacetDisplayItem) => {
        if (null != item && item.id === 'organisations') {
          const parentItem = item as FacetParentItem;

          // retrive all organisations
          if (parentItem.children.length > 0) {
            setTimeout(() => { // Timeout needed for animation to display on list;
              this.selectedOrganisations = (parentItem.children as Array<FacetLeafItem>).filter((org: FacetLeafItem) => org.isSelected);

              this.organisations = parentItem.children as Array<FacetLeafItem>;
            }, 0);
          }
        }
      });
    }
  }
}
