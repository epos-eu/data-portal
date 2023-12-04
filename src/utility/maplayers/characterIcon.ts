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
import { Marker, AnchorLocation } from 'utility/eposLeaflet/eposLeaflet';

export class CharacterIcon extends Marker {
  private character = 'C';
  private colorHex = '#d03f3f';
  private sizePx = 20;
  private widthGuidePx = 10;

  public constructor() {
    super();
    this.setIconAnchor(AnchorLocation.CENTER);
    this.setTooltipAnchor(AnchorLocation.CENTER);
    this.setPopupAnchor(AnchorLocation.NORTH);
  }

  public configure(character: string, sizePx?: number, colorHex?: string, widthGuidePx?: number): this {
    this.character = character.charAt(0) || 'C';
    this.sizePx = (sizePx != null) ? sizePx : this.sizePx;
    this.colorHex = (colorHex != null) ? colorHex : this.colorHex;
    this.widthGuidePx = (widthGuidePx != null) ? widthGuidePx : this.widthGuidePx;
    return this;
  }

  public getIcon(): HTMLElement {
    const wrapperDiv = document.createElement('div');

    const marker = document.createElement('span');
    marker.innerHTML = this.character.charAt(0);
    marker.style.fontSize = `${this.sizePx}px`;
    marker.style.lineHeight = `${this.sizePx}px`;
    marker.style.fontWeight = 'bold';
    marker.style.color = this.colorHex;
    wrapperDiv.appendChild(marker);

    this.setIconSize(this.widthGuidePx, this.sizePx);
    return wrapperDiv;
  }

}
