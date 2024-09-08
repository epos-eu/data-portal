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
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginMessageObject, PleaseLoginContentComponent } from './pleaseLoginDialog/pleaseLoginContent.component';
import { FeedbackDialogComponent } from './feedbackDialog/feedbackDialog.component';
import { BaseDialogService, DialogData } from './baseDialogService.abstract';
import { ConfirmationDataIn, ConfirmationDialogComponent } from './confirmationDialog/confirmationDialog.component';
import { DisclaimerDialogComponent } from './disclaimerDialog/disclaimerDialog.component';
import { DetailsDataIn, DetailsDialogComponent } from './detailsDialog/detailsDialog.component';
import { ParametersDialogComponent } from './parametersDialog/parametersDialog.component';
import { InformationsDialogComponent } from './informationsDialog/informationsDialog.component';
import { DownloadsDialogComponent } from './downloadsDialog/downloadsDialog.component';
import { DataConfigurableI } from 'utility/configurables/dataConfigurableI.interface';
import { VideoGuidesDialogComponent } from './videoGuidesDialog/videoGuidesDialog.component';
import { MobileDisclaimerDialogComponent } from './mobileDisclaimerDialog/mobileDisclaimerDialog.component';
import { ContactFormDialogComponent } from './contactFormDialog/contactFormDialog.component';
import { PoliciesComponent } from './policiesDialog/policies.component';
import { DataConfigurationType } from 'utility/configurables/dataConfigurationType.enum';
import { DataProviderFilterDialogComponent } from './dataProviderFilterDialog/dataProviderFilterDialog.component';
import { Organization } from 'api/webApi/data/organization.interface';
import { Domain } from 'api/webApi/data/domain.interface';
import { GraphPanelDialogComponent } from './graphPanelDialog/graphPanelDialog.component';
import { TablePanelDialogComponent } from './tablePanelDialog/tablePanelDialog.component';
import { CitationDialogComponent, CitationsDataIn } from './citationDialog/citationDialog.component';
import { DistributionDetails } from '../../api/webApi/data/distributionDetails.interface';
import { ShareInformationsDialogComponent } from './shareInformationsDialog/shareInformationsDialog.component';


/**
 * A service used for showing dialogs.
 *
 * This should be developed to be the single method by which we display dialogs.
 * [issue]{@link https://epos-ci.brgm.fr/epos/epos-gui/issues/248}
 *
 * TODO:
 * - try to make it so that we don't need to create a new function in here for every new component.
 * - Have a standard confirmation component (takes message string, onConfirm function, onCancel function ?).
 */
@Injectable()
export class DialogService extends BaseDialogService {
  constructor(public dialog: MatDialog) {
    super(dialog);
  }

  public openPleaseLoginDialog(parentElement?: HTMLElement, message?: LoginMessageObject): Promise<null | DialogData> {
    return this.openDialog(
      'pleaseLogin',
      PleaseLoginContentComponent,
      'epos-dialog',
      true,
      {
        title: message?.title ?? '',
        message: message?.message ?? ''
      },
      null,
      parentElement,
    );
  }

  public closePleaseLoginDialog(): void {
    const loginDialog = this.dialog.getDialogById('pleaseLogin');
    if (null != loginDialog) {
      loginDialog.close();
    }
  }

  public openFeedbackDialog(): Promise<null | DialogData> {
    return this.openDialog(
      'feedback',
      FeedbackDialogComponent,
      'epos-dialog',
    );
  }

  public openContactFormDialog(distId: string): Promise<null | DialogData> {

    return this.openDialog(
      'contactForm',
      ContactFormDialogComponent,
      'epos-dialog',
      false,
      {
        distId: distId
      },
      {
        width: '30vw',
      }
    );
  }

  public openConfirmationDialog(
    messageHtml = 'Confirm action',
    closable = false,
    confirmButtonHtml = 'OK',
    confirmButtonCssClass = 'confirm',
    cancelButtonHtml = 'Cancel',
  ): Promise<boolean> {
    return this.openDialog<ConfirmationDataIn>(
      'confirm',
      ConfirmationDialogComponent,
      'epos-dialog',
      closable,
      {
        messageHtml: messageHtml,
        confirmButtonHtml: confirmButtonHtml,
        cancelButtonHtml: cancelButtonHtml,
        confirmButtonCssClass: confirmButtonCssClass,
      },
    ).then((data: DialogData<ConfirmationDataIn, boolean>) => (null != data) && (data.dataOut));
  }

