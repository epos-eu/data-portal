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
import { ECVCategory } from 'components/ecvFilter/ecvFilter.component';

export interface DetailsDataIn {
  ECVsList: Array<ECV>;
  ECVsSelected: Array<string>;
  mockECVs: Array<ECVCategory>;
  title: string;
}

@Component({
  selector: 'app-ECV-filter-dialog',
  templateUrl: './ECVFilterDialog.component.html',
  styleUrls: ['./ECVFilterDialog.component.scss'],
})
export class ECVFilterDialogComponent implements OnInit {

  public alphabetList: Array<string>;
  public alphabetCheck: Array<string>;
  public activeLetter: string = 'selected';

  /* public dataProviders: Array<DataProvider>; */
  public ECVs: Array<ECV>;
  /* public dataProvidersSelectedInput: Array<string>; */
  public ECVsSelectedInput: Array<string>;
  /* public dataProviderList: Array<[string, Array<DataProvider>]>; */
  public ECVsList: Array<[string, Array<unknown>]>;
  /* public dataProviderListSelected: Array<DataProvider> = []; */
  public ECVsListSelected: Array<ECV> = [];
  /* public dataProviderCounter: number = 0; */
  public ECVCounter: number = 0;
  
  public ECVCounterTotal: number = 0;

  public freeTextFormControl = new UntypedFormControl();

  public newECVsSelected: Array<string> = [];

  public showOnlySelected = true;
  public filters = {
    letter: false,
    text: true,
    country: false,
  };

  public spinner = true;

  public title: string;

  private alphabet = 'abcdefghijklmnopqrstuvwxyz';

  private countrySelected: string = '';

  public objectKeys = Object.keys;

