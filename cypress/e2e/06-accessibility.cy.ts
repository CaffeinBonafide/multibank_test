/// <reference types="cypress" />

describe('Accessibility checks', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.handleCookieConsent();
    cy.waitForPageLoad();
  });

  it('has no critical a11y violations on load', () => {
    const failOnError = !!(Cypress.env('a11y') && (Cypress.env('a11y') as any).failOnError);
    cy.injectAxe();
    cy.checkA11y(undefined, { includedImpacts: ['critical'] }, undefined, !failOnError);
  });

  it('reports serious or higher violations on key areas (non-blocking)', () => {
    const failOnError = !!(Cypress.env('a11y') && (Cypress.env('a11y') as any).failOnError);
    cy.injectAxe();
    const context = 'header, nav, main, footer, [role="main"]';
    const options = { includedImpacts: ['critical', 'serious'] } as const;
    const logViolations = (violations: any[]) => {
      if (!Array.isArray(violations)) return;
      cy.task('log', `a11y violations: ${violations.length}`);
      violations.forEach(v => {
        cy.task('log', `${v.impact || 'impact?'}: ${v.id} - ${v.help} (${v.nodes?.length || 0} nodes)`);
      });
    };
    // When failOnError=false, we still surface violations but do not fail the build
    cy.checkA11y(context, options as any, logViolations as any, !failOnError);
  });
});
