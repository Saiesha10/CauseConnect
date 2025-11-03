/// <reference types="cypress" />

describe('🧪 CauseConnect Create Event Page E2E (Authenticated)', () => {
  const baseUrl = 'https://causeconnect-zeta.vercel.app';
  const ngoId = '2ccf961a-8f4a-4255-a5de-6e9a5e7c4091';
  const email = 'saiesha21052@gmail.com';
  const password = 'esha1010#';

  const loginSession = () => {
    cy.visit(`${baseUrl}/login`, { timeout: 40000 });
    cy.get('input[type="email"]').should('be.visible').type(email, { force: true });
    cy.get('input[type="password"]').should('be.visible').type(password, { force: true });
    cy.contains('button', /login/i).click({ force: true });
    cy.url({ timeout: 30000 }).should('include', '/ngos');
    cy.window().then((win) => {
      const token = win.localStorage.getItem('cc_token');
      expect(token).to.exist;
    });
  };

  before(() => {
    cy.session('authSession', loginSession);
  });

  beforeEach(() => {
    cy.session('authSession', loginSession);
  });

  it('renders Create Event page properly', () => {
    cy.visit(`${baseUrl}/dashboard/events/create/${ngoId}`, { timeout: 40000 });
    cy.url().should('include', `/dashboard/events/create/${ngoId}`);
    cy.contains('Create New Event', { timeout: 15000 }).should('be.visible');
    cy.contains('label', 'Event Title').should('exist');
    cy.contains('label', 'Description').should('exist');
    cy.contains('button', /^Create Event$/i).should('be.visible');
  });

 it('shows validation when submitting empty form', () => {
  cy.visit(`${baseUrl}/dashboard/events/create/${ngoId}`, { timeout: 40000 });

  cy.get('form').within(() => {
    cy.get('button[type="submit"], button')
      .contains(/^Create Event$/i)
      .should('be.visible')
      .click({ force: true });
  });

  cy.get('input:invalid, textarea:invalid', { timeout: 10000 })
    .should('have.length.greaterThan', 0)
    .then((els) => {
      Cypress.log({
        name: 'Validation',
        message: `Found ${els.length} invalid fields`,
      });
    });
});


  it('successfully creates an event with valid details', () => {
    cy.visit(`${baseUrl}/dashboard/events/create/${ngoId}`, { timeout: 40000 });

    cy.contains('label', 'Event Title').parent().find('input').type('Cypress Automation Event', { force: true });
    cy.contains('label', 'Description')
      .parent()
      .find('textarea')
      .first()
      .type('This event is created automatically by Cypress.', { force: true });
    cy.contains('label', 'Event Date').parent().find('input[type="date"]').type('2025-12-20', { force: true });
    cy.contains('label', 'Location').parent().find('input').type('Bangalore', { force: true });
    cy.contains('label', 'Volunteers Needed').parent().find('input').type('10', { force: true });

    cy.contains('button', /^Create Event$/i).should('be.visible').click({ force: true });

    cy.get('.MuiSnackbar-root', { timeout: 15000 })
      .should('exist')
      .and('be.visible')
      .within(() => {
        cy.contains(/Event created successfully/i).should('exist');
      });

    cy.url({ timeout: 30000 }).should('include', `/ngo/${ngoId}`);
  });

  it('shows snackbar error for invalid input (negative volunteers)', () => {
    cy.visit(`${baseUrl}/dashboard/events/create/${ngoId}`, { timeout: 40000 });

    cy.contains('label', 'Event Title').parent().find('input').type('Invalid Volunteer Test', { force: true });
    cy.contains('label', 'Volunteers Needed').parent().find('input').type('-5', { force: true });

    cy.contains('button', /^Create Event$/i).click({ force: true });
    cy.get('.MuiSnackbar-root', { timeout: 15000 })
      .should('exist')
      .and('be.visible')
      .within(() => {
        cy.contains(/Please fix the errors in the form/i).should('exist');
      });
  });

  it('navigates back to NGO details page when Cancel is clicked', () => {
    cy.visit(`${baseUrl}/dashboard/events/create/${ngoId}`, { timeout: 40000 });
    cy.contains('button', /^Cancel$/i).should('be.visible').click({ force: true });
    cy.url({ timeout: 20000 }).should('include', `/ngo/${ngoId}`);
  });
});
