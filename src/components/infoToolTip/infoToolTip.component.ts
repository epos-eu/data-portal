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

/**
 * A wrapper for
 * [Angular Material Tooltips]{@link https://material.angular.io/components/tooltip/overview}
 * that allows us standardize it for info icons.
 */
@Component({
  selector: 'app-info-tool-tip',
  templateUrl: './infoToolTip.component.html',
  styleUrls: ['./infoToolTip.component.scss']
})
export class InfoToolTipComponent {
  @Input() toolTipString: string;
  constructor() { }

  public setToolTipString(toolTipComment: string): void {
    this.toolTipString = toolTipComment;
  }

}
