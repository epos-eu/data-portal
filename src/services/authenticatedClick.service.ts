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
import { AaaiService } from 'api/aaai.service';
import { DialogService } from 'components/dialog/dialog.service';
import { LoginMessageObject } from 'components/dialog/pleaseLoginDialog/pleaseLoginContent.component';

/**
 * A service that checks if user is logged after attempting to click on download link
 */
@Injectable({
    providedIn: 'root'
})
export class AuthenticatedClickService {
    constructor(
        private readonly aaaiService: AaaiService,
        private readonly dialogService: DialogService,
    ) {
    }

    public authenticatedClick(message: LoginMessageObject | null = null): boolean {

        if (message === null) {
            message = {
                title: 'Login To Continue',
                message: 'In order to access the EPOS application\'s full functionality please Login.'
            };
        }

        if (null == this.aaaiService.getUser()) {
            void this.dialogService.openPleaseLoginDialog(undefined, message);
        }
        return null != this.aaaiService.getUser();
    }

    public authenticatedContactForm(): boolean {
        const message = { title: 'Login to send message', message: '' };
        return this.authenticatedClick(message);
    }
}
