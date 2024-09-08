import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';
import { DistributionDetails } from '../api/webApi/data/distributionDetails.interface';
import { Tracker } from 'utility/tracker/tracker.service';
import { TrackerAction, TrackerCategory } from 'utility/tracker/tracker.enum';

export class Citation {
  constructor(
    public purpose: string,
    public citation: string,
  ) {
  }
}

@Injectable({
  providedIn: 'root',
})
export class CitationsService {
  private readonly URL = 'https://www.epos-eu.org/dataportal';

  constructor(
    private readonly notificationService: NotificationService,
    private tracker: Tracker,
  ) {
  }

  public getDatasetCitation(distributionDetails: DistributionDetails): Citation {
    const { providersString, doisString, license, name } = this.getCitationComponents(distributionDetails);

    return new Citation(
      'For citing the dataset as a reference in any publication',
      `${name}, provided by ${providersString}${license ? `, ${license}` : ''}${doisString ? `, ${doisString}` : ''}. Accessed on ${this.getTodayString()} through the EPOS Data Portal (${this.URL})`,
    );
  }

  public getDataPortalCitation(): Citation {
    return new Citation(
      'For citing the EPOS Data Portal as a reference in any publication',
      'Bailo, D., Paciello, R., Michalek, J. et al. The EPOS multi-disciplinary Data Portal for integrated access to solid Earth science datasets. Sci Data 10, 784 (2023). https://doi.org/10.1038/s41597-023-02697-9',
    );
  }

  public getDataPortalContentsCitation(distributionDetails: DistributionDetails): Citation {
    const { providersString, doisString, license } = this.getCitationComponents(distributionDetails);
    return new Citation(
      'For citing the EPOS Data Portal contents different from DDSS (e.g. images, pictures)',
      `Credits: EPOS Data Portal (${this.URL}), ${providersString}${license ? `, ${license}` : ''}${doisString ? `, ${(doisString)}` : ''}. Accessed on ${this.getTodayString()}`,
    );
  }

  public getAllCitations(distributionDetails: DistributionDetails): Citation[] {
    // The order here is the same used for the display in the table and for the filtering of the citations to show in the citation component
    return [
      this.getDatasetCitation(distributionDetails),
      this.getDataPortalCitation(),
      this.getDataPortalContentsCitation(distributionDetails),
    ];
  }

  public copyCitationToClipboard(citation: string, distributionDetails: DistributionDetails): void {

    const name = distributionDetails.getDomainCode() + Tracker.TARCKER_DATA_SEPARATION + distributionDetails.getName();

    // track event
    this.tracker.trackEvent(TrackerCategory.DISTRIBUTION, TrackerAction.CITATIONS, name);

    navigator.clipboard.writeText(citation).then(() => {
      // Show a success notification
      this.notificationService.sendNotification('Citation copied to clipboard', 'x', NotificationService.TYPE_SUCCESS, 5000);
    }).catch((_) => {
      // Show an error notification
      this.notificationService.sendNotification('Failed to copy citation to clipboard', 'x', NotificationService.TYPE_ERROR, 5000);
    });
  }

  private getCitationComponents(distributionDetails: DistributionDetails): {
    providersString: string; doisString: string; license: string; name: string;
  } {
    return {
      providersString: distributionDetails.getDataProvider().map(provider => provider.dataProviderLegalName).join(', '),
      doisString: distributionDetails.getDOI().join(', '),
      license: distributionDetails.getLicense(),
      name: distributionDetails.getName(),
    };
  }

  private getTodayString(): string {
    const dateObj = new Date();
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${day}-${month}-${year}`;
  }
}
