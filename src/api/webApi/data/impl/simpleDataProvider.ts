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
import { DataProvider } from 'api/webApi/data/dataProvider.interface';

export class SimpleDataProvider implements DataProvider {

  private constructor(
    public readonly dataProviderLegalName: string,
    public readonly dataProviderUrl: string,
    public readonly relatedDataProvider: Array<DataProvider>,
    public readonly dataProviderId: string,
    public readonly country: string,
  ) {

  }

  public static make(
    dataProviderLegalName: string,
    dataProviderUrl: string,
    relatedDataProvider: Array<DataProvider>,
    dataProviderId: string,
    country: string,
  ): SimpleDataProvider {
    // create param
    return new SimpleDataProvider(
      // Append the country code after the name of the provider
      dataProviderLegalName + (country ? (' - ' + country) : ''),
      dataProviderUrl,
      relatedDataProvider,
      dataProviderId,
      country,
    );
  }

}


