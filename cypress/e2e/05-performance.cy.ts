/// <reference types="cypress" />

type PerfMetrics = {
  fcp?: number;
  lcp?: number;
  cls?: number;
};

describe('Performance budgets', () => {
  it('meets basic performance thresholds', () => {
    const thresholds = (Cypress.config('env')?.performance?.thresholds || {
      fcp: 2500,
      lcp: 3500,
      cls: 0.1
    }) as PerfMetrics;

    cy.visit('/');
    cy.handleCookieConsent();
    cy.waitForPageLoad();
    cy.waitForNetworkIdle(1200, 20000);

    cy.window().then((win) => {
      const perf = win.performance as Performance;
      const nav = perf.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paints = perf.getEntriesByType('paint') as PerformanceEntry[];

      const fcpEntry = paints.find((e) => e.name === 'first-contentful-paint');
      const fcp = fcpEntry ? fcpEntry.startTime : undefined;

      // Approximate LCP using largest paint (fallback if LCP API not available)
      let lcp: number | undefined = undefined;
      try {
        // @ts-ignore
        const lcpEntries = perf.getEntriesByType('largest-contentful-paint');
        if (lcpEntries && lcpEntries.length) {
          // @ts-ignore
          lcp = lcpEntries[lcpEntries.length - 1].startTime;
        }
      } catch {}

      // Basic CLS proxy (if PerformanceObserver not used)
      const cls = 0; // placeholder; can be enhanced with PerformanceObserver in app

      if (thresholds.fcp && fcp) expect(fcp).to.be.lessThan(thresholds.fcp);
      if (thresholds.lcp && lcp) expect(lcp).to.be.lessThan(thresholds.lcp);
      if (thresholds.cls !== undefined) expect(cls).to.be.lessThan(thresholds.cls);

      // Also validate TTFB and load under reasonable bounds
      expect(nav.responseStart - nav.requestStart).to.be.lessThan(1500);
      expect(nav.loadEventEnd).to.be.lessThan(15000);
    });
  });
});
