declare namespace Cypress {
  interface Chainable<Subject = any> {
    policyAccept(): void;
    welcomePopup(): void;
    openService(tcs: string, name: string): void;
    // getLocalStorage(key: string): Chainable<string>;
    // setLocalStorage(key: string, value: string): void;
  }
}
