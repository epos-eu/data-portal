import { Component, Inject } from '@angular/core';
import { DistributionDetails } from '../../../api/webApi/data/distributionDetails.interface';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../baseDialogService.abstract';
import { CitationsService } from '../../../services/citations.service';

export interface CitationsDataIn {
  distributionDetails: DistributionDetails;
  citationsToShow: number[];
}

@Component({
  selector: 'app-citation-dialog',
  templateUrl: './citationDialog.component.html',
  styleUrls: ['./citationDialog.component.scss'],
})
export class CitationDialogComponent {

  public citation: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<CitationsDataIn>,
    private citationService: CitationsService,
  ) {
    this.citation = this.citationService.getDatasetCitation(data.dataIn.distributionDetails).citation;
  }

  public closeDialog(): void {
    this.data.close();
  }

  /**
   * This function copies a citation to the clipboard using a citation service and distribution
   * details.
   * @param {string} citation - The `citation` parameter in the `copyCitationToClipboard` function is a
   * string that represents the citation text that you want to copy to the clipboard.
   */
  public copyCitationToClipboard(citation: string): void {
    this.citationService.copyCitationToClipboard(citation, this.data.dataIn.distributionDetails);
  }
}
