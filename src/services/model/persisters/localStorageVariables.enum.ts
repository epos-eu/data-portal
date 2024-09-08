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
export enum LocalStorageVariables {
  STORAGE_PREFIX = 'EPOS_',
  LS_VERSION = 'version',
  LS_INFO_CHECK = 'infoCheck',
  LS_CONFIGURABLES = 'configurables',
  LS_TOUR_ACTIVE = 'tourActive',
  LS_MAP_ZOOM = 'mapZoom',
  LS_MAP_POSITION = 'mapPosition',
  LS_RIGHT_TOP_SIDENAV = 'rightTopSidenav',
  LS_RIGHT_BOTTOM_SIDENAV = 'rightBottomSidenav',
  LS_LEFT_TOP_SIDENAV = 'leftTopSidenav',
  LS_MAIN_FILTER_EXPANDED = 'mainFilterExpanded',
  LS_BASEMAP = 'baseMap',
  LS_LAYERS_ORDER = 'layersOrder',
  LS_LAST_DETAIL_DIALOG_ID = 'lastDetailDialogId',
  LS_TS_POPUP_LAYER_ID = 'timeSeriesPopupLayerId',
  LS_BBOX_STYLE = 'bboxStyle',
  LS_TOGGLE_ON_MAP = 'dataSearchToggleOnMap',
  LS_TABLE_DIALOG_OPENED = 'tablePanelDialogOpened',
  LS_GRAPH_DIALOG_OPENED = 'graphPanelDialogOpened',
  LS_CONF_FROM_SHARE = 'configurationFromShare',

  /** Data */
  LS_DOMAIN_OPEN = 'domainOpen',
  LS_DOMAIN = 'domainMI',
  LS_DATA_SEARCH_GEOLOCATION = 'dataSearchGeolocation',
  LS_DATA_DISCOVER_RESPONSE = 'dataDiscoverResponse',
  LS_DATA_SEARCH_CONFIGURABLES = 'dataSearchConfigurables',
  LS_DATA_SEARCH_BOUNDS = 'dataSearchBounds',
  LS_DATA_SEARCH_TEMPORAL_RANGE = 'dataSearchTemporalRange',
  LS_DATA_SEARCH_KEYWORDS = 'dataSearchKeywords',
  LS_DATA_SEARCH_FACET_LEAF_ITEMS = 'dataSearchFacetLeafItems',
  LS_DATA_SEARCH_TYPE_DATA = 'dataSearchTypeData',
  LS_LAST_SELECTED_ID = 'lastSelectedId',
  LS_DATA_TRACES_SELECTED = 'dataTracesSelected',
}
