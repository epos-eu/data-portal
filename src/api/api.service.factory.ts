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
import { BaseUrl } from './webApi/classes/baseurl.interface';
import { AaaiApi } from './webApi/classes/aaaiApi.interface';
import { DictionaryApi } from './webApi/classes/dictionaryApi.interface';
import { DetailsApi } from './webApi/classes/detailsApi.interface';
import { SearchApi } from './webApi/classes/searchApi.interface';
import { DevDictionaryApi } from './webApi/impl/dev/devDictionary';
import { DevAaaiApi } from './webApi/impl/dev/devAaai';
import { ErrorHandler } from './webApi/classes/errorHandler.interface';
import { ErrorHandlerImpl } from './webApi/impl/errorHandler';
import { BaseUrlImpl } from './webApi/impl/baseUrl';
import { RestImpl } from './webApi/impl/rest';
import { Rest } from './webApi/classes/rest.interface';
import { DevSearchApi } from './webApi/impl/dev/devSearch';
import { DevDetailsApi } from './webApi/impl/dev/devDetails';
import { DevCompositeApi } from './webApi/impl/dev/devApi';
import { ApiService } from './api.service';
import { ExecutionApi } from './webApi/classes/executionApi.interface';
import { DevExecutionApi } from './webApi/impl/dev/devExecution';
import { Api } from './webApi/classes/api.interface';
import { HttpClient } from '@angular/common/http';
import { AaaiService } from './aaai.service';
import { DiscoverApi } from './webApi/classes/discoverApi.interface';
import { DevDiscoverApi } from './webApi/impl/dev/devDiscover';
import { LoggingService } from 'services/logging.service';
import { SuccessHandler } from './webApi/classes/successHandler.interface';
import { SuccessHandlerImpl } from './webApi/impl/successHandler';
import { NotificationService } from 'services/notification.service';
import { MatDialog } from '@angular/material/dialog';

const AUTHENTICATING_API_URL = '/api/v1';

const AUTHENTICATING_API = 'Authenticating';

/**
 * Wrap API in service.
 * @param http
 */
export const selectableApiServiceFactory = (
  http: HttpClient,
  notificationService: NotificationService,
  aaai: AaaiService,
  loggingService: LoggingService,
  dialog: MatDialog,
): ApiService => {

  const map = new Map<string, Api>();
  map.set(AUTHENTICATING_API, devApiFactory(http, notificationService, AUTHENTICATING_API_URL, aaai, loggingService, dialog));

  return ApiService.makeSelectable(map, AUTHENTICATING_API);
};

/**
 * Provider for the LIVE ApiService
 * @param http
 */
export const selectableApiServiceProvider = {
  provide: ApiService,
  useFactory: selectableApiServiceFactory,
  deps: [HttpClient, NotificationService, AaaiService, LoggingService, MatDialog]
};


// =============================================
// DEV API =====================================
// =============================================

/**
 * Factory method for the LIVE ApiService
 * @param http
 */

export const devApiFactory = (
  http: HttpClient,
  notificationService: NotificationService,
  apiBaseUrl: string,
  aaai: AaaiService,
  loggingService: LoggingService,
  dialog: MatDialog,
): DevCompositeApi => {

  /*
  * Consider makeing these injectable?
  */
  const baseUrl: BaseUrl = new BaseUrlImpl(apiBaseUrl);
  const error: ErrorHandler = new ErrorHandlerImpl(notificationService, loggingService, dialog);
  const success: SuccessHandler = new SuccessHandlerImpl(notificationService, loggingService);
  const rest: Rest = new RestImpl(http, error, success, aaai);

  const aaaiApi: AaaiApi = new DevAaaiApi(baseUrl, rest);
  const dictionaryApi: DictionaryApi = new DevDictionaryApi(baseUrl, rest);

  const searchApi: SearchApi = new DevSearchApi(baseUrl, rest);
  const detailsApi: DetailsApi = new DevDetailsApi(baseUrl, rest);

  const executionApi: ExecutionApi = new DevExecutionApi(baseUrl, rest);
  const discoverApi: DiscoverApi = new DevDiscoverApi(baseUrl, rest);

  return new DevCompositeApi(discoverApi, aaaiApi, dictionaryApi, searchApi,
    detailsApi, executionApi);
};

/**
 * Wrap API in service.
 * @param http
 */
export const devApiServiceFactory =
  (http: HttpClient, notificationService: NotificationService, aaai: AaaiService, loggingService: LoggingService, dialog: MatDialog): ApiService => {
    return ApiService.make(devApiFactory(http, notificationService, AUTHENTICATING_API_URL, aaai, loggingService, dialog), AUTHENTICATING_API);
  };


/**
 * Provider for the LIVE ApiService
 * @param http
 */
export const devApiServiceProvider = {
  provide: ApiService,
  useFactory: devApiServiceFactory,
  deps: [HttpClient, NotificationService, AaaiService, LoggingService, MatDialog]
};
