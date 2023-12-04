/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import moment from 'moment-es6';
import { InformationsService } from 'services/informationsService.service';
import { PoliciesService } from 'services/policiesService.service';

// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
// declare namespace Cypress {
//   interface Chainable<Subject = any> {
//     customCommand(param: any): typeof customCommand;
//   }
// }
//
// function customCommand(param: any): void {
//   console.warn(param);
// }
//
// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
//



// *********** TYPE DECLARATIONS IN commands.d.ts file ***************/

// // -- Accept policies
Cypress.Commands.add('policyAccept', () => {
  PoliciesService.storeConsentsTimestamp(moment());
  PoliciesService.storeCookieConsent(true);
});

// // -- Disable Welcome Popup
Cypress.Commands.add('welcomePopup', () => {
  InformationsService.storeInfoCheck(true);
});

Cypress.Commands.add('openService', (tcs, name) => {
  cy.get(tcs).click();
  cy.wait(2000);
  cy.contains(name).click();
  cy.wait(10000);
});

// Cypress.Commands.add('getLocalStorage', (key) => {
//   return cy.window().then((window) => window.localStorage.getItem(key));
// });

// Cypress.Commands.add('setLocalStorage', (key, value) => {
//   cy.window().then((window) => {
//     window.localStorage.setItem(key, value)
//   })
// });