  /**
   * The function `openDetailsDialog` opens a dialog box with details data, positioned relative to a
   * specific element on the page.
   * @param {string} distId - The `distId` parameter is a string that represents the ID of a
   * distribution.
   * @param [width=50vw] - The `width` parameter is used to specify the width of the dialog. It is
   * optional and has a default value of `'50vw'`, which means the width of the dialog will be 50% of the
   * viewport width.
   * @returns a Promise that resolves to either null or an object of type DialogData.
   */
  public openDetailsDialog(
    distId: string,
    context: string,
    domains: Array<Domain>,
    width = '50vw',
  ): Promise<null | DialogData> {

    const elemPosition = document.getElementById('sidenavleft')!.getBoundingClientRect();

    return this.openDialog<DetailsDataIn>(
      'detailsDialog',
      DetailsDialogComponent,
      'epos-dialog',
      true,
      {
        distId: distId,
        context: context,
        domains: domains,
      },
      {
        width: width,
        position: {
          top: String(elemPosition.top) + 'px',
          left: String(elemPosition.right + 45) + 'px',
        }
      }
    );
  }

  public openDownloadsDialog(
    dataConfigurable: DataConfigurableI | null,
    width: string,
    top: string,
    left: string
  ): Promise<null | DialogData> {
    return this.openDialog<DetailsDataIn>(
      'downloadsDialog',
      DownloadsDialogComponent,
      'epos-dialog',
      true,
      {
        dataConfigurable,
      },
      {
        width: width,
        position: {
          top: top,
          left: left
        }
      }
    );
  }

  public openDownloadCitationDialog(
    distributionDetails: DistributionDetails | null,
    citationsToShow: number[],
    width: string,
  ): Promise<null | DialogData> {
    return this.openDialog<CitationsDataIn>(
      'citationsDialog',
      CitationDialogComponent,
      'epos-dialog',
      true,
      {
        distributionDetails,
        citationsToShow,
      },
      {
        width: width,
      }
    );
  }

  public openAddToEnvDialog(
    dataConfigurable: DataConfigurableI | null,
    width: string,
    top: string,
    left: string
  ): Promise<null | DialogData> {
    return this.openDialog<DetailsDataIn>(
      'downloadsDialog',
      DownloadsDialogComponent,
      'epos-dialog',
      true,
      {
        dataConfigurable,
      },
      {
        width: width,
        position: {
          top: top,
          left: left
        }
      }
    );
  }

  public closeDetailsDialog(): void {
    const detailsDialog = this.dialog.getDialogById('detailsDialog');
    if (null != detailsDialog) {
      detailsDialog.close();
    }
  }

  public openParametersDialog(
    distId: string | undefined,
    width: string,
    top: string,
    left: string,
    component: DataConfigurationType = DataConfigurationType.DATA,
    title = 'Title',
  ): Promise<null | DialogData> {

    return this.openDialog<DetailsDataIn>(
      title,
      ParametersDialogComponent,
      'epos-dialog',
      true,
      {
        title: title,
        distId: distId,
        component: component,
      },
      {
        width: width,
        position: {
          top: top,
          left: left
        }
      }
    );
  }

  public openDisclaimerDialog(): Promise<null | DialogData> {
    return this.openDialog(
      'Disclaimer',
      DisclaimerDialogComponent,
      'epos-dialog',
    );
  }

  public openCookiesBanner(): Promise<null | DialogData> {
    return this.openDialog(
      'Cookie Policies',
      PoliciesComponent,
      'epos-dialog',
      false
    );
  }

  public openNoMobileDisclaimer(): Promise<null | DialogData> {
    return this.openDialog(
      'noMobileDisclaimer',
      MobileDisclaimerDialogComponent,
      'no-resize',
      false
    );
  }

  public closeNoMobileDisclaimer(): void {
    this.closeDialogById('noMobileDisclaimer');
  }

  public openInformationBanner(
    messageHtml = 'Confirm action',
    closable = true,
    confirmButtonHtml = 'CONTINUE TO PORTAL',
    confirmButtonCssClass = 'confirm',
    cancelButtonHtml = 'Cancel',
  ): Promise<boolean> {
    return this.openDialog<ConfirmationDataIn>(
      'informations',
      InformationsDialogComponent,
      'no-resize',
      closable,
      {
        messageHtml: messageHtml,
        confirmButtonHtml: confirmButtonHtml,
        cancelButtonHtml: cancelButtonHtml,
        confirmButtonCssClass: confirmButtonCssClass,
      },
      {
        width: '600px',
        position: {
          top: '200px'
        }
      }
    ).then((data: DialogData<ConfirmationDataIn, boolean>) => (null != data) && (data.dataOut));
  }

