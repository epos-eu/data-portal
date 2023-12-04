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

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { TestBed, waitForAsync } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { AppComponent } from './app.component';
import { ComponentsModule } from 'components/components.module';
import { UrlHelperService, OAuthModule } from 'angular-oauth2-oidc';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { PagesModule } from 'pages/pages.module';
import { ApiModule } from 'api/api.module';
import { ServicesModule } from 'services/services.module';
import { DirectivesModule } from 'directives/directives.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DialogModule } from 'components/dialog/dialog.module';
import { LoggingService } from 'services/logging.service';
import { DialogService } from 'components/dialog/dialog.service';
import { LastPageRedirectService } from 'services/lastPageRedirect.service';
import { AppRoutingModule } from './app.routing.module';

describe('AppComponent', () => {
  beforeEach((done) => {
    TestBed.configureTestingModule({
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
        ApiModule.forRoot(),
        ServicesModule.forRoot(),
        DirectivesModule,
        MatMomentDateModule,
        DialogModule.forRoot(),
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        UrlHelperService,
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        LoggingService,
        DialogService,
        LastPageRedirectService,
      ]
    }).compileComponents();
    done();
  });

  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

});
