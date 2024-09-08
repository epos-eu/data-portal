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
import {
  Component, OnInit,
} from '@angular/core';
import { OnAttachDetach } from 'decorators/onAttachDetach.decorator';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { MapInteractionService } from 'utility/eposLeaflet/services/mapInteraction.service';
import { Subscription } from 'rxjs';
import { BoundingBox } from 'utility/eposLeaflet/eposLeaflet';

@OnAttachDetach('onAttachComponents')
@Unsubscriber('subscriptions')
@Component({
  selector: 'app-drawing-spatial-control',
  templateUrl: './drawingSpatialControl.component.html',
  styleUrls: ['./drawingSpatialControl.component.scss']
})
export class DrawingSpatialControlComponent implements OnInit {

  public drawingBbox = false;

  /** Variable for keeping track of subscriptions, which are cleaned up by Unsubscriber */
  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(
    private readonly mapInteractionService: MapInteractionService,
  ) {

  }

  public ngOnInit(): void {

    this.subscriptions.push(
      this.mapInteractionService.mapBBox.observable.subscribe((bbox: BoundingBox) => {
        if (bbox.isBounded()) {
          this.drawingBbox = false;
        }
      })
    );
  }

  /**
   * The function toggles the drawing of a bounding box on a map.
   */
  public startDrawExtent(): void {
    this.drawingBbox = !this.drawingBbox;
    this.mapInteractionService.startBBox.set(this.drawingBbox);
  }

}
