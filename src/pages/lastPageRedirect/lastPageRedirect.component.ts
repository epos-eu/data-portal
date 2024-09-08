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
import { Component, OnInit } from '@angular/core';
import { AAAIUser } from 'api/aaai/aaaiUser.interface';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { Subscription } from 'rxjs';
import { LastPageRedirectService } from 'services/lastPageRedirect.service';
import { Model } from 'services/model/model.service';
import { TrackerAction, TrackerCategory } from 'utility/tracker/tracker.enum';
import { Tracker } from 'utility/tracker/tracker.service';

/** The `LastPageRedirectComponent` class implements the `OnInit` interface and redirects to the last
page using the `LastPageRedirectService`. */
@Component({
  selector: 'app-last-page-redirect',
  templateUrl: './lastPageRedirect.component.html',
})
@Unsubscriber('subscriptions')
export class LastPageRedirectComponent implements OnInit {

  public user: null | AAAIUser;

  private readonly subscriptions = new Array<Subscription>();

  /**
   * The constructor function takes in a LastPageRedirectService parameter and assigns it to a private
   * readonly property.
   * @param {LastPageRedirectService} lastPageRedirectService - The parameter `lastPageRedirectService`
   * is a service called `LastPageRedirectService` that is being injected into the constructor using
   * Angular's dependency injection system. This service likely provides functionality related to
   * redirecting to the last visited page or handling page redirection logic within the application.
   */
  constructor(
    private readonly lastPageRedirectService: LastPageRedirectService,
    private readonly model: Model,
    private readonly tracker: Tracker,
  ) {
  }

  /**
   * The ngOnInit function calls a service method to redirect to the last visited page.
   */
  ngOnInit(): void {
    this.lastPageRedirectService.goToLastPage();

    this.subscriptions.push(
      this.model.user.valueObs.subscribe((user: AAAIUser) => {
        this.user = user;
      })
    );

    setTimeout(() => {
      this.tracker.trackEvent(TrackerCategory.GENERAL, TrackerAction.LOGIN, 'Submit');
    }, 1000);
  }
}
