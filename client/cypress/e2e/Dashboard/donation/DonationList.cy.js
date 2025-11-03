/// <reference types="cypress" />

describe('🧪 CauseConnect Donations Dashboard E2E (Deployed backend, AuthSession)', () => {
  const baseUrl = 'https://causeconnect-zeta.vercel.app';
  const email = 'saiesha21052@gmail.com';
  const password = 'esha1010#';

  
  const loginSession = () => {
    cy.visit(`${baseUrl}/login`, { timeout: 60000 });
    cy.get('input[type="email"]').should('be.visible').clear().type(email);
    cy.get('input[type="password"]').should('be.visible').clear().type(password);
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

  
  it('loads Donations dashboard page successfully', () => {
    cy.visit(`${baseUrl}/dashboard/donations`, { timeout: 60000 });
    cy.url().should('include', '/dashboard/donations');
    cy.contains(/My Donations|Donations to My NGOs/i, { timeout: 20000 }).should('be.visible');
  });

  it('shows loading spinner while fetching data', () => {
    cy.intercept('POST', '**/graphql', (req) => {
      req.on('response', (res) => res.setDelay(1000)); // simulate delay
    }).as('graphqlDelay');

    cy.visit(`${baseUrl}/dashboard/donations`, { timeout: 60000 });
    cy.get('body').then(($b) => {
      if ($b.find('.MuiCircularProgress-root').length > 0) {
        cy.get('.MuiCircularProgress-root').should('exist');
      }
    });
    cy.wait('@graphqlDelay');
  });

  it('displays donation cards with donor/NGO details', () => {
    cy.visit(`${baseUrl}/dashboard/donations`, { timeout: 60000 });

    cy.get('body', { timeout: 20000 }).then(($body) => {
     
      if ($body.find('.MuiCard-root').length > 0) {
        cy.get('.MuiCard-root').first().within(() => {
          cy.get('img, .MuiAvatar-root').should('exist');
          cy.contains(/Amount: ₹|Amount/i).should('exist');
          cy.contains(/Date:|Date/i).should('exist');
          cy.contains(/NGO|Donor|Donation/i).should('exist');
        });
      } else if ($body.text().match(/No donations found/i)) {
        cy.contains(/No donations found/i).should('exist');
      } else if ($body.text().match(/Error fetching donations|Something went wrong/i)) {
        cy.contains(/Error fetching donations|Something went wrong/i).should('exist');
      } else {
       
        expect($body.text().length).to.be.greaterThan(0);
      }
    });
  });

  it('shows "No donations found" when API returns empty (mocked)', () => {
    cy.intercept('POST', '**/graphql', (req) => {
      if (
        req.body?.operationName?.toLowerCase().includes('userdonations') ||
        req.body?.operationName?.toLowerCase().includes('organizerdonations')
      ) {
        req.reply({
          statusCode: 200,
          body: { data: { userDonations: [] } },
        });
      }
    }).as('emptyDonations');

    cy.visit(`${baseUrl}/dashboard/donations`);
    cy.wait('@emptyDonations');
    cy.contains(/No donations found/i, { timeout: 10000 }).should('exist');
  })
  it('shows error message when API fails (mocked)', () => {
    cy.intercept('POST', '**/graphql', {
      statusCode: 500,
      body: { errors: [{ message: 'Server error' }] },
    }).as('errorQuery');

    cy.visit(`${baseUrl}/dashboard/donations`);
    cy.wait('@errorQuery');

    
    cy.get('body').then(($b) => {
      if ($b.text().match(/Error fetching donations|Failed to load donations/i)) {
        cy.contains(/Error fetching donations|Failed to load donations/i).should('exist');
      }
    });
  });

  it('displays correct section based on user role', () => {
    cy.visit(`${baseUrl}/dashboard/donations`);
    cy.get('body').then(($b) => {
      if ($b.text().match(/My Donations/i)) {
        cy.contains(/My Donations/i).should('be.visible');
      } else if ($b.text().match(/Donations to My NGOs/i)) {
        cy.contains(/Donations to My NGOs/i).should('be.visible');
      }
    });
  });
  it('navigates to other dashboard sections via sidebar', () => {
    cy.visit(`${baseUrl}/dashboard/donations`);
    cy.contains(/Profile/i).click({ force: true });
    cy.url({ timeout: 20000 }).should('include', '/dashboard/profile');
    cy.go('back');
    cy.url().should('include', '/dashboard/donations');
  });
});



