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
import { Component, Injector, Input } from '@angular/core';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { MenuItem, MenuService } from './menu.service';
import { DialogService } from 'components/dialog/dialog.service';
import { TourService } from 'services/tour.service';
import { LocalStoragePersister } from 'services/model/persisters/localStoragePersister';
import { Tracker } from 'utility/tracker/tracker.service';
import { TrackerAction, TrackerCategory } from 'utility/tracker/tracker.enum';

/**
 * The header component that is displayed in the app.
 */
@Unsubscriber('subscriptions')
@Component({
  selector: 'app-menu',
  templateUrl: 'menu.component.html',
  styleUrls: ['menu.component.scss']
})
export class MenuComponent {

  @Input() data: MenuItem[] = [];
  @Input() trigger: MenuItem | null = null;
  @Input() isRootNode = false;
  @Input() root: MenuItem = {
    name: 'Menu',
    icon: 'menu'
  };

  constructor(
    private readonly menuService: MenuService,
    private readonly tracker: Tracker,
    private readonly injector: Injector,
  ) { }

  public isExpandable(node: MenuItem): boolean {
    return this.menuService.isExpandable(node);
  }

  public getData(node: MenuItem | null) {
    this.data = node === null ? [] : node.children ?? [];
  }

  public click(node: MenuItem, event: Event): void {
    if (node.url !== undefined) {
      this.tracker.trackEvent(TrackerCategory.GENERAL, TrackerAction.OPEN, node.name);
      window.open(node.url, '_blank');
    } else {

      let track = true;

      switch (node.action) {
        case 'feedback':
          this.injector.get(DialogService).openFeedbackDialog();
          break;

        case 'startGuidedTour':
          this.injector.get(TourService).startEposFiltersTour(event);
          track = false;
          break;

        case 'videoguide':
          this.injector.get(DialogService).openVideoGuideDialog();
          break;

        case 'shareUrl':
          this.injector.get(DialogService).openShareInformationBanner('createUrl', 'COPY URL ON CLIPBOARD');
          break;

        case 'resetall':
          this.injector.get(LocalStoragePersister).resetAllVariables(true);
          track = false;
          break;

        default:
          break;
      }

      if (track) {
        this.tracker.trackEvent(TrackerCategory.GENERAL, TrackerAction.OPEN, node.action);
      }

    }

  }
}


