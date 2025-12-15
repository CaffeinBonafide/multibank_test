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

      /**
       * Wait until network is idle (no XHR/fetch) for a quiet period
       * @param idleMs number of ms with no requests (default 1000)
       * @param timeout overall timeout (default 15000)
       */
      waitForNetworkIdle(idleMs?: number, timeout?: number): Chainable<void>;

      /**
       * Get an element once it is stable (position/size not changing)
       * @param selector CSS selector
       * @param stableMs ms of stability required (default 200)
       * @param timeout overall timeout (default 5000)
       */
      getStable(selector: string, stableMs?: number, timeout?: number): Chainable<JQuery<HTMLElement>>;
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

// Wait until the app has no pending network for a given idle window
Cypress.Commands.add('waitForNetworkIdle', (idleMs = 1000, timeout = 15000) => {
  const started: Set<number> = new Set();
  const finished: Set<number> = new Set();
  let lastActive = Date.now();

  cy.window({ log: false }).then((win) => {
    const origOpen = win.XMLHttpRequest.prototype.open;
    const origSend = win.XMLHttpRequest.prototype.send;
    // Hook XHR
    // @ts-ignore
    win.XMLHttpRequest.prototype.open = function(...args: any[]) {
      // @ts-ignore
      this._reqId = Date.now() + Math.random();
      return origOpen.apply(this, args as any);
    };
    // @ts-ignore
    win.XMLHttpRequest.prototype.send = function(...args: any[]) {
      // @ts-ignore
      const id = this._reqId as number;
      started.add(id);
      lastActive = Date.now();
      this.addEventListener('loadend', () => {
        finished.add(id);
        lastActive = Date.now();
      });
      return origSend.apply(this, args as any);
    };

    // Hook fetch
    const origFetch = win.fetch;
    win.fetch = (...args: any[]) => {
      const id = Date.now() + Math.random();
      started.add(id);
      lastActive = Date.now();
      return (origFetch as any)(...args).finally(() => {
        finished.add(id);
        lastActive = Date.now();
      });
    };
  });

  const end = Date.now() + timeout;
  cy.wrap(null, { log: false }).should(() => {
    const inFlight = [...started].filter((id) => !finished.has(id)).length;
    const quietFor = Date.now() - lastActive;
    if (!(inFlight === 0 && quietFor >= idleMs)) {
      if (Date.now() > end) throw new Error('waitForNetworkIdle timed out');
      throw new Error('not idle yet');
    }
  });
});

// Wait for an element to become visually stable, then return it
Cypress.Commands.add('getStable', (selector: string, stableMs = 200, timeout = 5000) => {
  const end = Date.now() + timeout;
  function rect(el: HTMLElement) {
    const r = el.getBoundingClientRect();
    return [r.top, r.left, r.width, r.height].map((n) => Math.round(n));
  }
  function check(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(selector, { log: false }).then(($el): Cypress.Chainable<JQuery<HTMLElement>> => {
      const el = $el[0] as HTMLElement;
      const a = rect(el);
      return cy.wait(stableMs, { log: false }).then((): Cypress.Chainable<JQuery<HTMLElement>> => {
        const b = rect(el);
        const same = a.join(',') === b.join(',');
        if (same) return cy.wrap($el);
        if (Date.now() > end) throw new Error('getStable timed out');
        return check();
      });
    });
  }
  return check();
});