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
export interface DomainInfo {
  id: string;
  title: string;
  code: string;
  linkUrl: string;
  imgUrl: string;
  domain: boolean;
  color: string;
  lcolor: string;
}
export const domainLinks: DomainInfo[] = [
  {
    id: '0',
    title: 'All data and services',
    code: 'ALL',
    linkUrl: '',
    imgUrl: 'assets/img/see_all.png',
    domain: false,
    color: '#fff',
    lcolor: '#fff'
  },
  {
    id: '1',
    title: 'Seismology',
    code: 'SEI',
    linkUrl: 'https://www.epos-eu.org/tcs/seismology',
    imgUrl: 'assets/img/logo/SEISM_logo.png',
    domain: true,
    color: '#476f57',
    lcolor: '#dce0de',
  }, {
    id: '2',
    title: 'Near Fault Observatories',
    code: 'NFO',
    linkUrl: 'https://www.epos-eu.org/tcs/near-fault-observatories',
    imgUrl: 'assets/img/logo/NFO_logo.png',
    domain: true,
    color: '#5e3160',
    lcolor: '#ddd8dd',
  }, {
    id: '3',
    title: 'GNSS Data and Products',
    code: 'GNSS',
    linkUrl: 'https://www.epos-eu.org/tcs/gnss-data-and-products',
    imgUrl: 'assets/img/logo/GNSS_logo.png',
    domain: true,
    color: '#941d7f',
    lcolor: '#dfddde',
  }, {
    id: '4',
    title: 'Volcano Observations',
    code: 'VO',
    linkUrl: 'https://www.epos-eu.org/tcs/volcano-observations',
    imgUrl: 'assets/img/logo/VOLCANO_logo.png',
    domain: true,
    color: '#e70802',
    lcolor: '#e6e1e1',
  }, {
    id: '5',
    title: 'Satellite Data',
    code: 'SAT',
    linkUrl: 'https://www.epos-eu.org/tcs/satellite-data',
    imgUrl: 'assets/img/logo/SATELLITE_logo.png',
    domain: true,
    color: '#02adb2',
    lcolor: '#dbe1e1',
  },
  {
    id: '6',
    title: 'Geomagnetic Observations',
    code: 'GEO',
    linkUrl: 'https://www.epos-eu.org/tcs/geomagnetic-observations',
    imgUrl: 'assets/img/logo/GEOMAG_logo.png',
    domain: true,
    color: '#2e3486',
    lcolor: '#dddddf',
  }, {
    id: '7',
    title: 'Anthropogenic Hazards',
    code: 'ANT',
    linkUrl: 'https://www.epos-eu.org/tcs/anthropogenic-hazards',
    imgUrl: 'assets/img/logo/ANTHROPO_logo.png',
    domain: true,
    color: '#06a8e2',
    lcolor: '#e1e4e6',
  }, {
    id: '8',
    title: 'Geological Information and Modeling',
    code: 'GIM',
    linkUrl: 'https://www.epos-eu.org/tcs/geological-information-and-modeling',
    imgUrl: 'assets/img/logo/MODELING_logo.png',
    domain: true,
    color: '#fe4b3a',
    lcolor: '#edeae9',
  }, {
    id: '9',
    title: 'Multi-scale Laboratories',
    code: 'MSL',
    linkUrl: 'https://www.epos-eu.org/tcs/multi-scale-laboratories',
    imgUrl: 'assets/img/logo/LABS_logo.png',
    domain: true,
    color: '#00aa65',
    lcolor: '#dae0de',
  }, {
    id: '10',
    title: 'Tsunami',
    code: 'TSU',
    linkUrl: 'https://www.epos-eu.org/tcs/tsunami',
    imgUrl: 'assets/img/logo/TSU_logo.png',
    domain: true,
    color: '#6f9ea8',
    lcolor: '#e9e9ea',
  },
  {
    id: '100',
    title: 'Favourites',
    code: 'FAV',
    linkUrl: '',
    imgUrl: 'assets/img/favourites.png',
    domain: false,
    color: '#fff',
    lcolor: '#fff',
  },
];
