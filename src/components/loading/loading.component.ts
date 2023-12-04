/* eslint-disable @typescript-eslint/member-ordering */
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
import { Component, Input, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

/**
 * Displays a loading spinner
 */
@Component({
  selector: 'app-loading',
  templateUrl: 'loading.component.html',
  styleUrls: ['loading.component.scss'],
})
export class LoadingComponent implements AfterViewInit {
  @ViewChild('wrapper', { static: true }) wrapper: ElementRef;
  // @Input() show = false;
  @Input() scale = 1;
  @Input()
  set visible(visible: boolean) {
    this.isVisible = visible;
    if (null != this.parentParent) {
      // when visible, set the elements displayed parent's position to relative,
      // to ensure that the wrapper's content stays within it.
      if (this.isVisible) {
        this.parentParent.style.position = 'relative';
      } else {
        this.parentParent.style.position = this.originalPosition;
      }
    }
  }

  public isVisible = false;
  private parentParent: HTMLElement;
  private originalPosition: string;

  constructor(
  ) { }

  ngAfterViewInit(): void {
    this.parentParent = (this.wrapper.nativeElement as HTMLElement).parentElement!.parentElement!;
    this.originalPosition = this.parentParent.style.position;
    setTimeout(() => {
      this.visible = this.isVisible; // trigger update
    }, 0);
  }

}
