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
import { Component, OnInit } from '@angular/core';
import { LandingService } from './services/landing.service';
import { DataSearchConfigurablesServiceRegistry } from './services/dataSearchConfigurables.service';

@Component({
  selector: 'app-registry-panel',
  templateUrl: './registryPanel.component.html',
  styleUrls: ['./registryPanel.component.scss'],
})
export class RegistryPanelComponent implements OnInit {

  public showLanding = true;

  constructor(
    private readonly landingService: LandingService,
    private readonly dataSearchConfigurables: DataSearchConfigurablesServiceRegistry,
  ) {
  }

  ngOnInit(): void {

    // get domains from API service
    this.landingService.getDomains();

    setTimeout(() => {
      this.dataSearchConfigurables.setModelVariablesFromConfigurables();
    }, 500);
  }

}
