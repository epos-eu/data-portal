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
/* eslint-disable one-var */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-underscore-dangle */
import { LiveDeploymentService } from 'services/liveDeployment.service';
import { environment } from 'environments/environment';

/**
 * Initialise the [Matomo]{@link https://matomo.org/} analytics plugin.
 */
export const initMatomoFunc = (liveDeploymentService: LiveDeploymentService): void => {
  const live = {
    name: 'LIVE',
    url: environment.matomoLiveEndpoint,
    code: environment.matomoLivePort,
  };
  const notLive = {
    name: 'NOT-LIVE',
    url: environment.matomoNotLiveEndpoint,
    code: environment.matomoNotLivePort,
  };

  const site = (liveDeploymentService.getIsLiveDeployment())
    ? live
    : notLive;

  console.log('stats config', site);

  const _paq = window['_paq'] || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  // tslint:disable-next-line: only-arrow-functions
  (() => {
    const u = site.url;
    _paq.push(['setTrackerUrl', u + 'piwik.php']);
    _paq.push(['setSiteId', site.code]);
    // tslint:disable-next-line: one-variable-per-declaration
    const d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
    g.type = 'text/javascript'; g.async = true; g.defer = true; g.src = u + 'piwik.js'; s.parentNode!.insertBefore(g, s);
  })();

  window['_paq'] = _paq; // set back as global
};
