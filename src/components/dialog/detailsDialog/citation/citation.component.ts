import { Component, Input, OnInit } from '@angular/core';
import { DistributionDetails } from '../../../../api/webApi/data/distributionDetails.interface';
import { MatTableDataSource } from '@angular/material/table';
import { Citation, CitationsService } from '../../../../services/citations.service';

@Component({
  selector: 'app-citation-component',
  templateUrl: './citation.component.html',
  styleUrls: ['./citation.component.scss'],
})
export class CitationComponent implements OnInit {
  // Input data for the component
  @Input() detailsData: DistributionDetails;

  // Get which citation to show
  @Input() citationsToShow: number[];

  // Table data source for the citations
  public citations: MatTableDataSource<Citation>;

  // Columns to display in the table
  public displayColumns = ['title', 'citation', 'copyButton'];

  constructor(
    private citationService: CitationsService,
  ) {
  }

  ngOnInit(): void {
    const citations = this.citationService.getAllCitations(this.detailsData);

    // If the citations to show are not set, show all
    if (!this.citationsToShow) {
      // Set the citations to the table
      this.citations = new MatTableDataSource(citations);
    } else {
      // Else filter the citations to show
      this.citations = new MatTableDataSource(citations.filter((_, index) => this.citationsToShow.includes(index)));
    }
  }

  /**
   * This function copies a citation to the clipboard using a citation service and details data.
   * @param {string} citation - The `citation` parameter in the `copyCitationToClipboard` function is a
   * string that represents the citation text that you want to copy to the clipboard. It is the actual
   * content of the citation that you want to be copied.
   */
  public copyCitationToClipboard(citation: string): void {
    this.citationService.copyCitationToClipboard(citation, this.detailsData);
  }
}
