Cypress.Commands.add("getByData", (selector, ...args) => {
  return cy.get(`[data-test="${selector}"]`, ...args);
});
