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
import { ApiService } from 'api/api.service';
import { DiscoverRequest, DiscoverResponse } from 'api/webApi/classes/discoverApi.interface';
import { Model } from './model/model.service';

import { LoggingService } from './logging.service';

/**
 * A service that exposes the "discover" webAPI functionality to the rest of the GUI.
 */
@Injectable()
export class DataSearchService {

  constructor(
    private readonly apiService: ApiService,
    private readonly loggingService: LoggingService,
    protected readonly model: Model,
  ) {
  }

  /**
   * Triggers the search callout from the {@link ApiService} and sets the response to the {@link Model}.
   * @param discoverRequest {DiscoverRequest} Defines the parameters of the search.
   */
  public doSearch(discoverRequest: DiscoverRequest): Promise<DiscoverResponse> {

    return this.loggingService.logForPromise(
      this.apiService.discover(discoverRequest),
      this.getLogMessage(discoverRequest),
    ).then((r: DiscoverResponse) => {

      switch (this.getContextualStartPath()) {
        case 'resources': {
          this.model.dataDiscoverResponse.set(r);
          break;
        }
      }

      return r;
    });

  }

  private getContextualStartPath(): string {
    const lastUrlPath = window.location.pathname.split('/').pop();
    let startPathElements = '';

    switch (lastUrlPath) {
      case '': {
        startPathElements = 'resources';
        break;
      }

    }
    return startPathElements;
  }

  private getLogMessage(discoverRequest: DiscoverRequest): string {
    return `Search API Call - ${this.discoverRequestToLogString(discoverRequest)}`;
  }


  private discoverRequestToLogString(request: DiscoverRequest): string {

    let s = '';

    // QUERY
    const query: null | string = request.getQuery();
    if (query != null) {
      s = s.concat(s, 'query: [', query, '] ');
    }

    const momentFormat = 'YYYY-MM-DDThh:mm:ssZ';

    // START
    const start = request.getStartDate();
    if (start != null) {
      s = s.concat(s, 'startDate: ', start.format(momentFormat), ' ');
    }

    // END
    const end = request.getEndDate();
    if (end != null) {
      s = s.concat(s, 'endDate: ', end.format(momentFormat), ' ');
    }

    // BBOX
    const bbox = request.getBBox();
    if (bbox != null) {
      // order: epos:northernmostLatitude , epos:easternmostLongitude, epos:southernmostLatitude, epos:westernmostLongitude
      // (north,east,south,west)
      // const value: string = '' + bbox[0] + ',' + bbox[1] + ',' + bbox[2] + ',' + bbox[3] + '';
      const value: string = bbox.asArray().join(',');
      s = s.concat(s, 'bbox: ', value, ' ');
    }

    // keywords
    const keywords: null | Array<string> = request.getKeywordIds();
    if (keywords != null && keywords.length > 0) {
      s = s.concat(s, 'keywords: #', String(keywords.length) + ' ');
    }

    // organisations
    const organisations: null | Array<string> = request.getOrganisationIds();
    if (organisations != null && organisations.length > 0) {
      s = s.concat(s, 'organisations: #', String(organisations.length) + ' ');
    }

    s = s.trim();

    if (s.length === 0) {
      s = 'no parameters provided';
    }

    return s;

  }

}
