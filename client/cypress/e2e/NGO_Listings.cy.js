/// <reference types="cypress" />

describe('🧪 CauseConnect NGO Details Page E2E (Authenticated)', () => {
  const baseUrl = 'https://causeconnect-zeta.vercel.app';
  const email = 'saiesha21052@gmail.com';
  const password = 'esha1010#';
  const ngoId = '2ccf961a-8f4a-4255-a5de-6e9a5e7c4091';

  beforeEach(() => {
    // Maintain session login
    cy.session('authSession', () => {
      cy.visit(`${baseUrl}/login`, { timeout: 40000 });

      cy.url().should('include', '/login');
      cy.contains('Login', { timeout: 15000 }).should('be.visible');

      cy.get('input[type="email"]').should('be.visible').type(email, { force: true });
      cy.get('input[type="password"]').should('be.visible').type(password, { force: true });
      cy.contains('button', /login/i).should('be.visible').click({ force: true });

      cy.url({ timeout: 40000 }).should('include', '/ngos');
      cy.window().then((win) => {
        const token = win.localStorage.getItem('cc_token');
        expect(token, 'cc_token should exist after login').to.exist;
      });
    });

    cy.visit(`${baseUrl}/ngo/${ngoId}`, { timeout: 40000 });
  });

  it('loads NGO details successfully', () => {
    cy.url().should('include', `/ngo/${ngoId}`);
    cy.contains(/About|Overview|Details/i, { timeout: 20000 }).should('be.visible');
    cy.get('img').should('exist');
    cy.contains(/📍/).should('exist'); // location text
    cy.contains(/Cause|Impact|Category/i).should('exist');
  });

  it('displays NGO description, cause, and action buttons', () => {
    cy.contains(/Description|About the NGO/i, { timeout: 15000 }).should('be.visible');
    cy.get('button').contains(/Back|Donate|Volunteer/i).should('exist');
  });

  it('navigates correctly when clicking a related action button', () => {
    cy.get('button').contains(/Donate|Volunteer/i).then(($btn) => {
      if ($btn.length) {
        cy.wrap($btn).click({ force: true });
        cy.url({ timeout: 20000 }).should('not.include', `/ngo/${ngoId}`);
      } else {
        cy.log('No Donate/Volunteer button found, skipping navigation test');
      }
    });
  });

  it('maintains authentication between tests', () => {
    cy.window().then((win) => {
      const token = win.localStorage.getItem('cc_token');
      expect(token).to.exist;
    });
  });
});
