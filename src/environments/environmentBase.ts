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
  production: false,
  version: (require('../../package.json') as Record<string, unknown>).version,
  githash: 'GITHASH', // populated during pipeline
  commitDate: 'COMMIT_DATE', // populated during pipeline
  gitlabApiFeedbackProjectUrl: 'GITLAB_API_FEEDBACK_PROJECT_URL', // populated during pipeline
  gitlabApiFeedbackToken: 'GITLAB_API_FEEDBACK_TOKEN', // populated during pipeline
  eposSiteApiRestUrl: 'EPOS_SITE_API_REST_URL', // populated during pipeline
  eposSiteApiRestKey: 'EPOS_SITE_API_REST_KEY', // populated during pipeline
  esriApiKey: 'EPOS_ESRI_API_KEY', // populated during pipeline
  shareSalt: 'EPOS_SHARE_SALT', // populated during pipeline
  matomoEndpoint: '', // populated during pipeline on env files
  matomoSiteId: '', // populated during pipeline on env files
  matomoTrackEvent: true,
  minWidth: 900,
  homepage: 'https://www.epos-eu.org',
  aboutpage: 'https://www.epos-eu.org/dataportal',
  termsAndConditions: 'https://www.epos-eu.org/sites/default/files/Terms_and_Conditions.pdf',
  vocabularyEndpoint: 'https://registry.epos-eu.org/ncl/system/query',
  videos: [
    {
      title: 'Introduction to EPOS',
      url: 'https://www.youtube-nocookie.com/embed/A5-WiWeG5-4'
    },
    {
      title: 'Data search',
      url: 'https://www.youtube-nocookie.com/embed/qpQuBlZBT7Y'
    },
    {
      title: 'Configuration and visualization of services',
      url: 'https://www.youtube-nocookie.com/embed/p4Sq7s40M0I'
    }
  ],
  modules: {
    data: true, // turns the data section on and off
  },
  mainMenu: [{
    name: 'About',
    children: [
      {
        name: 'About Data Portal',
        url: 'https://www.epos-eu.org/dataportal',
        icon: 'info'
      },
      {
        name: 'EPOS API ',
        url: window.location.href + '/api/v1/ui/',
        icon: 'cloud'
      },
      {
        name: 'Open Source project',
        url: 'https://epos-eu.github.io/epos-open-source/',
        icon: 'shopping_basket'
      },
      {
        name: 'Citation Guide',
        url: 'https://www.epos-eu.org/sites/default/files/2024-03/01_EPOS%20DDSS%20Citation%20Guide%20v3.0_11Mar2024_270324_BA.pdf',
        icon: 'speaker_notes'
      },
      {
        name: 'Terms and Conditions ',
        url: 'https://www.epos-eu.org/sites/default/files/Terms_and_Conditions.pdf',
        icon: 'insert_drive_file'
      }
    ],
  },
  {
    name: 'Feedback',
    action: 'feedback',
    icon: 'feedback',
  },
  {
    name: 'Guided Tour',
    action: 'startGuidedTour',
    icon: 'live_help',
  },
  {
    name: 'Video Guides',
    action: 'videoguide',
    icon: 'movie',
  }
  ]
};
