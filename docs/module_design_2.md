## Features
### Web API
#### Purpose
This handles all API module interactions that the GUI needs to perform.  Its workflow can be summarised as:
- accept criteria from GUI sub-modules
- form the correct request, adding authentication information as required
- perform the required http request to the API module
- validate the response
- display error notification (if required)
- process response data into internal objects
- return the appropriate response to the calling GUI sub-module
#### Implementation
Code location:
- src/api/api.service.ts
- src/api/webApi


### webApi Services
#### Purpose
These services expose globally accessible functions that access the Web API
Refs:
<DOCS>/injectables/SearchService.html
<DOCS>/injectables/DataSearchService.html
<DOCS>/injectables/WorkspaceService.html
<DOCS>/injectables/ExecutionService.html

#### Implementation
Code location:
- src/services/search.service.ts
- src/services/dataSearch.service.ts
- src/services/workspace.service.ts
- src/services/execution.service.ts
  
Functions are separated into functional areas and housed in separate services:
- Search
- Workspace
- Execution 


### data model
#### Purpose
The data model is a single point of truth for various data items within the GUI module.  When a model item is updated, anything that depends on that item is notified of the change.

Refs:
<DOCS>/injectables/Model.html

#### Implementation
Code location:
- src/services/model
  
The model service is composed of modelItems, which are publicly accessible, updatable data objects.  Some model items are custom objects and some use the base ModelItem class, and on all there methods to "get", "set" and "watch" the value, and "trigger" the change notification without updating the value.

If persistance parameters are set, ModelItems are persisted within the the browser's local storage.  This is primarily used within the GUI to ensure that the state of the GUI is not lost when the page is refreshed or the user logs in (which navigates the browser away from the EPOS GUI).

### Authentication API
#### Purpose
Users who log in are able to access extended GUI features, including Workspaces.  They may also see otherwise inaccessible search results.

Communicates with the ICS AAAI service to facilitate authentication of user credentials, manages the user's logged-in status and provides the UI/Web API with any authentication information it requires.

Refs:
<DOCS>/classes/AaaiService.html

#### Implementation
Code location:
- src/api/aaai.service.ts
- src/api/aaai

The code uses a plugin (angular-oauth2-oidc) to handle most of the interactions with the AAAI service.  The aaaiService object provides a global interface that exposes login, logout and user information access to the rest of the GUI.

### Login
#### Purpose
Allows the user to enter login information in order to authenticate.
#### Implementation
Code location:
- src/components/login
- src/components/header (uses login component and displays some user information)
  
The LoginComponent displays the login form to the user and uses the Authentication API to authenticate the user.

### Advanced Search
#### Purpose
This feature uses the following user input parameters to perform a search of resources held within the metadata catalogue of the ICS-C system:
- spatial area
- temporal range
- free-text
- keywords (from a pre-defined list)
- organisations (from a pre-defined list)

The GUI takes the selected parameters, calls the API search endpoint, then sets the results to the data model.
#### Implementation
Code location:
- src/pages/data/search/searchLeftPanel/advancedSearch
- src/pages/data/search/searchLeftPanel/facets
- src/pages/data/components/temporalSpatialControls

The advancedSearch component triggers a search when a user:
- navigates to the search page
- clicks the Advanced Search "Apply" button
- changes the spatial search area
- changes the temporal search range
  
The search is triggered using the webApi (search) service, which sets the result to the data model "dataDiscoverResponse" model item.

The changing of the "dataDiscoverResponse" model item triggers an update to the facets part of the Advanced Search component.  The keywords and organizations facets are updated to display the new list of available facets, with previously selected and expanded items maintaining their state.


### Data Search Results Display
#### Purpose
Displays the results from the webApi search call in the hierarchy structure that is returned.
Allows actions described in "Data Search Result Actions".
#### Implementation
Code location:
- src/pages/data/search/searchLeftPanel/results
- src/pages/data/search/searchLeftPanel/itemsDisplayTable

The results panel uses the ItemDisplayTable component to display, to be consistent with the pinned items panel. 

Like the Advanced Search facets display, the search results display responds to changes on the data model "dataDiscoverResponse" attribute (updated following a search).  When notified of a change in the results the display is refreshed.  This component also watches the search configurables service, and refreshes when that notifies of an update, also.

Upon refresh the search results are retrieved from the data model and the configurables from the search configurables service.  The distribution summary objects (results) are processed into display items, with the associated configurable (or absence of one) providing the display style, "pinned" and "selected" statuses.

Clicking on a display item that is not "pinned" results in the search configurables service creating a new configurable for that item, using default parameter values.  If the display item is "pinned" it requests that the corresponding configurable be selected by the search configurables service.

Actions described in the "Data Search Result Actions" section are available on the display items.


