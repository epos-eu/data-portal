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
import { HttpClient } from '@angular/common/http';

export interface ECV extends ECVar{
  isSelected: boolean;
}
export interface SimpleECV {
  name: string;
  uri: string;
  isSelected: boolean;
}
@Unsubscriber('subscriptions')
@Component({
  selector: 'app-ecv-filter',
  templateUrl: './ecvFilter.component.html',
  styleUrls: ['./ecvFilter.component.scss']
})
export class EcvFilterComponent implements OnInit {

@Input() public ECVsList: SimpleECV[];
@Input() public ECVsSelected: string[];
  @Input() public title: string;
  @Input() public label: string;
  @Input() public model: FacetLeafItemMI;
  @Output() newECVsSelected: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();

  @ViewChild('ECVsSelect') private ECVsSelect: MatSelect;

  /** Variable for keeping track of subscriptions, which are cleaned up by Unsubscriber */
  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();
  
  constructor(
    private readonly dialogService: DialogService,
    private http: HttpClient,
  ) {
    
    // JUST FOR TESTING PURPOSES, populating the list of ECVs with mock data! 
    // (when we'll fetch real data in searchFacets, will pass them here through the ECVsList @Input property of this component!)
  }



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
    if (!this.ECVsList || this.ECVsList.length === 0) return;

    void this.dialogService
      .openECVFilter(this.ECVsList, this.ECVsSelected, this.title)
      .then(output => {
        if (output?.dataOut && output.dataOut !== false) {
          const selectedUris = output.dataOut as string[];
          this.ECVsSelected = selectedUris;  // aggiorna lista locale
          this.updateCheckboxes();
          this.newECVsSelected.emit(selectedUris);
        }
      });
  }

  /**
   * Seleziona o deseleziona tutti gli ECVs
   * @param selectAll true = seleziona tutto, false = deseleziona tutto
   */
  public toggleSelectAll(selectAll: boolean): void {
    this.ECVsList.forEach(ecv => ecv.isSelected = selectAll);
    this.ECVsSelected = selectAll ? this.ECVsList.map(ecv => ecv.uri) : [];
    this.updateCheckboxes();
    this.newECVsSelected.emit(this.ECVsSelected);
  }

  /**
   * Aggiorna la UI dei checkbox nel mat-select
   */
  private updateCheckboxes(): void {
    if (!this.ECVsSelect) return;

    this.ECVsSelect.options.forEach((item: MatOption) => {
      const ecv = item.value as SimpleECV;
      this.ECVsSelected.includes(ecv.uri) ? item.select() : item.deselect();
    });
  }

  /**
   * Seleziona inizialmente le opzioni già presenti in ECVsSelected
   */
  private selectOption(): void {
    this.updateCheckboxes();
  }
}

