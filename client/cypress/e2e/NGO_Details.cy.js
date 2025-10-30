/// <reference types="cypress" />

describe('🧪 CauseConnect NGO Details Page E2E (Fixed selectors & dialogs)', () => {
  const baseUrl = 'https://causeconnect-zeta.vercel.app';
  const ngoId = '2ccf961a-8f4a-4255-a5de-6e9a5e7c4091';
  const email = 'saiesha21052@gmail.com';
  const password = 'esha1010#';

  const loginSession = () => {
    cy.visit(`${baseUrl}/login`, { timeout: 40000 });
    cy.get('input[type="email"]', { timeout: 20000 }).should('be.visible').type(email, { force: true });
    cy.get('input[type="password"]', { timeout: 20000 }).should('be.visible').type(password, { force: true });
    cy.contains('button', /login/i, { timeout: 20000 }).should('be.visible').click({ force: true });
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

  it('renders NGO details page and shows main header & image', () => {
    cy.visit(`${baseUrl}/ngo/${ngoId}`, { timeout: 60000 });
    cy.url().should('include', `/ngo/${ngoId}`);
    cy.get('h3, h4, h5, h6', { timeout: 20000 }).filter(':visible').first().should('be.visible');
    cy.get('img', { timeout: 20000 }).should('be.visible');
    cy.contains(/About/i, { timeout: 15000 }).should('exist');
    cy.contains(/Location|📍/i).should('exist');
    cy.contains(/Cause|Impact|Mission|Vision/i).should('exist');
  });

  it('toggles favorite using the heart icon (aria-label check)', () => {
    cy.visit(`${baseUrl}/ngo/${ngoId}`, { timeout: 60000 });
    cy.get('h3, h4, h5', { timeout: 20000 }).should('be.visible');
    cy.get('img').should('be.visible');
    cy.get('button[aria-label*="favorite" i]', { timeout: 15000 }).should('exist').as('favBtn');
    cy.get('@favBtn').invoke('attr', 'aria-label').then((labelBefore) => {
      cy.get('@favBtn').click({ force: true });
      cy.wait(1500);
      cy.get('@favBtn').invoke('attr', 'aria-label').should((labelAfter) => {
        expect(labelAfter).not.to.equal(labelBefore);
      });
    });
    cy.get('body').then(($body) => {
      if ($body.find('[role="alert"]').length) {
        cy.get('[role="alert"]').should('be.visible');
      }
    });
  });

  it('opens the donation dialog and shows donation inputs', () => {
    cy.visit(`${baseUrl}/ngo/${ngoId}`, { timeout: 60000 });
    cy.get('button[aria-label="Donate to NGO"]', { timeout: 20000 }).should('exist').click({ force: true });
    cy.get('.MuiDialog-container', { timeout: 20000 }).should('be.visible');
    cy.get('input[aria-label="Donation amount"]', { timeout: 15000 }).should('be.visible');
    cy.contains(/Donate ₹|Amount|Message/i).should('exist');
    cy.get('button').filter(':visible').contains(/Cancel|Close/i).then(($btn) => {
      if ($btn.length) cy.wrap($btn.first()).click({ force: true });
    });
  });

  it('opens volunteer dialog and confirms registration if slots are available', () => {
    cy.visit(`${baseUrl}/ngo/${ngoId}`, { timeout: 60000 });
    cy.contains(/Events by/i, { timeout: 15000 }).scrollIntoView();
    cy.get('button').filter(':visible').contains(/^Volunteer$/i, { timeout: 20000 }).first().should('exist').click({ force: true });
    cy.get('.MuiDialog-container', { timeout: 15000 }).should('be.visible');
    cy.contains(/Event Details|Volunteers Needed|Location|Date/i, { timeout: 10000 }).should('exist');
    cy.contains(/Volunteers Registered/i).then(($el) => {
      const nums = $el.text().match(/\d+/g);
      if (nums && nums.length >= 2) {
        const registered = parseInt(nums[0]);
        const needed = parseInt(nums[1]);
        if (registered < needed) {
          cy.contains(/Confirm Registration/i, { timeout: 10000 }).should('exist').click({ force: true });
          cy.get('[role="alert"]', { timeout: 10000 }).should('contain.text', 'registered').and('be.visible');
        } else {
          cy.contains(/Confirm Registration/i).should('be.disabled');
        }
      } else {
        cy.contains(/Confirm Registration/i).should('exist');
      }
    });
  });

  it('checks Visit Website link exists and points to an external URL', () => {
    cy.visit(`${baseUrl}/ngo/${ngoId}`, { timeout: 40000 });
    cy.get('a[aria-label="Visit NGO website"]', { timeout: 15000 }).should('exist').and('have.attr', 'href').then((href) => {
      expect(href).to.match(/^https?:\/\//);
    });
  });

  it('shows contact and address info if present', () => {
    cy.visit(`${baseUrl}/ngo/${ngoId}`, { timeout: 40000 });
    cy.contains(/Contact|Phone|☎️|Email/i).should('exist');
    cy.contains(/Location|Address|📍/i).should('exist');
  });

  it('displays loading state before content loads', () => {
    cy.intercept('POST', '**/graphql').as('fetchData');
    cy.visit(`${baseUrl}/ngo/${ngoId}`, { timeout: 60000 });
    cy.contains(/Loading NGO details/i, { timeout: 10000 }).should('exist');
    cy.wait('@fetchData');
  });

  it('displays error message when server returns error', () => {
    cy.intercept('POST', '**/graphql', { statusCode: 500, body: { errors: [{ message: 'Internal Server Error' }] } }).as('failRequest');
    cy.visit(`${baseUrl}/ngo/${ngoId}`, { timeout: 40000 });
    cy.wait('@failRequest');
    cy.contains(/Error:/i, { timeout: 15000 }).should('exist');
  });

  it('shows snackbar messages when triggered', () => {
    cy.visit(`${baseUrl}/ngo/${ngoId}`, { timeout: 60000 });
    cy.get('button[aria-label*="favorite" i]').first().click({ force: true });
    cy.get('[role="alert"]', { timeout: 10000 }).should('exist');
  });

  it('renders fallback text when no events found', () => {
    cy.intercept('POST', '**/graphql', (req) => {
      if (req.body.operationName === 'getNGO') {
        req.reply({ data: { ngo: { id: ngoId, name: 'Empty NGO', events: [] } } });
      }
    }).as('emptyEvents');
    cy.visit(`${baseUrl}/ngo/${ngoId}`, { timeout: 40000 });
    cy.wait('@emptyEvents');
    cy.contains(/No events found/i, { timeout: 10000 }).should('exist');
  });
});
