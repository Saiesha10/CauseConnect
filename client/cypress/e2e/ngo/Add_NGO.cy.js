/// <reference types="cypress" />

describe('🧪 CauseConnect Add NGO Page E2E (Authenticated & Stable)', () => {
  const baseUrl = 'https://causeconnect-zeta.vercel.app';
  const email = 'saiesha21052@gmail.com';
  const password = 'esha1010#';

  const loginSession = () => {
    cy.visit(`${baseUrl}/login`, { timeout: 40000 });
    cy.get('input[type="email"]').type(email, { force: true });
    cy.get('input[type="password"]').type(password, { force: true });
    cy.contains('button', /login/i).click({ force: true });
    cy.url({ timeout: 30000 }).should('include', '/ngos');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('cc_token')).to.exist;
    });
  };

  before(() => {
    cy.session('authSession', loginSession);
  });

  beforeEach(() => {
    cy.session('authSession', loginSession);
    cy.visit(`${baseUrl}/add-ngo`, { timeout: 60000 });
    cy.url().should('include', '/add-ngo');
  });

  it('renders all input fields', () => {
    cy.contains('Add New NGO').should('be.visible');
    cy.contains('label', 'NGO Name').should('exist');
    cy.contains('label', 'Cause').should('exist');
    cy.contains('label', 'Description').should('exist');
    cy.contains('label', 'Location').should('exist');
    cy.contains('button', /^Add NGO$/i).should('exist');
  });

 it('shows validation when submitting empty form', () => {
    cy.get('form').within(() => {
      cy.get('button[type="submit"], button').contains(/^Add NGO$/i).click({ force: true });
    });

    cy.get('input:invalid, textarea:invalid', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .then((els) => {
        Cypress.log({ name: 'Validation', message: `Found ${els.length} invalid fields` });
      });
  });

  it('uploads NGO image (mock success)', () => {
    cy.intercept('POST', '**/v1_1/*/image/upload', {
      statusCode: 200,
      body: { secure_url: 'https://dummyimage.com/test.png' },
    }).as('uploadSuccess');

    cy.fixture('profile.png', 'base64').then((fileContent) => {
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Blob.base64StringToBlob(fileContent),
          fileName: 'ngo.png',
          mimeType: 'image/png',
        },
        { force: true }
      );
    });

    cy.wait('@uploadSuccess');
    cy.get('img', { timeout: 15000 }).should('be.visible');
  });

  it('submits form successfully (mocked NGO creation)', () => {
    cy.intercept('POST', '**/graphql', (req) => {
      if (req.body.query.includes('createNGO')) {
        req.reply({
          data: {
            createNGO: {
              id: 'mock-id-123',
              name: 'Cypress NGO',
            },
          },
        });
      }
    }).as('createNGO');

    cy.contains('label', 'NGO Name').parent().find('input').type('Cypress Test NGO', { force: true });
    cy.contains('label', 'Cause').parent().find('input').type('Community Support', { force: true });
    cy.contains('label', 'Description').parent().find('textarea').first().type('Automated testing NGO description', { force: true });
    cy.contains('label', 'Location').parent().find('input').type('Bangalore', { force: true });
    cy.contains('label', 'Contact Info').parent().find('input').type('test@ngo.org', { force: true });
    cy.contains('label', 'Donation Link').parent().find('input').type('https://donate.ngo.org', { force: true });

    cy.contains('button', /^Add NGO$/i).click({ force: true });
    cy.wait('@createNGO');
    cy.contains(/NGO created successfully/i, { timeout: 15000 }).should('exist');
  });

  it('navigates back when clicking Cancel', () => {
    cy.contains('button', /^Cancel$/i).should('exist').click({ force: true });
    cy.url({ timeout: 10000 }).should('not.include', '/add-ngo');
  });
});