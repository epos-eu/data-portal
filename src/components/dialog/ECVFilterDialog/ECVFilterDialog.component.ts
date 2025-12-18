import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'components/dialog/baseDialogService.abstract';
import { Organization } from 'api/webApi/data/organization.interface';
import { Country } from 'assets/data/countries';
import { DataProvider } from 'components/dataProviderFilter/dataProviderFilter.component';
import { Tracker } from 'utility/tracker/tracker.service';
import { TrackerAction, TrackerCategory } from 'utility/tracker/tracker.enum';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ECV } from 'components/ecvFilter/ecvFilter.component';
import { ECVar } from 'api/webApi/data/ECVar.interface';
import { SimpleECV } from 'components/ecvFilter/ecvFilter.component';


/**
 * Input data structure passed to the dialog
 */
export interface DetailsDataIn {
  ECVsList: SimpleECV[];
  ECVsSelected: string[];
  title: string;
}

@Component({
  selector: 'app-ECV-filter-dialog',
  templateUrl: './ECVFilterDialog.component.html',
  styleUrls: ['./ECVFilterDialog.component.scss'],
})
export class ECVFilterDialogComponent implements OnInit {

  // Array containing all ECVs fetched from backend
  public ECVs: SimpleECV[] = [];
  
  // Array of URIs currently selected (from parent)
  public ECVsSelectedInput: string[] = [];
  
  // Grouped ECVs by first letter
  public ECVsList: Array<[string, SimpleECV[]]> = [];
  
  // Selected ECVs for the "selected only" view
  public ECVsListSelected: SimpleECV[] = [];
  
  // Counters
  public ECVCounter: number = 0;
  public ECVCounterTotal: number = 0;

  // Free text search form control
  public freeTextFormControl = new UntypedFormControl();
  
  // Output array for selected URIs
  public newECVsSelected: string[] = [];

  // Flags for filtering
  public showOnlySelected = false;
  public activeLetter = '';
  public filters = { letter: false, text: true };

  // Dialog title
  public title: string;
  
  // Alphabet lists for filtering
  public alphabetList: string[];
  public alphabetCheck: string[];

