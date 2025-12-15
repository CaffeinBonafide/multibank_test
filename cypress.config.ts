import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'multibank-automation',
  e2e: {
    baseUrl: 'https://trade.multibank.io',
    
    viewportWidth: 1920,
    viewportHeight: 1080,
    
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true,
    screenshotOnRunFailure: true,
    
    defaultCommandTimeout: 30000,
    pageLoadTimeout: 60000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    taskTimeout: 120000,
    
    // Test isolation and browser settings
    testIsolation: true,
    chromeWebSecurity: false,
    
    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    env: {
      environment: 'production',
      
      apiBaseUrl: 'https://trade.multibank.io/api',
      
      testDataPath: 'cypress/fixtures/testData',
      
      visualRegression: {
        threshold: 0.1,
        thresholdType: 'percent'
      },
      
      a11y: {
        skipTests: false
      },
      
      performance: {
        enabled: true,
        thresholds: {
          fcp: 2000,
          lcp: 3000,
          cls: 0.1
        }
      }
    },
    
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      require('@cypress/grep/src/plugin')(config);
      
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        
        getCurrentTimestamp() {
          return new Date().toISOString();
        },
        
        generateTestData(type: string) {
          return { type, timestamp: new Date().toISOString() };
        }
      });
      
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
        }
        
        if (browser.family === 'firefox') {
          launchOptions.preferences['network.http.speculative-parallel-limit'] = 0;
        }
        
        return launchOptions;
      });
      
      return config;
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    specPattern: 'cypress/component/**/*.cy.{js,ts}'
  },
    reporter: 'cypress-mochawesome-reporter'
});