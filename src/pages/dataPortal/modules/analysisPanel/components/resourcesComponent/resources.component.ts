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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { EnvironmentResource } from 'api/webApi/data/environments/environmentResource.interface';
import { EnvironmentStatus } from 'api/webApi/data/environments/environmentStatus.enum';
import { EnvironmentObject } from '../../analysisPanel.component';
import { EnvironmentResourceStatus } from 'api/webApi/data/environments/environmentResourceStatus.enum';

@Component({
  selector: 'app-analysis-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
})
export class ResourcesComponent implements OnInit {

  @Input() resources: Array<EnvironmentResource>;
  @Input() environment: EnvironmentObject;
  @Output() deleteResourceCall = new EventEmitter<EnvironmentResource>();
  @Output() openParametersDialogCall = new EventEmitter<EnvironmentResource>();
  @Output() cloneResourceCall = new EventEmitter<EnvironmentResource>();

  public displayedColumns: string[] = ['resource', 'format', 'status', 'actions'];
  public dataSource = new MatTableDataSource<EnvironmentResource>([]);

  /* The above code is declaring a public variable called "environmentStatus" and assigning it the
value of "EnvironmentStatus". */
  public environmentStatus = EnvironmentStatus;
  public environmentResourceStatus = EnvironmentResourceStatus;

  ngOnInit(): void {
    this.dataSource.data = this.resources;
  }

  public deleteResource(element: EnvironmentResource): void {
    this.deleteResourceCall.emit(element);
  }

  public openParametersDialog(element: EnvironmentResource): void {
    this.openParametersDialogCall.emit(element);
  }

  /**
   * The function "openInBrowser" opens a given URL in a new browser tab.
   * @param {string} url - The `url` parameter is a string that represents the URL of the webpage you
   * want to open in a new browser window.
   */
  public openInBrowser(url: string) {
    window.open(url, '_blank');
  }

  public cloneResource(element: EnvironmentResource): void {
    this.cloneResourceCall.emit(element);
  }
}
