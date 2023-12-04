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
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { PageLoadingComponent } from './pageLoading/pageLoading.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { userNotificationProvider } from './userNotifications/userNotifications.adapter';
import { DirectivesModule } from 'directives/directives.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InfoToolTipComponent } from './infoToolTip/infoToolTip.component';
import { LoginComponent } from './login/login.component';
import { LoadingComponent } from './loading/loading.component';
import { ObjectDisplayerComponent } from './objectDisplayer/objectDisplayer.component';
import { TourService } from 'services/tour.service';
import { NotificationComponent } from './notification/notification.component';
import { PipesModule } from 'pipes/pipes.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * Module for registering new components that may be used anywhere in the app.
 */
@NgModule({
  declarations: [
    HeaderComponent,
    PageLoadingComponent,
    InfoToolTipComponent,
    LoginComponent,
    LoadingComponent,
    ObjectDisplayerComponent,
    NotificationComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    DirectivesModule,
    // angular materials library
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    // MatDatepickerModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    PipesModule
  ],
  exports: [
    HeaderComponent,
    PageLoadingComponent,
    LoadingComponent,
    InfoToolTipComponent,
    ObjectDisplayerComponent,
    NotificationComponent,
  ],
})

export class ComponentsModule {
  static forRoot(): ModuleWithProviders<ComponentsModule> {
    return {
      ngModule: ComponentsModule,
      providers: [
        userNotificationProvider,
        TourService,
      ]
    };
  }
}