  private alphabet = 'abcdefghijklmnopqrstuvwxyz';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<DetailsDataIn>,
    private readonly tracker: Tracker,
  ) {
    // Map backend ECVs to SimpleECV and mark selected ones
    this.ECVs = this.data.dataIn.ECVsList.map(ecv => ({
      name: ecv.name,
      uri: ecv.uri,
      isSelected: this.data.dataIn.ECVsSelected.includes(ecv.uri)
    })).sort((a, b) => a.name.localeCompare(b.name));

    // Keep a reference of selected URIs from parent
    this.ECVsSelectedInput = this.data.dataIn.ECVsSelected;
    
    // Pre-selected ECVs for "Selected only" filter
    this.ECVsListSelected = this.ECVs.filter(ecv => ecv.isSelected);

    // Counters
    this.ECVCounter = this.ECVCounterTotal = this.ECVs.length;

    // Dialog title
    this.title = this.data.dataIn.title;

    // Alphabet for filtering
    this.alphabetList = this.alphabet.toUpperCase().split('');

    // Initialize output
    this.data.dataOut = [];
  }

  public ngOnInit(): void {
    // Group ECVs by first letter initially
    this.ECVsList = this.groupByFirstLetter(this.ECVs);
    this.refreshAlphabetCheckArray();

    // Subscribe to free text search changes
    this.freeTextFormControl.valueChanges.subscribe(() => {
      // Enable text filter if free text is entered
      this.filters.text = !!this.freeTextFormControl.value?.trim();
      this._filter();
      this.refreshAlphabetCheckArray();
    });
  }

  /**
   * Activate a letter filter
   * @param letter Letter to filter by, or 'selected' for selected only, or '' for no filter
   */
  public activateLetter(letter: string): void {
    this.activeLetter = letter;
    this.showOnlySelected = letter === 'selected';
    this.filters.letter = letter !== '' && letter !== 'selected';
    this._filter();
  }
  /**
   * Toggle selection status of all selected ECVs
   * @param status True to select all, false to deselect all
   */
  public toggleAllSelected(status: boolean): void {
    this.ECVsListSelected.forEach(ecv => ecv.isSelected = status);
  }

  /**
   * Toggle selection status of all ECVs currently displayed in filtered list
   * @param status True to select all, false to deselect all
   */
  public toggleAllFiltered(status: boolean): void {
    this.ECVsList.forEach(([_, group]) => group.forEach(ecv => ecv.isSelected = status));
  }

  /**
   * Update selected ECVs list when a checkbox is clicked
   * @param ecv SimpleECV object whose selection changed
   */
  public updateECVListSelected(ecv: SimpleECV): void {
    if (ecv.isSelected) {
      if (!this.ECVsListSelected.includes(ecv)) this.ECVsListSelected.push(ecv);
    } else {
      const index = this.ECVsListSelected.indexOf(ecv);
      if (index > -1) this.ECVsListSelected.splice(index, 1);
    }
  }

  /**
   * Submit selected ECVs and close the dialog
   */
  public submit(): void {
    // Get URIs of selected ECVs
    this.newECVsSelected = this.ECVsListSelected.map(ecv => ecv.uri);
    this.data.dataOut = this.newECVsSelected;

    if (this.newECVsSelected.length > 0) {
      const names = this.ECVsListSelected.map(ecv => ecv.name).join(', ');
      this.tracker.trackEvent(TrackerCategory.SEARCH, TrackerAction.DATA_PROVIDER, names);
    }

    this.data.close();
  }

  /**
   * Cancel dialog without saving
   */
  public cancel(): void { 
    this.data.dataOut = false;
    this.data.close();
  }

  /**
   * Apply all filters (letter, free text, selected only)
   */
  private _filter(): void {
    let filtered = this.ECVs;

    // Filter by first letter
    if (this.filters.letter) {
      const letter = this.activeLetter.toLowerCase();
      filtered = filtered.filter(ecv => ecv.name[0].toLowerCase() === letter);
    }

    // Filter by free text
    if (this.filters.text) {
      const text = this.freeTextFormControl.value?.toLowerCase() || '';
      filtered = filtered.filter(ecv => ecv.name.toLowerCase().includes(text));
    }

    // Filter by selected only
    if (this.showOnlySelected) {
      filtered = filtered.filter(ecv => ecv.isSelected);
    }

    this.ECVCounter = filtered.length;

    // Group filtered ECVs by first letter
    this.ECVsList = this.groupByFirstLetter(filtered);
  }

  /**
   * Refresh the alphabet check array to highlight letters that have ECVs
   */
  private refreshAlphabetCheckArray(): void {
    this.alphabetCheck = this.ECVsList.map(([letter, _group]) => letter.toUpperCase());
  }

  /**
   * Group an array of SimpleECVs by their first letter
   * @param arr Array of SimpleECV objects
   * @returns Array of tuples: [first letter, array of ECVs]
   */
  private groupByFirstLetter(arr: SimpleECV[]): Array<[string, SimpleECV[]]> {
    const group = arr.reduce((acc, cur) => {
      const first = cur.name[0].toLowerCase();
      acc[first] = [...(acc[first] || []), cur];
      return acc;
    }, {} as { [key: string]: SimpleECV[] });

    const groupedArray = Object.entries(group);
    const result: Array<[string, SimpleECV[]]> = [];

    // Add non-alphabet first
    groupedArray.forEach(([key, val]) => {
      if (!this.alphabetList.includes(key.toUpperCase())) result.push([key, val]);
    });

    // Add alphabetical letters
    groupedArray.forEach(([key, val]) => {
      if (this.alphabetList.includes(key.toUpperCase())) result.push([key, val]);
    });

    return result;
  }
}
