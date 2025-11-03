describe("🧪 Login Page E2E", () => {
  beforeEach(() => {
    cy.visit("https://causeconnect-zeta.vercel.app/login");
    cy.get("body").should("be.visible");
  });

  it("renders the login page and fields correctly", () => {
    cy.contains(/welcome back/i).should("be.visible");

    // Flexible selectors for MUI TextFields
    cy.get('input[type="email"], input#email, input[name="email"]').should("exist");
    cy.get('input[type="password"], input#password, input[name="password"]').should("exist");

    cy.get("button").contains(/login/i).should("be.visible");
  });

  it("shows an error when invalid credentials are entered", () => {
    cy.get('input[type="email"]').clear().type("wronguser@example.com");
    cy.get('input[type="password"]').clear().type("wrongpassword");
    cy.get("button").contains(/login/i).click();

    // Looks for any generic error message (MUI Snackbar / alert)
    cy.contains(/invalid|error|failed/i, { timeout: 8000 }).should("exist");
  });

  it("logs in successfully and redirects to NGO listings", () => {
    // Use a real valid account (replace with your own credentials)
    cy.get('input[type="email"]').clear().type("saiesha21052@gmail.com");
    cy.get('input[type="password"]').clear().type("esha1010#");
    cy.get("button").contains(/login/i).click();

    // Check redirection to /ngos after login
    cy.url({ timeout: 15000 }).should("include", "/ngos");
    cy.contains(/ngo|list/i, { timeout: 8000 }).should("be.visible");
  });

  it("navigates to signup page when clicking Sign Up", () => {
    cy.contains(/sign up/i).click();
    cy.url().should("include", "/signup");
    cy.contains(/create an account|sign up/i).should("be.visible");
  });
});
