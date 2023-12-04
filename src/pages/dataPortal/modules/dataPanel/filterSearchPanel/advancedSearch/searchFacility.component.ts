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
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OnAttachDetach } from 'decorators/onAttachDetach.decorator';
import { Subscription, BehaviorSubject } from 'rxjs';
import { Model } from 'services/model/model.service';
import { SimpleDiscoverRequest } from 'api/webApi/data/impl/simpleDiscoverRequest';
import { DiscoverRequest } from 'api/webApi/classes/discoverApi.interface';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { SimpleTemporalRange } from 'api/webApi/data/impl/simpleTemporalRange';
import { MapInteractionService } from 'utility/eposLeaflet/services/mapInteraction.service';
import { LoadingService } from 'services/loading.service';
import { UntypedFormControl } from '@angular/forms';
import { FacetDisplayItem } from '../data/impl/facetDisplayItem';
import { FacetLeafItem } from '../data/impl/facetLeafItem';
import { FacetParentItem } from '../data/impl/facetParentItem';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DisplayItemService } from '../services/displayItem.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { SearchFacetsComponent } from '../facets/searchFacets.component';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { SearchService } from '../services/search.service';
import { LandingService } from 'pages/dataPortal/services/landing.service';
// import { TourService } from 'services/tour.service';
import { MatExpansionPanel } from '@angular/material/expansion';
import { DataSearchConfigurablesService } from 'pages/dataPortal/services/dataSearchConfigurables.service';

/**
 * This component triggers the search (discover) call out to the webAPI when:
 * - the Search or Clear button is pressed
 * - the spatial bounds attribute of the Model changes
 * - the temporal range attribute of the Model changes
 * It contains the free text html input element and the {@link FacetsComponent},
 * which it monitors for changes in values.
 */
@OnAttachDetach('onAttachComponents')
@Unsubscriber('subscriptions')
@Component({
  selector: 'app-search-facility',
  templateUrl: './searchFacility.component.html',
  styleUrls: ['./searchFacility.component.scss'],
  providers: [DisplayItemService, SearchService],
})
export class SearchFacilityComponent implements OnInit {

  @ViewChild('matInput') matInput: ElementRef<HTMLInputElement>;
  @ViewChild(SearchFacetsComponent) searchFacets: SearchFacetsComponent;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public separatorKeysCodes: number[] = [ENTER, COMMA];

  public autoCompleteFormControl = new UntypedFormControl();
  public filteredKeys: Observable<Array<FacetDisplayItem> | null>;

  /** The display objects relating to all of the available facets. */
  public allDisplayItems: null | Array<FacetDisplayItem> = null;

  /** The keywords objects */
  public keywords: null | Array<FacetLeafItem> = null;

  /** Variable for holding the facets that are displayed. */
  public facetsSource = new BehaviorSubject<Map<string, Array<string>>>(new Map<string, Array<string>>());

  /** Current free-text value. */
  public newText = '';
  /**
   * Whether the advanced search panel has changed since the last search. Used for button disabling.
   */
  public advSearchChanged = false;
  /**
   * Whether the "Clear" button should be disabled.
   */
  public clearEnabled = false;

  public typeFilters: string[] = [];

  public listKeyString: string[] = [];

  /** Constant reference for the "keywords" element of the returned facets data. */
  private readonly FACET_KEYWORDS = 'keywords';
  /** Constant reference for the "organisations" element of the returned facets data. */
  private readonly FACET_ORGANISATIONS = 'organisations';
  /** Variable for keeping track of subscriptions, which are cleaned up by Unsubscriber */
  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  /** Text in free-text that was used for current search results. */
  private lastSearchText = '';
  /** Facet selections used for current search results. */
  private readonly lastSearchFacets = new Map<string, Array<string>>();

  /** Current facet selections. */
  private newFacets = new Map<string, Array<string>>();

  /** Timer used to ensure that the search isn't done too many times in quick succession. */
  private searchTimer: NodeJS.Timeout;

  /** Constructor. */
  public constructor(
    private readonly dataSearchService: SearchService,
    private landingService: LandingService,
    private readonly model: Model,
    private mapInteractionService: MapInteractionService,
    private loadingService: LoadingService,
    private readonly displayItemService: DisplayItemService,
    private readonly panelsEvent: PanelsEmitterService,
    private readonly configurables: DataSearchConfigurablesService,
  ) {
    this.filteredKeys = this.autoCompleteFormControl.valueChanges.pipe(
      startWith(''),
      map((value: string | null) => (value ? this._filter(value) : [])),
    );
  }

