import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private showLoadingSrc = new BehaviorSubject<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public showLoadingObs = this.showLoadingSrc.asObservable();

  constructor() { }

  public showLoading(showLoading: boolean): void {
    this.showLoadingSrc.next(showLoading);
  }
}
