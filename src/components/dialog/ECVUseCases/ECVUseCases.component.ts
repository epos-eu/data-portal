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
import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { DialogData } from "../baseDialogService.abstract";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ConfirmationDataIn } from "../confirmationDialog/confirmationDialog.component";
import { ECVUseCasesService } from "services/ecvUseCases.service";
import { InformationsService } from "services/informationsService.service";
import { TourService } from "services/tour.service";

@Component({
  selector: "app-ECVUseCases-dialog",
  templateUrl: "./ECVUseCases.component.html",
  styleUrls: ["./ECVUseCases.component.scss"],
})
export class ECVUseCases implements OnInit {

  public ecvUseCases: ECVUseCase[];
  public selectedEcvUseCase: ECVUseCase;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: DialogData<ConfirmationDataIn, boolean>,
    private ecvUseCasesService: ECVUseCasesService,
  ) {
    this.selectedExample = this.examples[0];
  }

  ngOnInit(): void {
    this.ecvUseCasesService.examples$.subscribe({
      next: (examplesData: ECVUseCase[]) => {
        this.ecvUseCases = examplesData;
         // Set the first example as the default selected example if data exists
    if (this.ecvUseCases.length > 0) {
      this.selectedExample = this.ecvUseCases[0];
    }
      },
      error: (error) => {
        console.error('Error fetching scientific examples:', error);
      },
    });
  }


  // USED AS MOCK-UP DATA (REMEMBER TO SWITCH SOURCE FROM TEMPLATE!) !!!
  public examples: ECVUseCase[] = [
    {
      ECV: "ECV01",
      title: "SeaLevel",
      description:
        "SeaLevel -- Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum",
      listOfServices: ["Service1", "Service2", "Service3"],
      sharingLinkUrl: "https://....",
    },
    {
      ECV: "ECV02",
      title: "PermaFrost",
      description:
        "PermaFrost -- Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum",
      listOfServices: ["Service1", "Service2", "Service3"],
      sharingLinkUrl: "https://....",
    },
    {
      ECV: "ECV03",
      title: "Evaporation from Land",
      description:
        "Evaporation from Land -- Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum",
      listOfServices: ["Service1", "Service2", "Service3"],
      sharingLinkUrl: "https://....",
    },
    {
      ECV: "ECV04",
      title: "Groundwater",
      description:
        "Groundwater -- Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum",
      listOfServices: ["Service1", "Service2", "Service3"],
      sharingLinkUrl: "https://....",
    },
    {
      ECV: "ECV05",
      title: "Snow",
      description:
        "Snow -- Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum",
      listOfServices: ["Service1", "Service2", "Service3"],
      sharingLinkUrl: "https://....",
    },
    {
      ECV: "ECV06",
      title: "Aerosols",
      description:
        "Aerosols -- Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum",
      listOfServices: ["Service1", "Service2", "Service3"],
      sharingLinkUrl: "https://....",
    },
    {
      ECV: "ECV07",
      title: "Soil Carbon",
      description:
        "Soil Carbon -- Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum",
      listOfServices: ["Service1", "Service2", "Service3"],
      sharingLinkUrl: "https://....",
    },
  ];

  public selectedExample: ECVUseCase | null = null;
  public title = "ECV Use Cases";

  public selectUseCase(useCase: ECVUseCase): void {
    this.selectedExample = useCase;
  }
}

export interface ECVUseCase {
  ECV: string;
  title: string;
  description: string;
  listOfServices: string[];
  sharingLinkUrl: string;
}

export interface ECVUseCaseDataType {
  confirmButtonHtml: string;
  confirmButtonCssClass: string;
}
