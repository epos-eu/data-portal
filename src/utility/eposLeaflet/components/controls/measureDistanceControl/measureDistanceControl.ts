import { DialogService } from 'components/dialog/dialog.service';
import * as L from 'leaflet';
import 'leaflet-ruler';



export class MeasureDistanceControl extends L.Control {
  private measureControl: L.Control.Ruler;
  private measurePane: HTMLElement;
  private dialogShown = false;

  constructor(
    private dialogService: DialogService,
  ) {
    super();
  }



public addTo(map: L.Map): this {
  this.measurePane = map.createPane('rulerMeasure');
  this.measurePane.style.zIndex = '650';
  this.measurePane.style.pointerEvents = 'none';

  const options: L.Control.RulerOptions = {
    position: 'topright',
    pane: 'rulerMeasure',
    lengthUnit: {
      factor: 1,
      display: 'km',
      decimal: 2,
      label: 'Distance',
    },
    circleMarker: {
      color: 'red',
      radius: 4,
    },
    lineStyle: {
      color: 'red',
      dashArray: '5, 5',
    },
    measureArea: false,
  };

 //  L.Path.prototype.options.pane = 'rulerMeasure';
  this.measureControl = L.control.ruler(options).addTo(map);
  const container = this.measureControl.getContainer();
  if (container) {
    container.classList.add('measure-distance-button');
    const originalClick = container.onclick;

    container.onclick = async (event: MouseEvent) => {
      if (this.dialogShown) {
        // Already confirmed once, just proceed normally
        if (originalClick) {
          originalClick.call(container, event);
        }
        return;
      }

      event.preventDefault(); // prevent default activation for now
      const confirmed = await this.showMeasureDialog();

      if (confirmed) {
        this.dialogShown = true;
        container.classList.add('active');
        if (originalClick) {
          originalClick.call(container, event);
        }
      } else {
        this.dialogShown = true; // still mark as shown, even on cancel
        // simulate button click manually to still trigger the tool
        setTimeout(() => container.click(), 0); // delay to avoid recursion
      }
    };
  }
  return this;
}



  public remove(): this {
    if (this.measureControl) {
      this.measureControl.remove();
    }
    if (this.measurePane && this.measurePane.parentNode) {
      this.measurePane.parentNode.removeChild(this.measurePane);
    }
    return this;
  }

  private async showMeasureDialog(): Promise<boolean> {
    return this.dialogService.openConfirmationDialog(
      'End the measurement easily by clicking once and pressing the ESC key, or double-clicking.',
      false,
      'Continue',
    );
  }
}

declare module 'leaflet' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Control {
    interface RulerOptions extends ControlOptions {
      measureArea?: boolean;
      circleMarker?: {
        color: string;
        radius: number;
      };
      lineStyle?: {
        color: string;
        dashArray: string;
      };
      polyStyle?: {
        stroke: boolean;
        fillColor: string;
        fillOpacity: number;
      };
      lengthUnit?: {
        display: string;
        decimal: number;
        factor: number;
        label?: string;
      };
      pane?: string;
    }

    interface Ruler extends Control {
      remove(): this; // Changed from `void` to `this` to match Leaflet's Control
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace control {
    function ruler(options?: Control.RulerOptions): Control.Ruler;
  }
}

