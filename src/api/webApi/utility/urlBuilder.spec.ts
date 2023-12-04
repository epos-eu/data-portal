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
import { } from 'jasmine';
import { SimpleUrlBuilder } from 'api/webApi/utility/urlBuilder';

describe('test UrlBulder', () => {

  it('test UrlBulder with simple params', () => {
    const ub = SimpleUrlBuilder.makeUrlBulilderWithDefaultSeparators('foo');
    expect(ub.build()).toBe('foo');

    ub.addPathElements('bar');
    expect(ub.build()).toBe('foo/bar');

    ub.addParameter('kkk', 'vvv');
    expect(ub.build()).toBe('foo/bar?kkk=vvv');

    ub.addParameter('xxx', 'yyy');
    expect(ub.build()).toBe('foo/bar?kkk=vvv&xxx=yyy');
  });




  it('test UrlBulder with trimmed params', () => {
    const ub = SimpleUrlBuilder.makeUrlBulilderWithDefaultSeparators('//foo///');
    expect(ub.build()).toBe('foo');

    ub.addPathElements('//bar///');
    expect(ub.build()).toBe('foo/bar');
  });

});
