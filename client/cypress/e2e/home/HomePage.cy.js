describe("CauseConnect Home Page", () => {
  beforeEach(() => {
    cy.visit("/");
    
  });

  it("should display the hero section", () => {
    cy.contains("CauseConnect").should("be.visible");
  });

  it("should navigate to login page when 'Login' button is clicked", () => {
    cy.contains(/login/i).click();
    cy.url().should("include", "/login");
  });

  it("should navigate to signup page when 'Sign Up' button is clicked", () => {
    cy.visit("/");
    cy.contains(/sign up/i).click();
    cy.url().should("include", "/signup");
  });
});
