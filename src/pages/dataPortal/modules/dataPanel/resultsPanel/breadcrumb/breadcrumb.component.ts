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
import { Component, Input } from '@angular/core';
import { DistributionLevel } from 'api/webApi/data/distributionLevel.interface';
import { ResultsPanelService } from 'pages/dataPortal/services/resultsPanel.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  animations: [
  ],
})
export class BreadcrumbComponent {

  @Input() levels: Array<Array<DistributionLevel>>;
  @Input() showFirst: boolean;

  public textSliceLimit = 30;

  constructor(
    private readonly resultPanelService: ResultsPanelService,
  ) {
  }

  public filterBy(facet: string): void {
    this.resultPanelService.setFacetSelection(facet);
  }
}