  public closeInformationBanner(): void {
    this.closeDialogById('informations');
  }

  public openVideoGuideDialog(): Promise<null | DialogData> {
    return this.openDialog(
      'videoGuide',
      VideoGuidesDialogComponent,
      'no-resize',
    );
  }

  public openDataProvidersFilter(dataProviders: Array<Organization>,
    dataProvidersSelected: Array<string>,
    title = 'Filter by Data and Service Providers'): Promise<null | DialogData> {

    const widthWindows = window.innerWidth;
    let percWidth = 50;
    if (widthWindows < 2000) {
      percWidth = 80;
    }

    return this.openDialog(
      'dataProviderFilter',
      DataProviderFilterDialogComponent,
      'epos-dialog',
      false,
      {
        dataProviders: dataProviders,
        dataProvidersSelected: dataProvidersSelected,
        title: title,
      },
      {
        width: String(percWidth) + '%',
        height: '650px',
      }
    );
  }

  public openGraphPanel(): void {

    const widthWindows = window.innerWidth;
    let percWidth = 50;
    if (widthWindows < 2000) {
      percWidth = 80;
    }

    void this.openDialog(
      'graphPanel',
      GraphPanelDialogComponent,
      'epos-dialog',
      true,
      {
        title: 'Graph panel'
      },
      {
        width: String(percWidth) + '%',
        hasBackdrop: false,
      }
    );
  }

  public openTablePanel(): void {

    const elemPosition = document.getElementById('table-vis-toggle')!.getBoundingClientRect();

    const widthWindows = window.innerWidth;
    let percWidth = 50;
    if (widthWindows < 2000) {
      percWidth = 80;
    }

    void this.openDialog(
      'tablePanel',
      TablePanelDialogComponent,
      'epos-dialog',
      true,
      {
        title: 'Table panel'
      },
      {
        width: String(percWidth) + '%',
        hasBackdrop: false,
        position: {
          top: String(elemPosition.top) + 'px',
        }
      }
    );
  }


  /**
   * This function opens a dialog for sharing information with configurable options such as confirm
   * button text and CSS class.
   * @param [step=createUrl] - The `step` parameter in the `openShareInformationBanner` function is
   * used to specify the current step of the process. In this case, the default value is set to
   * `'createUrl'`.
   * @param [confirmButtonHtml=YES] - The `confirmButtonHtml` parameter in the
   * `openShareInformationBanner` function is used to specify the HTML content for the confirm button
   * in the dialog box. In this case, the default value for `confirmButtonHtml` is set to 'LOAD NEW
   * CONFIGURABLES'.
   * @param [confirmButtonCssClass=confirm] - The `confirmButtonCssClass` parameter in the
   * `openShareInformationBanner` function is used to specify the CSS class that will be applied to the
   * "YES" button in the dialog box. In this case, the default CSS class is set to
   * `'confirm'`. This
   * @param [cancelButtonHtml=Cancel] - The `cancelButtonHtml` parameter in the
   * `openShareInformationBanner` function is used to specify the HTML content for the cancel button in
   * the dialog box. In this case, the default value for `cancelButtonHtml` is set to 'Cancel'. This
   * text will be displayed on the cancel button
   * @returns The `openShareInformationBanner` function returns a Promise<boolean>.
   */
  public openShareInformationBanner(
    step = 'createUrl',
    confirmButtonHtml = 'YES',
    confirmButtonCssClass = 'confirm',
    cancelButtonHtml = 'Cancel',
  ): Promise<boolean> {
    return this.openDialog<ConfirmationDataIn>(
      'shareInformations',
      ShareInformationsDialogComponent,
      'no-resize',
      true,
      {
        step: step,
        confirmButtonHtml: confirmButtonHtml,
        cancelButtonHtml: cancelButtonHtml,
        confirmButtonCssClass: confirmButtonCssClass,
      },
      {
        width: '600px',
        position: {
          top: '200px'
        }
      }
    ).then((data: DialogData<ConfirmationDataIn, boolean>) => (null != data) && (data.dataOut));
  }

  private closeDialogById(dialogId: string): void {
    const dialog = this.dialog.getDialogById(dialogId);
    if (null != dialog) {
      dialog.close();
    }
  }

}