  /**
   * Initialises subscriptions and triggers the initial search for an un-filtered set of results.
   * Monitors page [temporal]{@link Model#DataSearchTemporalRange} and
   * [spatial]{@link Model#dataSearchBounds} parameters,
   * calling {@link #triggerSearchOnTemporalSpatialChange} if they change.
   */
  public ngOnInit(): void {
    this.subscriptions.push(
      this.facetsSource.subscribe((facets: Map<string, Array<string>>) => {
        this.facetsChanged(facets);
      }),

      this.model.dataSearchTemporalRange.valueObs.subscribe(() => {
        this.triggerAdvancedSearch();
      }),

      this.model.dataSearchBounds.valueObs.subscribe(() => {
        this.triggerAdvancedSearch();
      }),

      this.landingService.returnToLandingObs.subscribe(() => {
        this.clearClicked();
      }),

      this.displayItemService.allDisplayItemsObs.subscribe(allDisplayItems => {
        this.allDisplayItems = allDisplayItems;
        if (this.keywords === null) {
          this.filterHiddenItems();
        }
      }),
      this.dataSearchService.typeFiltersObs.subscribe(typeFilters => {
        this.typeFilters = typeFilters;
      }),
    );

    if (this.model.dataSearchKeywords.get() !== null) {
      this.listKeyString = this.model.dataSearchKeywords.get();
    }

    this.triggerAdvancedSearch();
  }

  /**
   * Called when the free-text field changes.
   * @param newText The new text value.
   */
  public textChanged(newText: string | FacetLeafItem): void {
    const filterValue = newText instanceof FacetLeafItem ? newText.label : newText;
    if (filterValue !== this.newText && filterValue.length > 3) {
      this.newText = filterValue;
      this.triggerAdvancedSearch();
      this.somethingChanged();
    }
  }

  /**
   * Called when the factes selection changes.
   * @param newFacets The new selected facets value.
   */
  public facetsChanged(newFacets: Map<string, Array<string>>): void {
    // ensure sorted for quick comparison
    this.newFacets = this.cloneFacetMap(newFacets, true);
    this.somethingChanged();
  }

  /**
   * Called when user performs an action that triggers the search. Updates display before
   * triggering search using {@link #doSearch} function.
   */
  public triggerAdvancedSearch(): void {
    this.loadingService.showLoading(true);

    // disable buttons
    this.advSearchChanged = false;
    this.clearEnabled = false;
    // reset text
    this.newText = this.listKeyString.toString();
    this.lastSearchText = this.newText;

    // reset facets
    this.lastSearchFacets.clear();

    this.doSearch(SimpleDiscoverRequest.makeFullQuery(
      this.newText,
      this.model.dataSearchTemporalRange.get(),
      this.model.dataSearchBounds.get(),
      this.newFacets.get(this.FACET_KEYWORDS),
      this.newFacets.get(this.FACET_ORGANISATIONS),
    ));

  }

  public clearTextClicked(): void {
    this.clearFreeText();
    this.triggerAdvancedSearch();
  }

  /**
   * Called to clear free-text and facet selections.
   */
  public clearClicked(): void {
    // clears the current search values and makes another search passing a null
    this.clearFreeText();
    this.facetsSource.next(new Map<string, Array<string>>());
    this.model.dataSearchTemporalRange.set(SimpleTemporalRange.makeUnbounded());
    this.mapInteractionService.resetAll();
    this.triggerAdvancedSearch();
    this.landingService.showLanding(true);
  }

  /**
   * Called by attribute directive displayWith (mat-autocomplete)
   */
  public displayLeafItem(item: FacetLeafItem): string {
    return item && item.label ? item.label : '';
  }

  public addKeyString(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.listKeyString.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.autoCompleteFormControl.setValue(null);

    this.model.dataSearchKeywords.set(this.listKeyString);

    this.triggerAdvancedSearch();
    this.somethingChanged();
  }

  public removeKeyString(key: string): void {
    const index = this.listKeyString.indexOf(key);

    if (index >= 0) {
      this.listKeyString.splice(index, 1);
    }

    this.model.dataSearchKeywords.set(this.listKeyString);

    this.triggerAdvancedSearch();
    this.somethingChanged();
  }

  public selectedKey(event: MatAutocompleteSelectedEvent): void {
    this.listKeyString.push(event.option.viewValue);
    this.matInput.nativeElement.value = '';
    this.autoCompleteFormControl.setValue(null);

    this.model.dataSearchKeywords.set(this.listKeyString);

    this.triggerAdvancedSearch();
    this.somethingChanged();
  }

  public removeFilter(filter: string): void {
    switch (filter) {
      case SearchService.FILTER_TEMPORAL:
        this.searchFacets.clearTemporal();
        break;
      case SearchService.FILTER_SPATIAL:
        this.searchFacets.resetGeolocation();
        break;
      case SearchService.FILTER_ORGANIZATION:
        this.searchFacets.organisationsClear(new Event(''));
        break;
      case SearchService.FILTER_TYPE:
        this.searchFacets.typesClear(new Event(''));
        break;
    }
  }

