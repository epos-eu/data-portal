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
import { Component, Inject, Injector, OnInit } from '@angular/core';
import { DialogData } from '../baseDialogService.abstract';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LocalStorageItem, LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { ShareConfigurables, ShareService } from 'services/share.service';
import { LocalStorageVariables } from 'services/model/persisters/localStorageVariables.enum';
import { environment } from 'environments/environment';
import { PoliciesService } from 'services/policiesService.service';
import { DataSearchConfigurablesServiceResource } from 'pages/dataPortal/modules/dataPanel/services/dataSearchConfigurables.service';
import { PageLoadingService } from 'services/pageLoading.service';
import { ApiService } from 'api/api.service';

interface ShareDataIn {
  step: string;
  confirmButtonHtml: string;
  confirmButtonCssClass: string;
  cancelButtonHtml: string;
}

@Unsubscriber('subscriptions')
@Component({
  selector: 'app-share-informations-dialog',
  templateUrl: './shareInformationsDialog.component.html',
  styleUrls: ['./shareInformationsDialog.component.scss']
})
export class ShareInformationsDialogComponent implements OnInit {

  public step = 'createUrl';

  public versionConf: string = '';
  public version: string = '';
  public showVersionMismatch = false;

  private configurables: Array<unknown> = [];
  private dataSearchConfigurables: string = '';
  private dataSearchConfigurablesReg: string = '';

  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<ShareDataIn, boolean>,
    private readonly route: ActivatedRoute,
    private router: Router,
    private readonly localStoragePersister: LocalStoragePersister,
    private readonly share: ShareService,
    private readonly policy: PoliciesService,
    private readonly dataSearchConfigurablesResources: DataSearchConfigurablesServiceResource,
    private readonly injector: Injector,
    private readonly pageLoadingService: PageLoadingService,
    private readonly apiService: ApiService,
  ) {
    this.version = environment.version as string;
    this.step = data.dataIn.step;
  }


  ngOnInit(): void {

    if (this.step === 'retrieve') {
      this.subscriptions.push(

        this.route.queryParams
          .subscribe((params: Params) => {
            if (params.share !== undefined && params.share !== '') {

              // retrieve
              void this.apiService.retrieveConfigurables(params.share as string).then(response => {

                if (response !== '') {

                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
                  const shareConf = JSON.parse(JSON.parse(this.share.deencrypt(response as string) as string)) as ShareConfigurables;

                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  this.configurables = JSON.parse(shareConf.configurables as string);
                  this.dataSearchConfigurables = shareConf.dataSearchConfigurables;

                  if (this.configurables !== undefined) {

                    this.configurables.map((v: LocalStorageItem) => {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
                      if (v.type === LocalStorageVariables.LS_VERSION) {
                        this.versionConf = v.value;
                      }
                    });
                  }
                } else {
                  this.cancel();
                }
              });
            } else {
              this.cancel();
            }
          }),
      );
    }
  }

  /**
   * The `cancel` function removes parameters and closes data.
   */
  public cancel(): void {
    this.removeParams();
    this.data.close();
  }

  public confirm(): void {
    if (this.step === 'createUrl') {
      this.data.dataOut = true;
      this.share.createDataPortalUrl();

      this.data.close();

    } else {
      this.confirmRetrive();
    }
  }

  /**
   * The `confirm` function updates data, sets local storage variables, processes query parameters,
   * removes parameters from the query string, reloads the page, and then closes the data.
   */
  private confirmRetrive(): void {
    this.data.dataOut = true;

    // start general loading spinner
    this.pageLoadingService.setLoadingStart();

    // get cookie consent already saved on localStorage
    const cookiesEnabled = this.policy.cookiesEnabled;
    const consentGivenString = this.policy.getConsentGivenString();

    // remove all storage
    this.localStoragePersister.resetAllVariables(false);

    // set previous cookie consent
    this.policy.setCookieConsent(cookiesEnabled);
    this.policy.setConsentGivenString(consentGivenString);

    // to inform new load process that it's a configuration loadabled from url
    this.localStoragePersister.set(LocalStorageVariables.LS_CONF_FROM_SHARE, true);

    try {

      this.localStoragePersister.set(LocalStorageVariables.LS_DATA_SEARCH_CONFIGURABLES, this.dataSearchConfigurables as string, false);

      this.localStoragePersister.set(LocalStorageVariables.LS_CONFIGURABLES, this.configurables);

      // remove parameter from query string
      this.removeParams();

      setTimeout(() => {

        // move from dataSearchConfigurables variables to models
        this.dataSearchConfigurablesResources.setModelVariablesFromConfigurables();

        // reload the page
        location.reload();
      }, 2000);

      this.data.close();

    } catch (error) {
      this.pageLoadingService.setLoadingEnd();
      this.cancel();
    }
  }

  /**
   * The function `removeParams` removes a parameter from the query string in a TypeScript application.
   */
  private removeParams(): void {
    // remove parameter from query string
    const queryParams = {};
    void this.router.navigate([], { queryParams, replaceUrl: true, relativeTo: this.route });
  }


}
