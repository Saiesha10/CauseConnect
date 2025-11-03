/// <reference types="cypress" />

describe('🧪 CauseConnect Dashboard Access & NGO List (Organizer)', () => {
  const baseUrl = 'https://causeconnect-zeta.vercel.app';
  const email = 'saiesha21052@gmail.com'; // must be an ORGANIZER account
  const password = 'esha1010#';

  const loginSession = () => {
    cy.visit(`${baseUrl}/login`, { timeout: 40000 });

    cy.get('input[type="email"]', { timeout: 20000 })
      .should('be.visible')
      .clear()
      .type(email, { force: true });

    cy.get('input[type="password"]', { timeout: 20000 })
      .should('be.visible')
      .clear()
      .type(password, { force: true });

    cy.contains('button', /login/i, { timeout: 20000 })
      .should('be.visible')
      .click({ force: true });

    cy.url({ timeout: 30000 }).should('include', '/ngos');

    cy.window().then((win) => {
      const token = win.localStorage.getItem('cc_token');
      expect(token, 'Token must exist').to.exist;
      win.localStorage.setItem('cc_token', token);
    });
  };

  before(() => {
    cy.session('authSession', loginSession);
  });

  beforeEach(() => {
    cy.session('authSession', loginSession);
    cy.then(() => {
      cy.visit(`${baseUrl}/`, { timeout: 20000 });
      cy.window().then((win) => {
        const token = win.localStorage.getItem('cc_token');
        if (token) win.localStorage.setItem('cc_token', token);
      });
    });
  });

  it('redirects correctly to organizer dashboard', () => {
    cy.visit(`${baseUrl}/dashboard`, { timeout: 40000 });
    cy.url().should('include', '/dashboard');
  });

  it('loads NGO Dashboard successfully for organizer', () => {
    cy.visit(`${baseUrl}/dashboard/ngos`, { timeout: 40000 });

    cy.url({ timeout: 20000 }).should('include', '/dashboard/ngos');
    cy.get('.MuiCircularProgress-root', { timeout: 10000 }).should('not.exist');

    cy.contains(/My NGOs|Dashboard|Create Event/i, { timeout: 20000 }).should('be.visible');
  });

  it('displays list of NGOs', () => {
    cy.visit(`${baseUrl}/dashboard/ngos`);
    cy.get('.MuiCard-root', { timeout: 20000 }).should('have.length.greaterThan', 0);
  });

  it('expands and displays detailed NGO information (Donations, Events, Volunteers)', () => {
    cy.visit(`${baseUrl}/dashboard/ngos`);
    cy.get('button[aria-label*="Expand details"]', { timeout: 20000 })
      .first()
      .click({ force: true });
    cy.get('.MuiCollapse-root').should('have.class', 'MuiCollapse-entered');
    cy.contains(/Description/i).should('be.visible');
    cy.contains(/Donations/i).should('be.visible');
    cy.contains(/Events/i).should('be.visible');
  });

  it('navigates to Create Event page from NGO card', () => {
    cy.visit(`${baseUrl}/dashboard/ngos`);
    cy.contains('button', /Create Event/i, { timeout: 20000 })
      .should('exist')
      .first()
      .click({ force: true });
    cy.url({ timeout: 20000 }).should('include', '/dashboard/events/create');
  });
});
