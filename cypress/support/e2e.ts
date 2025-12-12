import './commands';

import 'cypress-mochawesome-reporter/register';
import '@cypress/grep';
import 'cypress-real-events';
import 'cypress-file-upload';
import 'cypress-axe';

Cypress.on('uncaught:exception', (err, runnable) => {
  console.warn('Uncaught exception:', err.message);
  return false;
});

beforeEach(() => {
  cy.log('Setting up test environment');
  
  cy.clearCookies();
  cy.clearLocalStorage();
  
  cy.viewport(1920, 1080);
});

afterEach(() => {
  cy.log('Cleaning up after test');
});