  public ecvsArray: Array<ECVCategory>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<DetailsDataIn>,
    private readonly tracker: Tracker,
  ) {
    this.ECVs = this.data.dataIn.ECVsList;
    this.ECVsSelectedInput = this.data.dataIn.ECVsSelected;
    this.ECVCounter = this.ECVCounterTotal = this.ECVs.length;
    // setting MOCK DATA
    this.ecvsArray = this.data.dataIn.mockECVs;
    this.title = this.data.dataIn.title;

    this.data.dataOut = [];

    this.alphabetList = this.alphabet.toUpperCase().split('');
  }

  public ngOnInit(): void {

    /* this.ECVs.map(_o => {
      // trim name
      _o.getName().trim();

      // set selected
      if (this.ECVsSelectedInput.includes(_o.getIdentifier())) {
        _o.isSelected = true;
        this.ECVsListSelected.push(_o);
      }
    });

    // sort dataProviders
    this.ECVs.sort((a, b) => {
      return this.sortData(a, b);
    });

    this.freeTextFormControl.valueChanges.subscribe((value: string) => {
      // If the text is empty, reset the filter
      if (value.trim() === '') {
        this.filters.text = false;
        this.alphabetCheck = this.alphabetList; // Reset the alphabet check array
        this._filter();
        return;
      }

      this.filters.text = true;

      this._filter();
      this.refreshAlphabetCheckArray();
    });

    // track text 2sec after typing
    this.freeTextFormControl.valueChanges.pipe(
      debounceTime(2000),
      distinctUntilChanged()
    ).subscribe((value: string) => {

      if (value.trim() !== '') {
        this.tracker.trackEvent(TrackerCategory.PROVIDERS, TrackerAction.FREE_TEXT_SEARCH, value);
      }
    });

    this.ECVsList = this.groupByFirstLetter(this.ECVs);
    this.refreshAlphabetCheckArray();

    setTimeout(() => {
      this.spinner = false;
    }, 300);

    if (this.ECVsListSelected.length === 0) {
      this.activeLetter = '';
      this.showOnlySelected = false;
    } */

  }

  /**
   * The activateLetter function sets the active letter, updates the showOnlySelected flag, and applies
   * filters based on the selected letter.
   * @param {string} letter - The "letter" parameter is a string that represents the letter to be
   * activated. It can be an empty string, the string "selected", or any other letter of the alphabet.
   */
  public activateLetter(letter: string): void {
    this.activeLetter = letter;
    this.showOnlySelected = false;

    if (letter === '') {
      this.filters.letter = false;
    } else if (letter === 'selected') {
      this.showOnlySelected = true;
    } else {
      this.filters.letter = true;
    }

    this._filter();

  }

  /**
   * The function "countrySelection" updates the filters and countrySelected variables based on the
   * selected country's isoCode, and then calls the _filter and refreshAlphabetCheckArray functions.
   * @param {Country} country - The parameter "country" is of type "Country".
   */
  public countrySelection(country: Country): void {

    if (country.isoCode !== undefined) {
      this.filters.country = true;
      this.countrySelected = country.isoCode;

      // track
      this.tracker.trackEvent(TrackerCategory.PROVIDERS, TrackerAction.SELECT_COUNTRY, country.name);

    } else {
      this.activeLetter = '';
      this.filters.country = false;
      this.filters.letter = false;
    }

    this._filter();

    this.refreshAlphabetCheckArray();

  }

  /**
   * The function toggles the "isSelected" property of all objects in the "dataProviderListSelected"
   * array to the given status.
   * @param {boolean} status - The "status" parameter is a boolean value that determines whether all
   * items in the "dataProviderListSelected" array should be selected or deselected. If "status" is
   * true, all items will be selected. If "status" is false, all items will be deselected.
   */
  public toggleAllSelected(status: boolean): void {
    this.ECVsListSelected.map(_obj => {
      _obj.isSelected = status;
    });
  }

  /**
   * The function toggles the "isSelected" property of all data providers in a list to a specified
   * status.
   * @param {boolean} status - The "status" parameter is a boolean value that determines whether the
   * "isSelected" property of each "DataProvider" object should be set to true or false.
   */
  public toggleAllFiltered(status: boolean): void {
    this.ECVsList.forEach(_g => {
      _g[1].forEach((_dp: Object) => {
        (_dp as ECV).isSelected = status;
      });
    });
  }

  /**
   * The submit function updates the dataOut property of the data object with the identifiers of the
   * selected data providers and then closes the data object.
   */
  public submit(): void {

    this.newECVsSelected = [];
    const newECVsSelectedName: Array<string> = [];

    this.ECVs.forEach((_dp: DataProvider) => {
      if (_dp.isSelected) {
        this.newECVsSelected.push(_dp.getIdentifier());
        newECVsSelectedName.push(_dp.getName());
      }
    });

    this.data.dataOut = this.newECVsSelected;

    if (this.newECVsSelected.length > 0) {
      // track search
      this.tracker.trackEvent(TrackerCategory.SEARCH, TrackerAction.DATA_PROVIDER, newECVsSelectedName.join(Tracker.TARCKER_DATA_SEPARATION));
    }

    this.data.close();
  }

  public cancel(): void {
    this.data.dataOut = false;
    this.data.close();
  }

  /**
   * Updates the list of selected data providers based on the checkbox status of a data provider.
   * @param {DataProvider} dataProvider - The data provider whose checkbox status has changed.
   */
  public updateDataProviderListSelected(dataProvider: DataProvider): void {
    if (dataProvider.isSelected) {
      // If the checkbox is checked, add the data provider to the list
      this.ECVsListSelected.push(dataProvider);
    } else {  // If the checkbox is unchecked, remove the data provider from the list
      // Find the index of the data provider in the list
      const index = this.ECVsListSelected.indexOf(dataProvider);
      // If the data provider is in the list
      if (index > -1) {
        // Remove it
        this.ECVsListSelected.splice(index, 1);
      }
    }
  }

  private _filter(): void {

    let ECVsFiltered: Array<ECV> = this.ECVs;

    // filter by first letter
    if (this.filters.letter) {
      const filterValue = this.activeLetter;

      ECVsFiltered = ECVsFiltered.filter(
        option => option.getName()[0].toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    // filter by free text
    if (this.filters.text) {

      const filterValue = this.freeTextFormControl.value as string;

      if (filterValue !== '') {
        ECVsFiltered = ECVsFiltered.filter(
          option => option.getName().toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    }

    // filter by country
    if (this.filters.country) {

      const filterValue = this.countrySelected;

      ECVsFiltered = ECVsFiltered.filter(
        option => option.getCountry().toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    this.ECVCounter = ECVsFiltered.length;

    // group by first letter
    this.ECVsList = this.groupByFirstLetter(ECVsFiltered);
  }

  private refreshAlphabetCheckArray() {
    this.alphabetCheck = [];
    this.ECVsList.forEach(_g => {
      this.alphabetCheck.push(_g[0].toUpperCase());
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private groupByFirstLetter(arr: Array<Object>): Array<[string, Array<Object>]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const group = arr.reduce((acc, cur: DataProvider) => {
      const firstLetter = cur.getName()[0].toLowerCase();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { ...acc, [firstLetter]: [...(acc[firstLetter] || []), cur] };
    }, {}) as Array<Array<Object>>;

    const groupedArray = Object.entries(group);
    const result: Array<[string, Array<Object>]> = [];

    // first element not in alphabet list
    groupedArray.forEach((_g, index) => {
      const key = _g[0];
      if (!this.alphabetList.includes(key.toUpperCase())) {
        result.push(_g);
      }
    });

    // other grouped list
    groupedArray.forEach((_g, index) => {
      const key = _g[0];
      if (this.alphabetList.includes(key.toUpperCase())) {
        result.push(_g);
      }
    });

    return result;
  }

  private sortData(a: ECV, b: ECV) {
    if (a.getName().toLowerCase() < b.getName().toLowerCase()) {
      return -1;
    }
    if (a.getName().toLowerCase() > b.getName().toLowerCase()) {
      return 1;
    }
    return 0;
  }
}
