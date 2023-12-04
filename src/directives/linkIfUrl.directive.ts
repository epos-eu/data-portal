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
import { AfterViewInit, Directive, ElementRef } from '@angular/core';

/**
 * Direcive for showing the a string as a link if it is a url.
 */
@Directive({
  selector: '[appLinkIfUrl]'
})
export class LinkIfUrlDirective implements AfterViewInit {

  constructor(
    private readonly el: ElementRef,
  ) {
  }

  ngAfterViewInit(): void {
    const element = this.el.nativeElement as HTMLElement;
    const text = element.innerText;
    if (this.validURL(text)) {
      const link = document.createElement('a');
      link.target = '_blank';
      link.href = text;
      link.innerHTML = text;

      element.innerHTML = '';
      element.appendChild(link);
    }

  }


  private validURL(text: string): boolean {
    const pattern = /^(http|https|ftp):\/\//;
    return ((null != text) && (pattern.test(text)));
  }

}
