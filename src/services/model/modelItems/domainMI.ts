import { Domain } from 'api/webApi/data/domain.interface';
import { ModelItem } from './modelItem';

export class DomainMI extends ModelItem<Domain> {
  constructor(
  ) {
    const defaultValue: Domain = { code: 'ALL', isSelected: true };
    super(defaultValue);
  }
}
