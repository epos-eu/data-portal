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
 import { Component, OnInit ,Inject } from '@angular/core';
 import { ScientificExamplesService } from 'services/scientificExamples.service';
 import { DialogData } from '../baseDialogService.abstract';
 import { MAT_DIALOG_DATA } from '@angular/material/dialog';


 @Component({
   selector: 'app-scientific-examples-dialog',
   templateUrl: './scientificExamplesDialog.component.html',
   styleUrls: ['./scientificExamplesDialog.component.scss'],
 })
 export class ScientificExamplesDialogComponent implements OnInit {
   examples: Examples[];
   selectedExample: Examples;
   title = 'Scientific Examples';
   constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<scientificExamplesDataType, boolean>,
     private scientificExamplesService: ScientificExamplesService,
   ) {
   }

   ngOnInit(): void {
      this.scientificExamplesService.examples$.subscribe({
        next: (examplesData: Examples[]) => {
          this.examples= examplesData;
           // Set the first example as the default selected example if data exists
      if (this.examples.length > 0) {
        this.selectedExample = this.examples[0];
      }
        },
        error: (error) => {
          console.error('Error fetching scientific examples:', error);
        },
      });
    }
   selectExample(example: Examples): void {
    this.selectedExample = example;
  }
 }

 export interface Examples {
  example: string;
  title: string;
  description: string;
  listOfServices: string[];
  sharingLinkUrl: string;
}

export interface scientificExamplesDataType {
  confirmButtonHtml: string;
  confirmButtonCssClass: string;
}
