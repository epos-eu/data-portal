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
import { DistributionSummary } from '../distributionSummary.interface';
import { Confirm } from '../../utility/preconditions';
import { DistributionFormat } from '../distributionFormat.interface';

export class SimpleDistributionSummary implements DistributionSummary {
  public readonly isDownloadable: boolean;
  public readonly isMappable: boolean;
  public readonly isGraphable: boolean;
  public readonly isTabularable: boolean;
  public readonly isOnlyDownloadable: boolean;
  public readonly statusNumber: number;
  public readonly statusTimestampString: string;

  protected constructor(
    protected readonly identifier: string, //
    protected readonly name: string, //
    protected readonly formats: Array<DistributionFormat>,
    protected readonly status: number,
    protected readonly statusTimestamp: string,
  ) {
    this.isMappable = (this.getMappableFormats().length > 0);
    this.isGraphable = (this.getGraphableFormats().length > 0);
    this.isDownloadable = (this.getDownloadableFormats().length > 0);
    this.isTabularable = (this.getTabularableFormats().length > 0);
    this.isOnlyDownloadable = false;
    this.statusNumber = status;
    this.statusTimestampString = statusTimestamp;
  }

  public static make(
    identifier: string,
    name: string,
    formats: Array<DistributionFormat>,
    status: number,
    statusTimestamp: string,
  ): DistributionSummary {
    Confirm.requiresValidString(identifier);
    Confirm.requiresValidString(name);
    Confirm.requiresValid(formats);
    return new SimpleDistributionSummary(identifier, name, formats, status, statusTimestamp);
  }


  getName(): string {
    return this.name;
  }

  getIdentifier(): string {
    return this.identifier;
  }

  getFormats(): Array<DistributionFormat> {
    return this.formats;
  }

  getMappableFormats(): Array<DistributionFormat> {
    return this.formats.filter((format: DistributionFormat) => format.isMappable);
  }
  getGraphableFormats(): Array<DistributionFormat> {
    return this.formats.filter((format: DistributionFormat) => format.isGraphable);
  }

  getDownloadableFormats(): Array<DistributionFormat> {
    return this.formats.filter((format: DistributionFormat) => format.isDownloadable);
  }

  getTabularableFormats(): Array<DistributionFormat> {
    return this.formats.filter((format: DistributionFormat) => format.isTabularable);
  }

  getStatus(): number {
    return this.statusNumber;
  }

  getStatusTimestamp(): string {
    return this.statusTimestamp;
  }

}
