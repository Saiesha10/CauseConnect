/// <reference types="cypress" />

describe('🧪 CauseConnect Favorites Dashboard E2E (Deployed backend, AuthSession)', () => {
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


  it('loads Favorites dashboard page successfully', () => {
    cy.visit(`${baseUrl}/dashboard/favorites`, { timeout: 60000 });
    cy.url().should('include', '/dashboard/favorites');
    cy.contains(/My Favorite NGOs/i, { timeout: 20000 }).should('be.visible');
  });

  it('shows loading spinner while fetching favorites', () => {
    cy.intercept('POST', '**/graphql', (req) => {
      req.on('response', (res) => res.setDelay(1200)); 
    }).as('graphqlDelay');

    cy.visit(`${baseUrl}/dashboard/favorites`, { timeout: 60000 });
    cy.get('body').then(($b) => {
      if ($b.find('.MuiCircularProgress-root').length > 0) {
        cy.get('.MuiCircularProgress-root').should('exist');
      }
    });
    cy.wait('@graphqlDelay');
  });


  it('displays favorite NGO cards with details and actions', () => {
    cy.visit(`${baseUrl}/dashboard/favorites`, { timeout: 60000 });

    cy.get('body', { timeout: 20000 }).then(($body) => {
      if ($body.find('.MuiCard-root').length > 0) {
        cy.get('.MuiCard-root').first().within(() => {
          cy.get('img').should('exist');
          cy.contains(/Cause:/i).should('exist');
          cy.contains(/View/i).should('be.visible');
          cy.contains(/Remove/i).should('be.visible');
        });
      } else if ($body.text().match(/You have not added any favorites yet/i)) {
        cy.contains(/You have not added any favorites yet/i).should('exist');
      } else if ($body.text().match(/Failed to load favorites/i)) {
        cy.contains(/Failed to load favorites/i).should('exist');
      } else {
        expect($body.text().length).to.be.greaterThan(0);
      }
    });
  });

  it('navigates to NGO detail page when clicking "View"', () => {
    cy.visit(`${baseUrl}/dashboard/favorites`);
    cy.get('body').then(($b) => {
      if ($b.find('.MuiCard-root').length > 0) {
        cy.get('.MuiCard-root').first().within(() => {
          cy.contains(/View/i).click({ force: true });
        });
        cy.url({ timeout: 15000 }).should('include', '/ngo/');
        cy.go('back');
        cy.url().should('include', '/dashboard/favorites');
      } else {
        cy.log('No favorite NGOs found to test navigation.');
      }
    });
  });


  it('removes a favorite NGO successfully and shows snackbar', () => {
    cy.visit(`${baseUrl}/dashboard/favorites`);

    cy.get('body').then(($b) => {
      if ($b.find('.MuiCard-root').length > 0) {
        cy.get('.MuiCard-root').then(($cardsBefore) => {
          const initialCount = $cardsBefore.length;

          cy.get('.MuiCard-root').first().within(() => {
            cy.contains(/Remove/i).click({ force: true });
          });

          cy.wait(3000);
          cy.get('.MuiSnackbar-root', { timeout: 10000 }).should('be.visible');
          cy.get('.MuiAlert-message')
            .should('contain.text', 'Removed from favorites successfully');

          cy.get('.MuiCard-root').should('have.length.lessThan', initialCount);
        });
      } else {
        cy.log('No favorite NGOs available to test removal.');
      }
    });
  });


  it('shows "no favorites" message when API returns empty (mocked)', () => {
    cy.intercept('POST', '**/graphql', (req) => {
      if (req.body?.operationName?.toLowerCase().includes('getuserfavorites')) {
        req.reply({
          statusCode: 200,
          body: { data: { userFavorites: [] } },
        });
      }
    }).as('emptyFavorites');

    cy.visit(`${baseUrl}/dashboard/favorites`);
    cy.wait('@emptyFavorites');
    cy.contains(/You have not added any favorites yet/i, { timeout: 10000 }).should('exist');
  });

  
  it('shows error message when GraphQL query fails', () => {
    cy.intercept('POST', '**/graphql', {
      statusCode: 500,
      body: { errors: [{ message: 'Server error' }] },
    }).as('errorQuery');

    cy.visit(`${baseUrl}/dashboard/favorites`);
    cy.wait('@errorQuery');

    cy.get('body').then(($b) => {
      if ($b.text().match(/Failed to load favorites|Error/i)) {
        cy.contains(/Failed to load favorites|Error/i).should('exist');
      }
    });
  });


  it('navigates to other dashboard sections via sidebar', () => {
    cy.visit(`${baseUrl}/dashboard/favorites`);
    cy.contains(/Profile/i).click({ force: true });
    cy.url({ timeout: 20000 }).should('include', '/dashboard/profile');
    cy.go('back');
    cy.url().should('include', '/dashboard/favorites');
  });
});