### Pinned (Selected) Items Display
#### Purpose
Displays the items of interest that the user has selected to be "pinned".
Allows actions described in "Data Search Result Actions".
#### Implementation
Code location:
- src/pages/data/search/searchLeftPanel/pinnedItems
- src/pages/data/search/searchLeftPanel/itemsDisplayTable
  
The pinned items panel uses the ItemDisplayTable component to display, to be consistent with the results panel. 

This component watches the search configurables service and refreshes when that notifies of an update.  It processes the configurables into display items,

Clicking on a display item results in a request that the corresponding configurable be selected by the search configurables service.

Actions described in the "Data Search Result Actions" section are available on the display items.


-----PROGRESS--------

### Data Search Result Actions
#### Purpose
Allows the user to pin/unpin distribution summary items, trigger a download, and add configurations to a workspace (if authenticated).
#### Implementation
Code location:
- src/pages/data/search/searchLeftPanel/itemsDisplayTable
- src/pages/data/search/dataSearchConfigurables.service.ts
- src/components/distributionDownloadMenu/distributionDownloadMenu.component.ts
  
Toggling a distribution summary object's "pinned" status updates the search configurables service, which triggers the refresh of the search results display.

If a distribution summary object is downloadable (has formats that are not in a not-downloadable blacklist) the download action is enabled.  On clicking the download icon, the download menu and a list of downloadable formats are displayed.  Selecting a format triggers a download via the webApi (execution) service.

