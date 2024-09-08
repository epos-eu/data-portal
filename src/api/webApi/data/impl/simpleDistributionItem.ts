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

import { DistributionItem } from '../distributionItem.interface';
import { DistributionLevel } from '../distributionLevel.interface';
import { DistributionSummary } from '../distributionSummary.interface';

export class SimpleDistributionItem implements DistributionItem {

  constructor(
    public readonly id: string,
    public readonly distId: string,
    public readonly name: string,
    public readonly code: string | null,
    public readonly icon: string | null,
    public readonly color: string | null,
    public readonly lcolor: string | null,
    public readonly visibility: string[],
    public readonly isDownloadable: boolean,
    public readonly distSummary: DistributionSummary,
    public readonly isPinned: boolean,
    public readonly hideToResult: boolean,
    public readonly levels: Array<Array<DistributionLevel>>,
    public readonly status: number | null,
    public readonly statusTimestamp: string | null,
  ) {
  }

  public static make(
    id: string,
    distId: string,
    name: string,
    code: string | null,
    icon: string | null,
    color: string | null,
    lcolor: string | null,
    visibility: string[],
    isDownloadable: boolean,
    distSummary: DistributionSummary,
    isPinned: boolean,
    hideToResult: boolean,
    levels: Array<Array<DistributionLevel>>,
    status: number | null,
    statusTimestamp: string | null,
  ): DistributionItem {

    return new SimpleDistributionItem(id,
      distId,
      name,
      code,
      icon,
      color,
      lcolor,
      visibility,
      isDownloadable,
      distSummary,
      isPinned,
      hideToResult,
      levels,
      status,
      statusTimestamp);
  }

}
