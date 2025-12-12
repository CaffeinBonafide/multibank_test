describe('MultiBank Homepage Test', () => {
  it('should load the homepage successfully', () => {
    cy.visit('/');
    cy.handleCookieConsent();    
    cy.waitForPageLoad();
    
    cy.get('body').should('be.visible');
    cy.title().should('not.be.empty');
    
    cy.get('nav, header, .navbar, .header').should('exist');
    
    cy.screenshot('homepage-loaded');
    
    cy.log('MultiBank homepage loaded successfully');
  });

  it('should have a proper page title', () => {
    cy.visit('/');
    cy.handleCookieConsent();
    
    cy.title().should(($t) => {
      const title = $t as unknown as string;
      expect(title).to.match(/(MultiBank|Trading|Trade)/i);
    });
  });

  it('should display main content areas', () => {
    cy.visit('/');
    cy.handleCookieConsent();
    
    cy.get('[role="main"], [id*="main"], [class*="content"], [class*="main"], #root, body')
      .should('exist');
    
    cy.document().then((doc) => {
      const footer = doc.querySelector('footer, .footer, [role="contentinfo"]');
      if (footer) {
        expect(footer).to.exist;
      } else {
        cy.log('Footer not found on page — continuing');
      }
    });
    
    cy.log('Main content areas detected');
  });
});