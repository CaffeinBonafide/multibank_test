/// <reference types="cypress" />
export {};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to handle cookie consent
       */
      handleCookieConsent(): Chainable<void>;

      /**
       * Custom command to wait for page to be fully loaded
       */
      waitForPageLoad(): Chainable<void>;
    }
  }
}

// Handle cookie consent
Cypress.Commands.add('handleCookieConsent', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-cy="cookie-consent"], .cookie-banner, #cookie-consent').length > 0) {
      cy.get('[data-cy="cookie-accept"], .cookie-accept, .accept-cookies')
        .first()
        .click({ force: true });
    }
  });
});

// Wait for page to be fully loaded
Cypress.Commands.add('waitForPageLoad', () => {
  cy.window().should('have.property', 'document');
  cy.document().should('have.property', 'readyState', 'complete');
});