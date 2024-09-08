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
import { Organization } from '../organization.interface';

export class SimpleOrganization implements Organization {

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly url: string,
    public readonly country: string,
    public readonly logoUrl: string | null,
  ) {
  }

  public static make(
    id: string,
    name: string,
    url: string,
    country: string,
    logoUrl: string | null,
  ): SimpleOrganization {
    // create param
    return new SimpleOrganization(
      id,
      // Append the country code after the name of the provider
      name.trim() + (country !== '' ? (' - ' + country) : ''),
      url,
      country,
      logoUrl,
    );
  }

  getIdentifier(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getUrl(): string {
    return this.url;
  }

  getCountry(): string {
    return this.country;
  }

  getLogoUrl(): string | null {
    return this.logoUrl;
  }
}


