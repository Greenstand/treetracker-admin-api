
describe("Login", () => {
  before(() => {
    cy.visit("/");
    cy.contains(/Login/i);
  });

  it("Login successfully", () => {
    cy.findInputByLabel("username")
      .type("dadiorchen");
    cy.findInputByLabel("password")
      .type("123456");
    cy.contains(/login/i)
      .click();
    cy.contains(/Welcome/i);
    cy.contains("Settings")
      .click();
  });

});
