/// <reference types="cypress" />

describe('Accessibility checks', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.handleCookieConsent();
    cy.waitForPageLoad();
  });

  it('has no critical a11y violations on load', () => {
    cy.injectAxe();
    cy.checkA11y(undefined, { includedImpacts: ['critical'] });
  });

  it('has no serious or higher violations on key areas', () => {
    cy.injectAxe();
    cy.checkA11y('header, nav, main, footer, [role="main"]', {
      includedImpacts: ['critical', 'serious']
    });
  });
});
