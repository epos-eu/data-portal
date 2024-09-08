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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { NotificationSnackComponent } from './notificationSnack/notificationSnack.component';
import { PipesModule } from 'pipes/pipes.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { VocabularyTooltipComponent } from './vocabularyTooltip/vocabularyTooltip.component';
import { CountrySelectComponent } from './contrySelect/countrySelect.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { DataProviderFilterComponent } from './dataProviderFilter/dataProviderFilter.component';
import { FacetDropdownComponent } from './facetDropdown/facetDropdown.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NotificationComponent } from './notification/notification.component';
import { NotificationService } from './notification/notification.service';
import { MultiSelectComponent } from './multiSelect/multiSelect.component';
import { VisibleOnComponent } from './visibleOn/visibleOn.component';
import { BaseResultsPanelComponent } from './baseResultsPanel/baseResultsPanel.component';
import { BaseLandingService } from 'pages/dataPortal/services/baseLanding.service';
import { MenuComponent } from './menu/menu.component';
import { MenuService } from './menu/menu.service';

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
    NotificationSnackComponent,
    VocabularyTooltipComponent,
    CountrySelectComponent,
    BreadcrumbComponent,
    DataProviderFilterComponent,
    FacetDropdownComponent,
    NotificationComponent,
    MultiSelectComponent,
    VisibleOnComponent,
    BaseResultsPanelComponent,
    MenuComponent,
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
    MatAutocompleteModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTreeModule,
    MatExpansionModule,
    MatCheckboxModule,
    PipesModule,
    ReactiveFormsModule,
  ],
  exports: [
    HeaderComponent,
    PageLoadingComponent,
    LoadingComponent,
    InfoToolTipComponent,
    ObjectDisplayerComponent,
    NotificationSnackComponent,
    VocabularyTooltipComponent,
    CountrySelectComponent,
    BreadcrumbComponent,
    DataProviderFilterComponent,
    FacetDropdownComponent,
    NotificationComponent,
    MultiSelectComponent,
    VisibleOnComponent,
    BaseResultsPanelComponent,
  ],
})

export class ComponentsModule {
  static forRoot(): ModuleWithProviders<ComponentsModule> {
    return {
      ngModule: ComponentsModule,
      providers: [
        userNotificationProvider,
        NotificationService,
        BaseLandingService,
        MenuService
      ]
    };
  }
}
