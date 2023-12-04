import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  public leafletMapElem: HTMLElement;

  public setMapRef(elem: HTMLElement): void {
    this.leafletMapElem = elem;
  }

  public getMapRef(): HTMLElement {
    return this.leafletMapElem;
  }
}
