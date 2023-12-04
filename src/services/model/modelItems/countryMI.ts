import { Country } from 'assets/data/countries';
import { ModelItem } from './modelItem';

export class CountryMI extends ModelItem<null | Country> {

  constructor(
  ) {

    super(null);
    this.persistable = true;
    this.persistableOnConfigurables = true;
  }
}
