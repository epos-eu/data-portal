import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-powered-by',
  templateUrl: './powered-by.component.html',
  styleUrls: ['./powered-by.component.css']
})
export class PoweredByComponent {
  
  @Input() text = 'Powered by the EPOS Platform Open Source project';
  @Input() url = 'https://epos-eu.github.io/epos-open-source/#/';

  constructor() { }

}
