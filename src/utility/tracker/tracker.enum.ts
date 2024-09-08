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
export enum TrackerCategory {
  DISTRIBUTION = 'Distribution',
  GENERAL = 'General',
  MAP = 'Map',
  PANEL = 'Panel',
  PROVIDERS = 'Providers',
  SEARCH = 'Search',
  VIDEO = 'Video',
  FILTER = 'Filter',
}

export enum TrackerAction {
  FREE_TEXT_SEARCH = 'Free text search',
  DRAW_BBOX = 'Draw Bounding Box',
  SELECT_COUNTRY = 'Select Country',
  TEMPORAL_INTERVAL = 'Temporal Interval',
  DATA_PROVIDER = 'Data and Service Providers',
  DATA_VISUALIZATION = 'Data Visualization',
  SELECT_DISTRIBUTION = 'Select',
  ADD_TO_FAVOURITE = 'Add to Favourites',
  REMOVE_FROM_FAVOURITE = 'Remove from Favourites',
  SHOW_DETAILS = 'Show Details',
  OPEN_DOWNLOAD = 'Open Download',
  DOWNLOAD = 'Download',
  COPY_URL = 'Copy URL',
  APPLY_PARAMETERS = 'Apply Parameters',
  CONTACT_US = 'Contact us',
  OPEN_DOCUMENTATION = 'Open Documentation',
  EXPAND_PARAMETERS = 'Expand filter parameters',
  SELECT_DOMAIN = 'Select Domain',
  BASEMAP = 'Basemap',
  GUIDE_TOUR = 'Guide Tour',
  FEEDBACK = 'Feedback',
  LOGIN = 'Login',
  OPEN = 'Open',
  PLAY = 'Play',
  ADD_CATEGORY = 'Add Category',
  REMOVE_CATEGORY = 'Remove Category',
  CITATIONS = 'Citations',
}
