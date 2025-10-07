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
  // Dialog Check Switching Between Items
  LS_SWITCH_DISTRIBUTION_ITEM_CHECK = 'switchDistributionItemCheck',
  // Dialog Check Metadata Status ("don't show again")
  LS_METADATA_STATUS_MODE = 'metaDataStatusCheck',
  // Metadata Preview Mode active or not
  LS_METADATA_PREVIEW_MODE = 'metadataPreviewMode',
  // Metadata Preview Mode selected statuses ('published', 'draft'...)
  LS_METADATA_PREVIEW_SELECTED_STATUSES = 'metadataPreviewSelectedStatuses',
  LS_CONFIGURABLES = 'configurables',
  LS_TOUR_ACTIVE = 'tourActive',
  LS_MAP_CRS = 'mapCrs',
  LS_MAP_ZOOM = 'mapZoom',
  LS_MAP_POSITION = 'mapPosition',
  LS_RIGHT_TOP_SIDENAV = 'rightTopSidenav',
  LS_RIGHT_BOTTOM_SIDENAV = 'rightBottomSidenav',
  LS_LEFT_TOP_SIDENAV = 'leftTopSidenav',
  LS_MAIN_FILTER_EXPANDED = 'mainFilterExpanded',
  LS_BASEMAP = 'baseMap',
  LS_BASEMAP_ARTIC_POLAR = 'baseMapArticPolar',
  LS_LAYERS_ORDER = 'layersOrder',
  LS_LAYERS_ORDER_ARTIC_POLAR = 'layersOrderArticPolar',
  LS_LAST_DETAIL_DIALOG_ID = 'lastDetailDialogId',
  LS_TS_POPUP_LAYER_ID = 'timeSeriesPopupLayerId',
  LS_BBOX_STYLE = 'bboxStyle',
  LS_TOGGLE_ON_MAP = 'dataSearchToggleOnMap',
  LS_TABLE_DIALOG_OPENED = 'tablePanelDialogOpened',
  LS_GRAPH_DIALOG_OPENED = 'graphPanelDialogOpened',
  LS_CONF_FROM_SHARE = 'configurationFromShare',
  LS_GUIDE_TOUR_SNACKBAR_CHECK = 'guideTourSnackbarCheck',
  LS_OVERLAY_ARCTIC_LAYERS_VISIBILITY = 'overlayArcticLayersVisibility',
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

  /** Registry */
  LS_DOMAIN_OPEN_REG = 'domainOpenReg',
  LS_DOMAIN_REG = 'domainMIReg',
  LS_REGISTRY_SIDENAV = 'registrySidenav',
  LS_DATA_SEARCH_KEYWORDS_REG = 'dataSearchKeywordsReg',
  LS_DATA_SEARCH_BOUNDS_REG = 'dataSearchBoundsReg',
  LS_DATA_SEARCH_GEOLOCATION_REG = 'dataSearchGeolocationReg',
  LS_DATA_DISCOVER_RESPONSE_REG = 'dataDiscoverResponseReg',
  LS_DATA_SEARCH_CONFIGURABLES_REG = 'dataSearchConfigurablesReg',
  LS_DATA_SEARCH_FACET_LEAF_ITEMS_REG = 'dataSearchFacetLeafItemsReg',
  LS_DATA_SEARCH_FACILITY_TYPE_REG = 'dataSearchFacilityTypeReg',
  LS_DATA_SEARCH_EQUIPMENT_TYPE_REG = 'dataSearchEquipmentTypeReg',

  /** Analysis */
  LS_ANALYSIS_SIDENAV = 'analysisSidenav',
}
