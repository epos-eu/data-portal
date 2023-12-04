/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, NgForm } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';


@Component({
  selector: 'app-select-check-all',
  templateUrl: './selectCheckAll.component.html',
  styleUrls: ['./selectCheckAll.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelectCheckAllComponent implements OnInit {
  @Input() values: Array<string> = [];
  @Input() text = 'Select All';
  @Input() name: string;
  @Input() form: NgForm;

  private model: UntypedFormControl;

  ngOnInit(): void {
    setTimeout(() => {
      this.model = this.form.form.controls[this.name] as UntypedFormControl;
    }, 100);

  }

  isChecked(): boolean {
    if (this.model !== undefined) {
      return this.model.value && this.values.length
        && this.model.value.length === this.values.length;
    }
    return false;
  }

  isIndeterminate(): boolean {
    if (this.model !== undefined) {
      return this.model.value && this.values.length && this.model.value.length
        && this.model.value.length < this.values.length;
    }
    return false;
  }

  toggleSelection(change: MatCheckboxChange): void {
    if (change.checked) {
      this.model.setValue(this.values);
    } else {
      this.model.setValue([]);
    }
  }
}
