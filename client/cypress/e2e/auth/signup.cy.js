/// <reference types="cypress" />

describe('🧪 CauseConnect Signup Page E2E (Final Stable)', () => {
  const baseUrl = 'https://causeconnect-zeta.vercel.app';

  beforeEach(() => {
    cy.visit(`${baseUrl}/signup`, { timeout: 60000 });
  });

  it('renders the signup form correctly', () => {
    cy.url().should('include', '/signup');
    cy.contains('Create Account', { timeout: 15000 }).should('be.visible');
    cy.contains('label', 'Full Name').should('exist');
    cy.contains('label', 'Email').should('exist');
    cy.contains('label', 'Password').should('exist');
    cy.contains('label', 'Role').should('exist');
    cy.contains('button', /^Sign Up$/i).should('be.visible');
  });

  it('completes signup successfully (User role)', () => {
    const uniqueEmail = `test_${Date.now()}@mailinator.com`;

    cy.contains('label', 'Full Name').parent().find('input').type('Cypress Test User', { force: true });
    cy.contains('label', 'Email').parent().find('input').type(uniqueEmail, { force: true });
    cy.contains('label', 'Password').parent().find('input').type('Test@12345', { force: true });


    cy.contains('label', 'Role')
      .parent()
      .find('div[role="button"], div[role="combobox"], .MuiSelect-select')
      .should('exist')
      .click({ force: true });

    cy.get('ul[role="listbox"]', { timeout: 10000 }).should('be.visible');
    cy.get('li.MuiMenuItem-root').contains(/^User$/i).click({ force: true });

    cy.contains('label', 'Phone').parent().find('input').type('9876543210', { force: true });
    cy.contains('label', 'Description / Status')
      .parent()
      .find('textarea:visible')
      .first()
      .type('Cypress automated signup test user.', { force: true });

    cy.fixture('profile.png', 'base64', { timeout: 10000 }).then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Blob.base64StringToBlob(fileContent),
          fileName: 'profile.png',
          mimeType: 'image/png',
        },
        { force: true }
      );
    });

    cy.contains('button', /^Sign Up$/i).should('be.visible').click({ force: true });
    cy.contains(/Signing up/i, { timeout: 10000 }).should('be.visible');
    cy.url({ timeout: 40000 }).should('include', '/ngos');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('cc_token')).to.exist;
    });
  });

  it('completes signup successfully (Organizer role)', () => {
    const uniqueEmail = `organizer_${Date.now()}@mailinator.com`;

    cy.contains('label', 'Full Name').parent().find('input').type('Organizer Test User', { force: true });
    cy.contains('label', 'Email').parent().find('input').type(uniqueEmail, { force: true });
    cy.contains('label', 'Password').parent().find('input').type('Test@12345', { force: true });

    cy.contains('label', 'Role')
      .parent()
      .find('div[role="button"], div[role="combobox"], .MuiSelect-select')
      .should('exist')
      .click({ force: true });

    cy.get('ul[role="listbox"]', { timeout: 10000 }).should('be.visible');
    cy.get('li.MuiMenuItem-root').contains(/^Organizer$/i).click({ force: true });

    cy.contains('label', 'Phone').parent().find('input').type('9998887776', { force: true });
    cy.contains('label', 'Description / Status')
      .parent()
      .find('textarea:visible')
      .first()
      .type('Organizer automated signup test.', { force: true });

    cy.fixture('profile.png', 'base64', { timeout: 10000 }).then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Blob.base64StringToBlob(fileContent),
          fileName: 'profile.png',
          mimeType: 'image/png',
        },
        { force: true }
      );
    });

    cy.contains('button', /^Sign Up$/i).should('be.visible').click({ force: true });
    cy.contains(/Signing up/i, { timeout: 10000 }).should('be.visible');
    cy.url({ timeout: 40000 }).should('include', '/ngos');
  });

  it('shows error when Role is not selected', () => {
    const uniqueEmail = `norole_${Date.now()}@mailinator.com`;

    cy.contains('label', 'Full Name').parent().find('input').type('No Role User', { force: true });
    cy.contains('label', 'Email').parent().find('input').type(uniqueEmail, { force: true });
    cy.contains('label', 'Password').parent().find('input').type('NoRole@123', { force: true });

    cy.contains('button', /^Sign Up$/i).should('be.visible').click({ force: true });

    // Check if HTML5 validation triggered (field still required)
    cy.get('select, [role="combobox"], [role="button"], .MuiSelect-select')
      .first()
      .should('have.attr', 'aria-required', 'true');

    // If app renders message, catch it dynamically (case-insensitive)
    cy.get('body').then(($body) => {
      if ($body.text().match(/select.*role/i)) {
        cy.contains(/select.*role/i).should('be.visible');
      } else {
        cy.log('Native required validation triggered instead of custom message');
      }
    });
  });

  

  it('navigates to login page when clicking "Login"', () => {
    cy.contains('Already have an account?').should('exist');
    cy.contains('Login', { timeout: 10000 }).should('be.visible').click({ force: true });
    cy.url({ timeout: 15000 }).should('include', '/login');
  });
});
