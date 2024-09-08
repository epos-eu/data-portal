import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Countries, Country } from 'assets/data/countries';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-country-select',
  templateUrl: 'countrySelect.component.html',
  styleUrls: ['countrySelect.component.scss']
})
export class CountrySelectComponent implements OnInit {

  @Output() countrySelected: EventEmitter<Country> = new EventEmitter<Country>();

  public autoCompleteCountryFormControl = new UntypedFormControl();
  public filteredCountries: Observable<Array<Country> | null>;

  public countries = Countries;
  public countryLabel: Country | null;

  private lastValue: Country | null;

  @Input() set countryDefault(value: Country | null) {
    this.countryLabel = value;
    this.autoCompleteCountryFormControl.setValue(value);
  }

  ngOnInit(): void {

    // sort data results
    this.countries.sort((a, b) => {
      return this.sortData(a, b);
    });

    this.filteredCountries = this.autoCompleteCountryFormControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value as string | Country)),
    );
  }

  /**
   * The function "countrySelection" updates the countryLabel property and emits the countrySelected
   * event with the selected country as the value.
   * @param {Country} country - The parameter "country" is of type "Country".
   */
  public countrySelection(country: Country | null): void {
    this.countryLabel = country;
    if (country !== null && country !== this.lastValue) {
      this.lastValue = country;
      this.countrySelected.next(country);
    }
  }


  /**
   * The function "displayCountry" takes a Country object as input and returns its name if it exists,
   * otherwise it returns an empty string.
   * @param {Country} item - The parameter "item" is of type "Country".
   * @returns the name of the country if the item is defined and has a name property. Otherwise, it
   * returns an empty string.
   */
  public displayCountry(item: Country): string {
    return item && item.name ? item.name : '';
  }

  /**
   * The function filters an array of countries based on a given value.
   * @param {string | Country} value - The `value` parameter can be either a string or an object of
   * type `Country`.
   * @returns either `null` or an array of `Country` objects.
   */
  private _filter(value: string | Country | null): null | Array<Country> {

    if (value === '' || value === null) {
      return this.countries;
    }

    const filterValue: string = value instanceof Object ? value.name : value;

    return this.countries !== null ? this.countries.filter(
      option => option.name.toLowerCase().includes(filterValue.toLowerCase())
    ) : [];
  }

  /**
   * The function sorts an array of Country objects based on their name property.
   * @param {Country} a - The parameter "a" is of type "Country".
   * @param {Country} b - The parameter "b" in the above code is a variable of type "Country". It is
   * used to represent the second country object that is being compared in the sorting function.
   * @returns The sortData function returns -1 if the name of country a is less than the name of
   * country b, 1 if the name of country a is greater than the name of country b, and 0 if the names
   * are equal.
   */
  private sortData(a: Country, b: Country) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }


}
