
describe("Login", () => {
  before(() => {
    cy.visit("/");
    cy.contains(/Login/i);
  });

  it("Login successfully", () => {
    cy.findInputByLabel("username")
      .type("amdin");
    cy.findInputByLabel("password")
      .type("amdin");
    cy.contains(/login/i)
      .click();
    cy.contains(/Welcome/i);
  });

});
