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
import { environment } from 'environments/environment';
import { LocalStoragePersister } from './model/persisters/localStoragePersister';
import { LocalStorageVariables } from './model/persisters/localStorageVariables.enum';
import * as CryptoJS from 'crypto-js';
import { NotificationService } from './notification.service';
import { ApiService } from 'api/api.service';

/**
 * This service knows whether this is the live deployment
 * and may run scripts based on this info.
 */
@Injectable()
export class ShareService {

  private salt: string = '';

  constructor(
    private readonly localStorage: LocalStoragePersister,
    private readonly notificationService: NotificationService,
    private readonly apiService: ApiService,
  ) {
    this.salt = environment.shareSalt;
  }


  /**
   * The function creates a data portal URL by retrieving and encrypting data from local storage before
   * copying a citation to the clipboard.
   */
  public createDataPortalUrl(): void {

    const baseUrl = window.location.href;

    // retrieve all localstorage info
    void this.localStorage.get(LocalStorageVariables.LS_DATA_SEARCH_CONFIGURABLES).then((dataSearchConfigurables: string) => {


      void this.localStorage.get(LocalStorageVariables.LS_CONFIGURABLES).then((configurables) => {

        const shareConfiguration: ShareConfigurables = {
          dataSearchConfigurables: dataSearchConfigurables,
          configurables: JSON.stringify(configurables)
        };

        const encryptConfigurables = this.encrypt((JSON.stringify(shareConfiguration)));

        // save on DB
        void this.apiService.saveConfigurables(encryptConfigurables).then(key => {
          const url = baseUrl + '?share=' + key;
          this.copyCitationToClipboard(url);
        }).catch((_) => {
          // Show an error notification
          this.notificationService.sendNotification('Failed to copy Data Portal URL to clipboard', 'x', NotificationService.TYPE_ERROR, 5000);
        });

      });
    });

  }

  /**
   * The `encrypt` function takes a string input, encrypts it using AES encryption with a specified
   * salt, and returns the encrypted data as a string.
   * @param {string} data - The `data` parameter in the `encrypt` function is a string that represents
   * the data you want to encrypt. This data will be converted to a JSON string before encryption using
   * the CryptoJS library's AES encryption method.
   * @returns The `encrypt` function is returning the encrypted version of the input `data` string
   * using the AES encryption algorithm. The input `data` is first converted to a JSON string using
   * `JSON.stringify(data)`, then encrypted using CryptoJS.AES with a salt value stored in `this.salt`,
   * and finally converted to a string representation before being returned.
   */
  public encrypt(data: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.salt).toString() as string;
  }

  /**
   * The function `deencrypt` decrypts a given string using AES encryption with a specified salt.
   * @param {string} data - The `data` parameter in the `deencrypt` function is the string that you
   * want to decrypt using the AES encryption algorithm.
   * @returns The `deencrypt` function is returning the decrypted data as a string after decrypting it
   * using the AES algorithm with the provided salt.
   */
  public deencrypt(data: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return CryptoJS.AES.decrypt(data, this.salt).toString(CryptoJS.enc.Utf8);
  }

  private copyCitationToClipboard(data: string): void {

    navigator.clipboard.writeText(data).then(() => {
      // Show a success notification
      this.notificationService.sendNotification('Data Portal URL copied to clipboard', 'x', NotificationService.TYPE_SUCCESS, 5000);
    }).catch((_) => {
      // Show an error notification
      this.notificationService.sendNotification('Failed to copy Data Portal URL to clipboard', 'x', NotificationService.TYPE_ERROR, 5000);
    });
  }
}

export interface ShareConfigurables {
  dataSearchConfigurables: string;
  configurables: string;
}
