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
import { DiscoverRequest } from 'api/webApi/classes/discoverApi.interface';
import { Moment } from 'moment';
import { TemporalRange } from '../temporalRange.interface';
import { BoundingBox } from '../boundingBox.interface';
import { SimpleTemporalRange } from './simpleTemporalRange';
import { SimpleBoundingBox } from './simpleBoundingBox';

export class SimpleDiscoverRequest implements DiscoverRequest {

  private constructor(
    private readonly query: null | string,
    private readonly temporalRange: TemporalRange,
    private readonly bbox: BoundingBox,
    private readonly keywordIds: null | Array<string>,
    private readonly organisationIds: null | Array<string>,
  ) { }

  public static makeEmptyQuery(): DiscoverRequest {
    return SimpleDiscoverRequest.makeFreeTextQuery();
  }

  public static makeFreeTextQuery(query: null | string = null): DiscoverRequest {
    return SimpleDiscoverRequest.makeFullQuery(query);
  }

  public static makeFullQuery(//
    query: null | string = null,
    temporalRange: TemporalRange = SimpleTemporalRange.makeUnbounded(),
    bbox: BoundingBox = SimpleBoundingBox.makeUnbounded(),
    keywordIds: null | Array<string> = null,
    organisationIds: null | Array<string> = null,
  ): DiscoverRequest {
    return new SimpleDiscoverRequest(query, temporalRange, bbox, keywordIds, organisationIds);
  }

  getQuery(): null | string {
    return this.query;
  }
  getStartDate(): null | Moment {
    return this.temporalRange.getLowerBound();
  }
  getEndDate(): null | Moment {
    return this.temporalRange.getUpperBound();
  }
  getBBox(): BoundingBox {
    return this.bbox;
  }
  getKeywordIds(): null | Array<string> {
    return this.keywordIds;
  }
  getOrganisationIds(): null | Array<string> {
    return this.organisationIds;
  }


}