  public toggleFilterPanel(): void {
    this.panelsEvent.dataPanelToggle();
  }

  public handleFilterEnter(filterPanel: MatExpansionPanel): void {
    filterPanel.close();
  }

  public handleFreeTextEnter(filterPanel: MatExpansionPanel): void {
    this.configurables.clearPinned();
    filterPanel.open();
    this.panelsEvent.setTogglePanelRef(filterPanel); // eslint-disable-line
  }

  /**
   * Called to filter value on mat-autocomplete input
   */
  private _filter(value: FacetLeafItem | string): null | Array<FacetDisplayItem> {

    if (value === '') {
      return this.keywords;
    }

    const filterValue = value instanceof FacetLeafItem ? value.label : value;

    return this.keywords !== null ? this.keywords.filter(
      option => option.label.toLowerCase().includes(filterValue.toLowerCase())
    ) : [];
  }

  /**
   * Triggers a search.  Uses the {@link #searchTimer} to ensure not called too often.
   * @param request An object containing the search parameters.
   */
  private doSearch(request: DiscoverRequest): void {
    // Ensure not called too many times in succession on init
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      void this.dataSearchService.search(request).then(() => {
        this.somethingChanged();
      });
    }, 100);
  }

  private clearFreeText(): void {
    this.newText = '';
    this.listKeyString = [];
    this.autoCompleteFormControl.setValue(this.newText);
  }

  /**
   * Called to reevaluate the status of the variables that control the enabling/disabling of
   * search/clear/undo buttons.
   */
  private somethingChanged(): void {
    this.advSearchChanged = (0
      || this.hasSearchTextChanged()
      || this.hasFacetChanged(this.FACET_KEYWORDS)
      || this.hasFacetChanged(this.FACET_ORGANISATIONS)
    );
    this.clearEnabled = (0
      || (this.newText !== '')
      || (this.getFacetArray(this.FACET_KEYWORDS, true).length > 0)
      || (this.getFacetArray(this.FACET_ORGANISATIONS, true).length > 0)
      || this.mapInteractionService.mapBBox.get().isBounded()
      || !this.model.dataSearchTemporalRange.get().isUnbounded()
      || this.typeFilters.length > 0
    );
  }

  /**
   * Evaluates whether the free-text search input has changed from what was last searched for.
   */
  private hasSearchTextChanged(): boolean {
    const changed = (this.newText !== this.lastSearchText);
    return changed;
  }

  /**
   * Evaluates whether the facet selections have changed from what was last searched for.
   */
  private hasFacetChanged(key: string): boolean {
    const newVal = this.getFacetArray(key, true);
    const oldVal = this.getFacetArray(key, false);
    const changed = (JSON.stringify(newVal) !== JSON.stringify(oldVal));
    return changed;
  }

  /**
   * Retrieves an array of selected facets for a given grouping id (e.g. "keywords").
   * @param key Grouping id.
   * @param newValue True if the new values are required, False if the last searched for ones are.
   */
  private getFacetArray(key: string, newValue: boolean): Array<string> {
    const value = (newValue) ? this.newFacets.get(key) : this.lastSearchFacets.get(key);
    return (value != null) ? value : [];
  }

  /**
   * Clones a Map used internally to store facet selections.
   * @param mapIn The Map to clone.
   * @param sort Whether to sort the map value arrays by value.
   */
  private cloneFacetMap(mapIn: Map<string, Array<string>>, sort = false): Map<string, Array<string>> {
    const newMap = new Map<string, Array<string>>();
    Array.from(mapIn.keys()).forEach((key: string) => {
      newMap.set(
        key,
        (sort)
          ? mapIn.get(key)!.slice().sort((a: string, b: string) => (a < b) ? -1 : 1)
          : mapIn.get(key)!.slice(),
      );
    });
    return newMap;
  }

  /**
 * Filtering the {@link #keywords} variable based on its collapsed/hidden status.
 */
  private filterHiddenItems(): void {
    let shownDisplayItems: null | Array<FacetDisplayItem> = null;
    shownDisplayItems = (this.allDisplayItems == null)
      ? null
      : this.allDisplayItems.filter((item: FacetDisplayItem) => (!item.isHidden));

    if (shownDisplayItems != null) {
      shownDisplayItems.forEach((item: FacetDisplayItem) => {
        if (null != item && item.id === this.FACET_KEYWORDS) {
          const parentItem = item as FacetParentItem;
          this.keywords = parentItem.children as Array<FacetLeafItem>;
        }
      });
    }
  }


}
