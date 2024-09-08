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
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class MenuService {

  dataMap = new Map<string, MenuItem[]>([]);

  rootLevelNodes: MenuItem[] = environment.mainMenu;

  getChildren(node: MenuItem): Array<MenuItem> {
    return node.children ?? [];
  }

  isExpandable(node: MenuItem): boolean {
    return this.getChildren(node).length > 0;
  }
}

export interface MenuItem {
  name: string;
  url?: string;
  action?: string;
  children?: Array<MenuItem>;
  icon?: string;
}
