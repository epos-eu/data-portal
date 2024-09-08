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

/* eslint-disable @typescript-eslint/no-floating-promises */
import { Component, OnInit } from '@angular/core';
import { AaaiService } from 'api/aaai.service';
import { AAAIUser } from 'api/aaai/aaaiUser.interface';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { Subscription } from 'rxjs';
import { environment } from 'environments/environment';
import { RouteInfoService } from 'services/routeInfo.service';
import { MapInteractionService } from 'utility/eposLeaflet/services/mapInteraction.service';
import { SimpleBoundingBox } from 'api/webApi/data/impl/simpleBoundingBox';
import { TourService } from 'services/tour.service';
import { PanelsEmitterService } from 'services/panelsEventEmitter.service';
import { DataSearchConfigurablesServiceResource } from 'pages/dataPortal/modules/dataPanel/services/dataSearchConfigurables.service';
import { MenuItem, MenuService } from 'components/menu/menu.service';
import { Tracker } from 'utility/tracker/tracker.service';
import { TrackerAction, TrackerCategory } from 'utility/tracker/tracker.enum';
import { DialogService } from 'components/dialog/dialog.service';

/**
 * The header component that is displayed in the app.
 */
@Unsubscriber('subscriptions')
@Component({
  selector: 'app-header-bar',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss']
})
export class HeaderComponent implements OnInit {
  public title = '';
  public dropdown: string;
  public user: null | AAAIUser = null;
  public version: unknown;
  public readonly urlHomepage = environment.homepage;
  public readonly urlAboutpage = environment.aboutpage;
  public initialMenuData: MenuItem[] = [];
  public shareMenu: MenuItem[] = [];

  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(
    private readonly aaai: AaaiService,
    private readonly routeInfo: RouteInfoService,
    private mapInteractionService: MapInteractionService,
    private dataConfigSearchService: DataSearchConfigurablesServiceResource,
    private tourService: TourService,
    private panelsEvent: PanelsEmitterService,
    private menuService: MenuService,
    private readonly tracker: Tracker,
    private readonly dialogService: DialogService,
  ) {
    this.initialMenuData = this.menuService.rootLevelNodes;

    // used if app-menu component is enabled
    /* this.shareMenu = [
      {
        name: 'Url',
        action: 'shareUrl',
        icon: 'link'
      }
    ]; */
  }

  public ngOnInit(): void {
    this.subscriptions.push(
      this.aaai.watchUser().subscribe((user: AAAIUser) => {
        this.user = user;
      }),
    );

    this.subscriptions.push(
      this.routeInfo.watchCurrentRoute().subscribe(() => {
        this.title = this.routeInfo.getDataValue('title', '')!;
        this.version = this.routeInfo.getDataValue('version', environment.version)!;
      }),
      this.panelsEvent.invokeTablePanel.subscribe(() => {
        // closes the drop-down menu when the table panel opens
        this.dropdown = '';
      }),
      this.panelsEvent.invokeLayerControlPanel.subscribe(() => {
        // closes the drop-down menu when the layer control panel opens
        this.dropdown = '';
      })
    );
  }

  /**
   * The function toggles the visibility of a dropdown menu by setting the dropdown property to the
   * specified dropdown name or an empty string.
   * @param [dropdownName=menu] - The `dropdownName` parameter is a string that represents the name of
   * the dropdown. By default, it is set to `'menu'`.
   */
  public toggleDropdown(dropdownName = 'menu'): void {
    if (this.dropdown === dropdownName) {
      this.dropdown = '';
    } else {
      this.dropdown = dropdownName;
    }
  }

  /**
   * The function opens a URL either in a new tab or in the current tab and then toggles a dropdown.
   * @param {string} url - The `url` parameter is a string that represents the URL of the external
   * website you want to open.
   * @param [newTab=false] - The `newTab` parameter is a boolean value that determines whether the URL
   * should be opened in a new tab or in the current tab. If `newTab` is set to `true`, the URL will be
   * opened in a new tab using `window.open()`. If `newTab` is
   */
  public openExternalUrl(url: string, newTab = false): void {
    if (newTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
    this.toggleDropdown('');
  }

  /**
   * The `clickItem` function in TypeScript handles different actions based on the input ID, such as
   * opening feedback, external URLs, guided tours, video guides, and tracking events.
   * @param input - The `clickItem` function takes an input object with the following parameters:
   */
  public clickItem(input: { id: string; event?: Event; url?: string; newTab?: boolean }): void {

    let track = true;

    switch (input.id) {

      case 'externalUrl':
        this.openExternalUrl(input.url ?? '', input.newTab ?? false);
        track = false;
        break;

      case 'homepage':
        this.openExternalUrl(input.url ?? '', input.newTab ?? false);
        break;

      default:
        break;
    }

    if (track) {
      this.tracker.trackEvent(TrackerCategory.GENERAL, TrackerAction.OPEN, input.id);
    }

  }

  /**
   * The function "handleTourFinish" performs several actions related to clearing filters and resetting
   * the state after a tour is finished.
   */
  public handleTourFinish(): void {
    this.mapInteractionService.setBoundingBoxSpatialRangeFromControl(SimpleBoundingBox.makeUnbounded(), true);

    this.tourService.triggerClearFiltersCall();
    this.dataConfigSearchService.clearPinned();

    const tourFav = this.dataConfigSearchService.getAllPinned()?.[0];
    if (tourFav) {
      setTimeout(() => {
        this.dataConfigSearchService.setPinned(tourFav.id, false);
      }, 400);
    }
    this.tourService.triggerClearFiltersCall();
  }


  /**
   * The `share` function opens a dialog service to display a share information banner with a specified
   * URL and message.
   */
  public share(): void {
    this.dialogService.openShareInformationBanner('createUrl', 'COPY URL ON CLIPBOARD');
  }

}
