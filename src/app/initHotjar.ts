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
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/**
 * Initialise the [Hotjar]{@link https://www.hotjar.com/} user feedback plugin.
 */
export const initHotjarFunc = (): void => {

  (function(h, o, t, j) {
    h['hj'] = h['hj'] || function() { (h['hj'].q = h['hj'].q || []).push(arguments); };
    h['_hjSettings'] = { hjid: 1430946, hjsv: 6 };
    const a = o.getElementsByTagName('head')[0];
    const r = o.createElement('script');
    r.async = !!1;
    r.src = t + h['_hjSettings'].hjid + j + h['_hjSettings'].hjsv;
    a.appendChild(r);
  })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
};
