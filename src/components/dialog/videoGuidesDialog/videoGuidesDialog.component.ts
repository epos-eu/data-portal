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

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'environments/environment';
import { DialogData } from '../baseDialogService.abstract';
import { Video } from './videoComponent/video.component';
import { Tracker } from 'utility/tracker/tracker.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TrackerAction, TrackerCategory } from 'utility/tracker/tracker.enum';

@Component({
  selector: 'app-video-guides-dialog',
  templateUrl: './videoGuidesDialog.component.html',
  styleUrls: ['./videoGuidesDialog.component.scss']
})
export class VideoGuidesDialogComponent {

  public videos: Array<Video>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private readonly tracker: Tracker
  ) {
    this.videos = environment.videos;
    this.tracker.trackEvent(TrackerCategory.VIDEO, TrackerAction.PLAY, this.videos[0].title);
  }

  public changeTab(event: MatTabChangeEvent): void {
    this.tracker.trackEvent(TrackerCategory.VIDEO, TrackerAction.PLAY, this.videos[event.index].title);
  }

}
