import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Organization } from 'api/webApi/data/organization.interface';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { SimpleOrganization } from 'api/webApi/data/impl/simpleOrganization';
import { DialogService } from 'components/dialog/dialog.service';
import { FacetLeafItemMI } from 'services/model/modelItems/facetLeafItemMI';
import { Subscription } from 'rxjs';
import { Unsubscriber } from 'decorators/unsubscriber.decorator';
import { ECVar } from 'api/webApi/data/ECVar.interface';

export interface ECV extends ECVar{
  isSelected: boolean;
}

export type ECVCategory = {
  [category: string]: string[];
};

@Unsubscriber('subscriptions')
@Component({
  selector: 'app-ecv-filter',
  templateUrl: './ecvFilter.component.html',
  styleUrls: ['./ecvFilter.component.scss']
})
export class EcvFilterComponent implements OnInit {

  @Input() public ECVsList: Array<Object>;
  @Input() public ECVsSelected: Array<string>;
  @Input() public title: string;
  @Input() public label: string;
  @Input() public model: FacetLeafItemMI;
  @Output() newECVsSelected: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();

  @ViewChild('ECVsSelect') private ECVsSelect: MatSelect;

  /** Variable for keeping track of subscriptions, which are cleaned up by Unsubscriber */
  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();

  constructor(
    private readonly dialogService: DialogService,
  ) {
    // JUST FOR TESTING PURPOSES, populating the list of ECVs with mock data! 
    // (when we'll fetch real data in searchFacets, will pass them here through the ECVsList @Input property of this component!)
    this.ECVsList = this.currentECVS;
  }

 

  // Mock Data
  public currentECVS: Array<ECVCategory> = [
    
    {Atmosphere : [
      'Surface',
      'Precipitation',
      'Surface Pressure',
      'Surface Radiation Budget',
      'Surface Temperature',
      'Surface and upper air water vapour',
      'Surface Water Vapour',
      'Surface wind speed',
      'Surface Wind Speed and Direction',
      'Upper-air Temperature'
    ]
    },
    {Land : [
      'Groundwater',
      'Lakes',
      'River Discharge',
      'Terrestrial Water Storage (TWS)',
      'Evaporation from land',
      'Soil Moisture'
    ]
    },
    {Ocean : [
      'Ocean Surface Heat Flux',
      'Sea Ice',
      'Sea level',
      'Sea State',
      'Sea surface currents',
      'Surface Currents',
      'Sea Surface Salinity',
      'Sea surface stress',
      'Surface Stress',
      'Sea Surface Temperature',
      'Subsurface currents',
      'Subsurface salinity',
      'Subsurface Temperature',
    ]
    }
  ]


  ngOnInit(): void {

    setTimeout(() => {
      // select options arrived from input array
      this.selectOption();

    }, 100);

    /* if (this.model !== undefined) {
      this.subscriptions.push(
        this.model.valueObs.subscribe((value: Array<string>) => {
          if (value !== null) {
            this.dataProvidersSelected = value;
            this.selectOption();
          }
        })
      );
    } */
  }

  /**
   * The `openFilter` function opens a dialog for selecting data providers, updates the selected data
   * providers, and closes the select.
   */
  public openFilter(): void {
    // for now passing mock data (currentECVS) to the dialog, then we'll be using the ECVsList @Input property of this component!
    void this.dialogService.openECVFilter(this.currentECVS, undefined, this.currentECVS, 'Filter by ECV').then((output) => {

        if (output !== null && output.dataOut !== false) {
          if (output !== null) {
            const selected = output.dataOut as Array<string>;
            this.newECVsSelected.emit(output.dataOut as Array<string>);

            this.ECVsSelect.options.forEach((item: MatOption) => {
              const id = (item.value as SimpleOrganization).getIdentifier();
              if (selected.includes(id)) {
                item.select();
              }
            });
          }
        }
        // close select
        this.ECVsSelect.close();

      });
  }

  private selectOption(): void {

    if (this.ECVsSelect !== undefined) {

      this.ECVsSelect.options.forEach(item => {

        // TO-DO: Commented out FOR NOW: instead of SimpleOrganization, need to create a 'SimpleECV' class! (so you can use this function)

        /* const id = (item.value as SimpleOrganization).getIdentifier();
        if (this.ECVsSelected.includes(id)) {
          item.select();
        } else {
          item.deselect();
        } */
      });
    }

  }
}

