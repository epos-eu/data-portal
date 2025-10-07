
# GUI: Module Design  
## Introduction  
### Purpose  
The intended audience of this document are developers that intend to contribute to the EPOS GUI or need to know details in order to build and deploy the GUI.

The aim of the document is to capture enough detail as to aid developers and maintainers in their understanding of the structure and principles employed during the development of the GUI.

### Scope  
The scope of the document is limited to the EPOS GUI and it's interactions with the core EPOS ICS-C system via the EPOS Web API (link required).

![](images/scope.png)

<sub>Created with: [LiveUML](https://liveuml.com) source [file](files/scope.txt)</sub>
### References  
| Reference  | Document                                                     |
| ---------- | ------------------------------------------------------------ |
| ICS-C-Arch | ICS-C Architecture<br>https://epos-ci.brgm.fr/epos/devops-documentation/blob/master/ics-c_architecture.md |
| WebAPI     | Web API project<br>https://epos-ci.brgm.fr/epos/WebApi       |
|            |                                                              |

## Module Description  
### Module Overview  
EPOS is a system for the discovery, visualisation and ultimately the process of earth-science data. The GUI module represents the primary interface end-users will use to interact with the system.

### Significant Requirements  
The requirements for the GUI have undergone significant, repeated and arbitrary change throughout the implementation phase of the EPOS project. The requirements below represent high-level behaviours that most influence the design of the GUI module and were required by the end of the implementation phase (September 2019).

#### API

The user interface is to be considered stateless, all data and actions requiring persistence will be via the EPOS Web API. The EPOS Web API uses the HTTP as a method of communication. 

#### Discovery

##### Search

Allow the user to search for resources held within the metadata catalogue of the ICS-C system, the user should be able to populate fields that will enable the search results to be filtered.

Required filters:
* spatio coordinates
* temporal coordinates
* organisation
* keywords
* free text

##### Explore

Allow the user to 'explore' the resources (resulting from the search) either individually or conjunction with one-another. the primary method of exploring results is via a multi-layered map visualisation (other visualisation s to be added later).

* Map visualisation, supports a variety of layer types, legends, layer controls. CRS: WGS84 / EPSG4326
* Time Series visualisation (out of scope for September 2019)
* Data Table visualisation (out of scope for September 2019)

##### Reconfigure

Allow the user to see and potentially reconfigure the 'configuration' used to access the data of a resource.

##### Download

Allow the user to download a copy of the data obtained by 'executing' the 'configuration' associated with a resource.

##### Persist

When the user discovers a resource allow them to persist it for future use.

#### Workspace

The requirements for the workspace have been largely descoped for September 2019, it will still be present and offer many of the same visualisation and reconfiguration features as the discovery page, except it there is no search, the only resources that are available are those that have been added to the currently selected 'workspace'. Resources are added to a workspace via the **persist** behaviour of the **discover** phase.

#### Processing

Not required for September 2019

### Design Principles  

#### SPA

After extensive analysis it was decided to create the EPOS GUI as a Single Page Application (SPA) using the  [Angular](https://angular.io/) web framework and the associated, application scale, javascript superset language [Typescript](https://www.typescriptlang.org/).  

#### Stateless

The SPA is essentially stateless, being stateless it can be served by any webserver (inside or outside of docker). All data and actions requiring persistence will be via the EPOS HTTP Web API (the API is beyond the scope of this document).

#### Angular Services

<span style="color:red">TBD</span>

#### Composition over Inheritance

> Composition over inheritance (or composite reuse principle) in object-oriented programming (OOP) is the principle that classes should achieve polymorphic behaviour and code reuse by their composition (by containing instances of other classes that implement the desired functionality) rather than inheritance from a base or parent class.

<sub>https://en.wikipedia.org/wiki/Composition_over_inheritance</sub>

##### API Functional Areas

The EPOS Web API offers a number of area of functionality, for example: search, workspaces etc. Within the GUI code the Web API is modelled a modelled as separate classes that correspond to these functional areas, allowing a composite representation of the Web API to be constructed from them. This allows for functional areas to maintain separation, thereby easing maintenance, refactoring, testing etc.

##### API Payloads

Many of the payloads returned from the Web API a representation of the same conceptual object, just with different degrees of granularity. For example a call to the API may return a list of workspaces, another call may return the details of a specific workspace, the distinction between these two representations is that  first is just a summary where as the second is the details - but the details also include everything from the summary.

![composition](images/composition.png)

<sub>Created with: [LiveUML](https://liveuml.com) source [file](files/composition.txt)</sub>

### Quality Attributes  
_<span style="color:green">Explanatory notes: the qualities that have been prioritised, for example they could be: performance, stability, usability, maintainability, this list goes on...</span>_

### Constraints  
_<span style="color:green">Explanatory notes: restrictions placed on the architecture/design, should any of the constraints change in the future the architecture/design may need to be revisited</span>_

### Assumptions  
_<span style="color:green">Explanatory notes: the circumstances under which the architecture/design is to be considered valid, should any assumptions be proven false in the future the architecture/design may need to be revisited</span>_

 

CRS: WGS84 / EPSG4326

Everything from the API

User will not want to search when on workspace or other non-discover pages

The API will inform the GUI of all the data formats available for a resource in such a way that the GUI can determine all appropriate behaviours to exhibit for that data.

 

### Technologies  
_<span style="color:green">Explanatory notes: the core technology choices and the reason why the have been selected, what is also useful to capture is why alternatives were not selected</span>_

 

Languages: Typescript, Javascript, CSS, HTML

Framework: Angular

Material

Leaflet

Node NPM

GitLab

Docker

k8

html

css

js

 

## Module Interface  
### API Overview  
Given that the GUI module is a user interface it does not have a programmatic public API.

### API Definition  
Not applicable

### Storage Mechanisms and Network Protocols  
_<span style="color:green">Explanatory notes: summarise what data/messages in consumed or exposed by the PUBLIC API and what protocols or storages mechanisms used</span>_

#### Feature: API  
#### Feature: Authentication  
#### Feature: Search  
#### Feature: Data Model  
#### Feature: Metadata  
#### Feature: Workspaces  
#### Feature: Configurations  
#### Feature: Service Execution  
#### Feature: Console Logging  
#### Feature: Supported Payloads  
#### Feature: Visualisations  
#### Feature: etc.  
### Error Handling  
_<span style="color:green">Explanatory notes: provide information on how errors manifest themselves through the PUBLIC API</span>_

### Logging  
_<span style="color:green">Explanatory notes: provide information on how logging is carried out and can be accessed/aggregated</span>_

## Module Design  
_<span style="color:green">Explanatory notes: captures the core concepts, abstractions, entities, sub-components needed to fulfil the purpose and API of the module, please note 'less is more' it should include enough information to useful, but not som much detail that it quickly becomes out-dated</span>_

### Overview  
### Logical  
_<span style="color:green">Explanatory notes: captures the logical design of the module features - how it's implemented, i.e. classes and interfaces</span>_

... it is fair to say that due to the constant changing of requirements, the codebase has evolved into its current state, rather than being designed this way...

#### Feature: API
This handles all API module interactions that the GUI needs to perform.  Its workflow can be summarised as:
- accept criteria from GUI sub-modules
- form the correct request, adding authentication information as required
- perform the required http request to the API module
- validate the respose
- display error notification (if required)
- process response data into internal objects
- return the appropriate response to the calling GUI sub-module
#### Feature: Authentication
Users who log in are able to access extended GUI features, including Workspaces.  They may also see otherwise inaccessible search results.
#### Feature: Search  
This feature uses the following user input parameters to perform a search of distributions:
- spatial area
- temporal range
- free-text
- keywords (from a pre-defined list)
- organisations (from a pre-defined list)

The GUI takes the selected parameters, calls the API search endpoint, then displays the returned results in the hierarchy structure that is returned.

#### Feature: Data Model
The data model is a single point of truth for various data items within the GUI module.  When a model item is updated, anything that depends that item s notified of the change.
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
### Dynamic  
_<span style="color:green">Explanatory notes: captures the dynamic interactions and communication between, especially if there is a concurrency aspect</span>_

#### Feature: API  
#### Feature: Authentication  
#### Feature: Search  
#### Feature: Data Model  
#### Feature: Metadata  
#### Feature: Workspaces  
#### Feature: Configurations  
#### Feature: Service Execution  
#### Feature: Console Logging  
#### Feature: Supported Payloads  
#### Feature: Visualisations  
#### Feature: etc.  
### Storage Mechanisms and Network Protocols  
_<span style="color:green">Explanatory notes: describe what data in consumed by the module and produced by the module, including internal and external formats (reference other pages/sites as required for details)</span>_

#### Feature: API  
#### Feature: Authentication  
#### Feature: Search  
#### Feature: Data Model  
#### Feature: Metadata  
#### Feature: Workspaces  
#### Feature: Configurations  
#### Feature: Service Execution  
#### Feature: Console Logging  
#### Feature: Supported Payloads  
#### Feature: Visualisations  
#### Feature: etc.  
### Code  
_<span style="color:green">Explanatory notes: where the code is stored (link to GitLab repo), the structure of the repo (where functional code is, where tests are, location of configuration files, where 'other' files are located, etc.)</span>_

## Testing  
_<span style="color:green">Explanatory notes: describe the how the module has been designed with testing in mind, the testing strategy: unit/integration etc.</span>_

## Deployment  
_<span style="color:green">Explanatory notes: describe how the module is built, packaged and is incorporated into the system</span>_

------
