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
import { Component } from '@angular/core';
import { LandingService } from '../../services/landing.service';

@Component({
  selector: 'app-data-panel',
  templateUrl: './dataPanel.component.html',
  styleUrls: ['./dataPanel.component.scss'],
})
export class DataPanelComponent {

  public showLanding = true;

  constructor(
    private readonly landingService: LandingService,
  ) {
    this.landingService.showLandingObs.subscribe((showLanding: boolean) => {
      this.showLanding = showLanding;
    });
  }

}
