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
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { UrlHelperService, OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';
import { CustomReuseStrategy } from 'utility/reuseStrategy';
import { RouteReuseStrategy } from '@angular/router';
import { PagesModule } from 'pages/pages.module';
import { ComponentsModule } from 'components/components.module';
import { ApiModule } from 'api/api.module';
import { ServicesModule } from 'services/services.module';
import { DirectivesModule } from 'directives/directives.module';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DialogModule } from 'components/dialog/dialog.module';
import { DialogService } from 'components/dialog/dialog.service';
import { LastPageRedirectService } from 'services/lastPageRedirect.service';
import { AppRoutingModule } from './app.routing.module';
import { PipesModule } from 'pipes/pipes.module';
import { NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { EPOS_MAT_DATE_FORMATS, EPOS_MAT_DATE_TIME_FORMATS } from './app.materialDateFormats';
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA, MAT_BOTTOM_SHEET_DEFAULT_OPTIONS } from '@angular/material/bottom-sheet';
import { oauthStorageFactory } from 'services/model/persisters/oauthStorageFactory';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

/**
 * This is the root module, included by the main.ts file, which is core to the Angular app.
 *
 * Some default date formats are set here for
 * [Angular Materials]{@link https://material.angular.io/} components, which are used throughout
 * the project.
 *
 * A {@link CustomReuseStrategy} is set, which affects routing.
 */
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    OAuthModule.forRoot(),
    AppRoutingModule,
    ComponentsModule.forRoot(),
    PagesModule,
    PipesModule,
    ApiModule.forRoot(),
    ServicesModule.forRoot(),
    DirectivesModule,
    MatMomentDateModule,
    NgxMatMomentModule,
    DialogModule.forRoot(),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    UrlHelperService, MatBottomSheet,
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: EPOS_MAT_DATE_FORMATS },
    { provide: NGX_MAT_DATE_FORMATS, useValue: EPOS_MAT_DATE_TIME_FORMATS },
    { provide: MatBottomSheetRef, useValue: {} },
    { provide: MAT_BOTTOM_SHEET_DATA, useValue: {} },
    { provide: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, disableClose: true } },
    { provide: OAuthStorage, useFactory: oauthStorageFactory },
    //   LoggingService,
    DialogService,
    LastPageRedirectService,
    { provide: MatSnackBarRef, useValue: {} },
    { provide: MAT_SNACK_BAR_DATA, useValue: {} },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
