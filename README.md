_THIS DOCUMENT REQUIRES UPDATING/REWORKING INTO MULTIPLE DOCS_

# EPOS-GUI

##### A data discovery, visualization web platform.

### Explore the latest live master branch:

https://ics-c.epos-ip.org/testing/epos-epos-gui/master/

### Deployed versions:

http://ics-c.epos-ip.org/

### Explore the Docker Image

Install Docker and run the epos-gui image:  
https://www.docker.com/  
https://hub.docker.com/r/wshelley/epos-gui/

### The general flow of the application:

- Discover (search)
- Visualise (spatial, temporal, etc)

##### Discover:

Using the filters and map we can find People, Organisations, Software, Services and Data in a variety of Domains across Europe.

##### Spatial Visualisation:

By clicking on the ‘Spatial Visualisation’ page you can see a quick overview of all the datasets that have been added to the map. This will provide some basic GIS functionality to help explore and compare the data.

##### Temporal Visualisation:

Equally by clicking on the ‘Temporal Visualisation’ page you can see a quick overview of all the datasets that have been added to time series graphs. Eventually there will be some basic filters and tools to help explore this kind of data too.

But if more complex analysis is required you can download the raw data or connect directly to the web services via the metadata and service links provided.

##### Other Bits:

When we have completely the platform you will be able to login from a variety of credential providers (click guest login at top right, then sign in)

##### There is a ‘Feedback’ button on the top bar of the website – please click on there and let us know what you think!

##### Code:

Languages: Typescript, Javascript, CSS, HTML

Framework: Angular

Location: epos-gui/src/app/

Dependencies: epos-gui/src/assets/

NPM Dependencies: epos-gui/package.json & epos-gui/node_modules/

<br/>

# Setting up the project for development

Install node.js: https://nodejs.org/en/

### Install:

```
git clone GIT_PROJECT_URL
cd epos-gui
npm install -g @angular/cli
npm install
```

# IDE

The suggested IDE for development id VS code: https://code.visualstudio.com/

Some vs code plugins that will make life easier:

- ESLint
- Angular Language Service

### Running Development Version:

```
npm start
```

Test on web browser on host machine: http://localhost:4200

Changes are detected by the angular-cli and the site is recompiled and auto refreshed.

### Testing Development Version:

```
npm test
```

This runs:

1. Linting of entire source code (style and general code analysis)
2. Unit Tests where provided by each source file (functions return expected values/behaviours)
3. End-to-End testing of the application (application runs and works as expected to the agreed performance levels)

#### End to End (e2e) tests

To run interactive (opens browser etc.) cypress e2e tests locally use:
`ng e2e`

To run them through from the command line use:
`npm run e2e-run`

### Switching Data Source Provider From Local Mock JSON to Live API:

Within 'epos-gui/src/app/app.module.ts' change the providers[] from 'mockApiServiceProvider' to 'devApiServiceProvider'

(Mock API has been removed, it served its purpose during early implementation stages, became a hinderance to productivity)

### Switching Data Source Provider From Custom Mock JSON to Realistic Mock JSON:

Within 'epos-gui/src/app/shared/api/mockApi.service.ts' change the call to 'return this.doMockLiveSearch()' as shown below

```
  public doSearch(type: SearchType, searchCriteriaMap: Map<SearchCriteria, any>): Promise<ItemResultList> {
    switch (type) {
      case (SearchType.GENERIC): return this.doMockLiveSearch();
      // case (SearchType.GENERIC): return this.doStationSearch();
    }
  }
```

### Building for Production:

For production docker image building - docker building below.

Alternatively:

```
ng build --prod --extract-css=false
```

Then deploy the epos-gui/dist/ folder on a webserver of your choice.

### Documentation

Compodoc (https://compodoc.app/) is being used to create html documentation from code comments.

They can be generated locally by using the following command.

```
node_modules/.bin/compodoc -p src/tsconfig.doc.json --includes=docs
```

By adding "-s" to the command you can serve the docs locally. By also adding "-w" to the command, it will watch the files and generate and serve the new html documentation as you change the files.

```
node_modules/.bin/compodoc -p src/tsconfig.doc.json --includes=docs -w -s
```

The pipelines are set up to generate and serve these docs, so if you navigate to your deployed branch root, then add "/documentation/index.html" to the the url, you can interact with the documentation for your branch. e.g. for master branch:
https://ics-c.epos-ip.org/testing/epos-epos-gui/master/documentation/
