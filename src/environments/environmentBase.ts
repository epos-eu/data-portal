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
/**
 * This is the base environment configuration containing default values and all environments
 * should inherit from it.
 *
 * Values that are marked as "populated during pipeline" have their values overwritten during
 * the pipeline build stage.
 */
export const environmentBase = {
  url: 'www.ics-c.epos-eu.org',
  production: false,
  version: (require('../../package.json') as Record<string, unknown>).version,
  githash: 'GITHASH', // populated during pipeline
  commitDate: 'COMMIT_DATE', // populated during pipeline
  gitlabApiFeedbackProjectUrl: 'GITLAB_API_FEEDBACK_PROJECT_URL', // populated during pipeline
  gitlabApiFeedbackToken: 'GITLAB_API_FEEDBACK_TOKEN', // populated during pipeline
  matomoLiveEndpoint: 'MATOMO_PROD_URL',
  matomoLivePort: 'MATOMO_PROD_PORT',
  matomoNotLiveEndpoint: 'MATOMO_TEST_URL',
  matomoNotLivePort: 'MATOMO_TEST_PORT',
  minWidth: 900,
  homepage: 'https://www.epos-eu.org',
  aboutpage: 'https://www.epos-eu.org/dataportal',
  termsAndConditions: 'https://www.epos-eu.org/sites/default/files/Terms_and_Conditions.pdf',
  videos: [
    {
      title: 'Introduction to EPOS',
      url: 'https://www.youtube-nocookie.com/embed/knEfMkHigG4'
    },
    {
      title: 'Data search',
      url: 'https://www.youtube-nocookie.com/embed/yc97CRe-gdQ'
    },
    {
      title: 'Configuration and visualization of services',
      url: 'https://www.youtube-nocookie.com/embed/vZKUm9F-M-k'
    }
  ],
  modules: {
    data: true, // turns the data section on and off
  },
};