On clicking the "Add to Workspace" icon, a list of the users workspaces is displayed (if authenticated, otherwise a message is displayed).  Selecting a workspace triggers the adding of a configuration (and a workspace item if it doesn't already exist) to the workspace, via the webApi (workspace) service.  This configuration uses the parameter values set in the configurable object associated with the distribution summary, if one exists, otherwise the default parameter values from the distributionDetails object are used.

### Configurable
#### Purpose
A configurable is an object that represents a data search result item and its configured parameters.  It is a consistent object that allows generic front end components (like visualisation components) to work with both webApi workspace persisted configurations and locally created data search configurations.

#### Implementation
Code location:
- src/utility/configurables/dataConfigurable.abstract.ts
- src/utility/configurables/dataConfigurableAction.ts
- src/utility/styler/stylable.interface.ts

A DataConfigurable is a base class that is intended to be extended to specialise its use.

A DataConfigurable maintains a reference to the distribution that it relates to.

A DataConfigurable allows the adding of actions that are available on it, relating to the current parameter values (like 'Reset', 'Apply' etc). 

It keeps a copy of the parameter values that it was created with and a copy of the current parameter values, as well as flags indicating whether the current values are have changed, are valid, and are the same as the defaults.

In order to accommodate the linking of spatial and temporal parameter values to page-wide controls, there are spatial and temporal linking flags.  These facilitate the implementation of parameter updates where these spatial and temporal parameters need to be treated as special cases.

A DataConfigurable implements the Stylable interface.  This means that, for display purposes, it can be assigned a style object that allows visual representations to distinguish themselves from each other, currently by colour.

Any code that uses a Configurable object can set a reload function.  This function will be called by the Configurable when changes made to parameters need to be applied in the display.

There is a flag indicating whether spatial coverage should be shown for this configurable.


### Data Search Configurable
#### Purpose
A configurable for the data search page that contains a data search result item and parameter values.

#### Implementation
Code location:
- src/pages/data/search/dataConfigurableDataSearch.ts

Data Search Configurable inherits all of the base Configurable features and additionally has "pinned" and "selected" statuses to help with Data Search Results Display interactions.

The following actions, how they are enabled and applied, are added:
- Apply
- Undo
- Copy URL
- Set To Defaults

### Workspace Configuration Configurable
#### Purpose
A configurable for the workspace page that contains a workspace configuration object (which references a data search result item and configured parameters)

#### Implementation
Code location:
- src/utility/configurables/dataConfigurableWsItem.ts


### Data Search Configurable Service
#### Purpose
To manage Data Search Configurables as they are used on the data search page.  
#### Implementation
Code location:
- src/pages/data/search/dataSearchConfigurables.service.ts

This service:
- Creates data search configurables
- Maintains references to created data search configurables
- Supplies sets of data search configurables to data search page sub-components
- Assigns "pinned" and "selected" statuses to data search configurables
- Ensures that only one data search configurables has the "selected" status
- Removes any data search configurables that are neither "pinned" or "selected"
- Assigns Style objects to data search configurables
- Updates data search configurables when page-wide spatial or temporal parameter values change
- Sets the data search configurables to the data model when anything changes, so that they are persisted after a page reload.  It also retrieves them from the model in its constructor, so that it loads in persisted configurables on initialisation.


### Spatial Bounds control
#### Purpose
Provides a user interface allowing the setting of spatial bounds.
#### Implementation
Code location:
- src/pages/data/components/temporalSpatialControls/spatialControls


### Temporal Range control
#### Purpose
Provides a user interface allowing the setting of temporal bounds.
#### Implementation
Code location:
- src/pages/data/components/temporalSpatialControls/temporalControls


### Data Search Component
#### Purpose
This component is a wrapper for the data search page content. 
#### Implementation
Code location:
- src/pages/data/search/dataSearch.component.ts

This component defines the data search page.  It is the Angular component that is navigated to via the application router when the browser navigates to data/search.

It is a wrapper for its constituent components and a mechanism by which they communicate with the data model and each other.  It displays:
- a Spatial control, and facilitates setting page spatial bounds info to the data model.
- a Temporal control, and facilitates setting page temporal range info to the data model.
- a Data Visualization component, used to display pinned/selected configurables.
- a Bottom Panel component, for interactions with the currently selected data search configurable.
- the Advanced Search component.
- the Data Search Results.

This component decides which of the data search configurables need to be sent to the Visualization (all configurables) and Bottom Panel components (just the configurable that is selected).

This component also sets a reload function of each configurable that it uses, allowing the configurable to trigger a display refresh if the configurable updates itself.


### Data Visualization
#### Purpose
This component is a wrapper for the specific visualization type components (e.g. map, graph, data etc), which also enables navigation between them.
#### Implementation
Code location:
- src/pages/data/components/vizualisation

This is a wrapper for the specific visualization components and a mechanism by which they communicate with the data model and other functionality.  It supplies the visualization components with configurables that they themselves decide whether they can use or not.


### Data Visualization Map
#### Purpose
To display spatial representations of the selected and configured search results as well standard useful GIS type functionality.
#### Implementation
Code location:
- src/pages/data/components/vizualisation/map/dataVisualizationMap.component.ts
- src/utility/maplayers

This component takes the list of configurables that is passed in and displays the ones that it is able to on the map, along with any spatial coverage that has been requested.  The generation of the map layers is implemented by specialist code, documented in the "Map Layers" section.

It was decided that an angular map would be a very reuseable component, so the main map functionality is implemented in an external project and imported into the EPOS GUI.  The map component itself sits on top of the open source Leaflet map plugin and utilises other open-source plugins for non-default functionality (marker clustering, drawing bounding box, etc).


### Map Layers
#### Purpose
Generates map layers to be displayed on a map.
#### Implementation
Code location:
- src/utility/maplayers

This component takes a configurable and creates an appropriate map layer representation, currently of wms or geoJSON type.  This code also has functionality to implement the extensions to standard geoJSON that we have defined in EPOS, to allow the inclusion of image overlays and map feature styling.

### Bottom Panel
#### Purpose
This component is a wrapper for components that appear in this area and allows navigation between them.  It also provides navigation between the configurables that are displayed one at a time in the Configuration panel.

#### Implementation
Code location:
- src/pages/data/components/bottomPanel
It is a wrapper for displaying:
- the Data Details component
- the Data Configuration component
- the Console component

### Configuration Component
#### Purpose
Allows a user to manipulate a configuration and the parameters that it contains, therefore changing the characteristics of selections that are visualised etc.
#### Implementation
Code location:
- src/pages/data/components/configuration
This component displays an appropriate interface to edit each of the values of parameters that are defined on a configurable (from a distribution object).  If a full set of parameters exist that can be identified as defining a geographical area, these parameters are grouped and the Spatial Bounds Control is shown instead.  If a full set of parameters exist that can be identified as defining a temporal period, these parameters are grouped and the Temporal Range Control is shown instead.

When used on the Data Search page, it is optional whether spatial and temporal controls are enabled, and therefore whether they override the page-wide controls that also show on this page.

### Details Component
#### Purpose
To display details of the distribution object relating to the selected configurable.
#### Implementation
Code location:
- src/pages/data/components/bottomPanel/dataDetailsTable
Displays details of a distribution object in a table.  Also allows the user to show the coverage area of the distribution and centre the map on this area, if the distribution has geographical 

### Console Component
#### Purpose

#### Implementation
Code location:
- src/pages/data/components/bottomPanel/console



#### Feature: Metadata  
#### Feature: Workspaces  
A workspace is a collection of configured distributions (configurations).  In the GUI, an authenticated user can view and manipulate this collection of configurations in isolation.
#### Feature: Configurations  
Configurations are instances of distributions that also contain configured parameter values.
#### Feature: Service Execution  
#### Feature: Console Logging  
#### Feature: Supported Payloads  
#### Feature: Visualisations  
#### Feature: etc.  
