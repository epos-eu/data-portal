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

import { BehaviorSubject, Subject } from 'rxjs';

/**
 * A service that exposes methods for ResultPanelComponent
 */

export class ResultsPanelService {

  private counterData = new BehaviorSubject<number>(0);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public counterDataObs = this.counterData.asObservable();

  private counterTable = new BehaviorSubject<number>(0);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public counterTableObs = this.counterTable.asObservable();

  private counterGraph = new BehaviorSubject<number>(0);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public counterGraphObs = this.counterGraph.asObservable();

  private clearFacetSelectionSrc = new Subject<void>();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public clearFacetSelectionObs = this.clearFacetSelectionSrc.asObservable();

  private openFacetSelectionSrc = new Subject<boolean>();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public openFacetSelectionObs = this.openFacetSelectionSrc.asObservable();

  private triggerFacetSelectionSrc = new Subject<string>();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public triggerFacetSelectionObs = this.triggerFacetSelectionSrc.asObservable();

  private landingPanelTopSrc = new Subject<string>();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public landingPanelTopSrcObs = this.landingPanelTopSrc.asObservable();

  public setCounterData(value: number): void {
    this.counterData.next(value);
  }

  public setCounterTable(value: number): void {
    this.counterTable.next(value);
  }

  public setCounterGraph(value: number): void {
    this.counterGraph.next(value);
  }

  public clearFacetSelection(): void {
    this.clearFacetSelectionSrc.next();
  }

  public setFacetSelection(facet: string): void {
    this.triggerFacetSelectionSrc.next(facet);
  }

  public setLandingPanelTopSrc(position: string): void {
    this.landingPanelTopSrc.next(position);
  }

  public openFacetSelection(facet: boolean): void {
    this.openFacetSelectionSrc.next(facet);
  }

}
