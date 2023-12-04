import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterSearchPanelComponent } from './filterSearchPanel.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SearchFacetsComponent } from './facets/searchFacets.component';
import { SearchFacilityComponent } from './advancedSearch/searchFacility.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { DirectivesModule } from 'directives/directives.module';
import { SpatialTemporalControlsModule } from '../../temporalSpatialControls/spatialTemporalControls.module';



@NgModule({
  declarations: [FilterSearchPanelComponent, SearchFacilityComponent, SearchFacetsComponent],
  imports: [
    CommonModule,
    MatExpansionModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    ScrollingModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatIconModule,
    MatTooltipModule,
    SpatialTemporalControlsModule,
    MatAutocompleteModule,
    MatChipsModule,
    DirectivesModule,
  ],
  exports: [
    FilterSearchPanelComponent
  ]
})
export class FilterSearchModule { }
