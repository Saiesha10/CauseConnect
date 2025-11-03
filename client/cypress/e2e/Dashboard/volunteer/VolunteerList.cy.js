describe('🧪 CauseConnect Volunteer List Page E2E (with Auth)', () => {
  const baseUrl = 'https://causeconnect-zeta.vercel.app';
  const email = 'saiesha21052@gmail.com';
  const password = 'esha1010#';

  const loginSession = () => {
    cy.visit(`${baseUrl}/login`, { timeout: 40000 });
    cy.get('input[type="email"]', { timeout: 20000 }).should('be.visible').type(email, { force: true });
    cy.get('input[type="password"]').should('be.visible').type(password, { force: true });
    cy.contains('button', /login/i).should('be.visible').click({ force: true });
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

  it('loads Volunteer dashboard successfully', () => {
    cy.visit(`${baseUrl}/dashboard/volunteers`, { timeout: 40000 });
    cy.url().should('include', '/dashboard/volunteers');
    cy.contains(/Volunteers/i, { timeout: 10000 }).should('be.visible');
  });

  it('shows loading spinner before data is fetched', () => {
    cy.intercept('POST', '**/graphql', (req) => {
      req.on('response', (res) => {
        res.setDelay(2000);
      });
    }).as('slowQuery');
    cy.visit(`${baseUrl}/dashboard/volunteers`);
    cy.get('.MuiCircularProgress-root', { timeout: 10000 }).should('exist');
    cy.wait('@slowQuery');
  });

  it('displays volunteer cards after successful data fetch', () => {
    cy.visit(`${baseUrl}/dashboard/volunteers`, { timeout: 40000 });
    cy.get('.MuiCard-root', { timeout: 15000 }).should('have.length.greaterThan', 0);
    cy.get('.MuiTypography-root').contains(/Event Date/i).should('exist');
  });

  it('opens and closes volunteer detail modal properly', () => {
    cy.visit(`${baseUrl}/dashboard/volunteers`);
    cy.get('.MuiCard-root', { timeout: 15000 }).first().click({ force: true });
    cy.get('.MuiModal-root', { timeout: 10000 }).should('exist').and('be.visible');
    cy.get('.MuiModal-root').within(() => {
      cy.contains(/Email/i).should('exist');
      cy.contains(/Phone/i).should('exist');
      cy.contains(/Description/i).should('exist');
    });
    cy.contains(/Close/i).click({ force: true });
    cy.get('.MuiModal-root').should('not.exist');
  });

  it('shows volunteer role chip and description inside modal if available', () => {
    cy.visit(`${baseUrl}/dashboard/volunteers`);
    cy.get('.MuiCard-root').first().click({ force: true });
    cy.get('.MuiChip-root', { timeout: 10000 }).should('exist');
    cy.get('.MuiModal-root', { timeout: 10000 }).within(() => {
      cy.contains(/organizer|volunteer/i).should('exist');
      cy.contains(/Description|Phone|Email/i).should('exist');
    });
    cy.contains(/Close/i).click({ force: true });
  });

   
  it('shows "No volunteers found" when list is empty (mocked inline)', () => {
    cy.intercept('POST', '**/graphql', (req) => {
      if (req.body?.query?.includes('organizerVolunteers')) {
        req.reply({ data: { organizerVolunteers: [] } });
      }
    }).as('emptyVolunteers');

    cy.visit(`${baseUrl}/dashboard/volunteers`, { timeout: 40000 });
    cy.wait('@emptyVolunteers');
    cy.contains(/No volunteers found/i, { timeout: 10000 }).should('exist').and('be.visible');
  });

  it('shows error state when API fails (mock 500)', () => {
    cy.intercept('POST', '**/graphql', {
      statusCode: 500,
      body: {},
    }).as('graphqlError');
    cy.visit(`${baseUrl}/dashboard/volunteers`);
    cy.wait('@graphqlError');
    cy.contains(/Error fetching user data/i, { timeout: 15000 }).should('be.visible');
  });
});
