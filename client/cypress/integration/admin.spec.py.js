
describe("Organzation", () => {
  before(() => {
    cy.visit("/");
    cy.contains(/Log in/i);
    cy.findInputByLabel("Username")
      .type("admin");
    cy.findInputByLabel("Password")
      .type("admin");
    cy.contains(/log in/i)
      .click();
    cy.contains(/Greenstand admin panel/i);
  });



  it("", () => {
    cy.contains(/verify/i)
      .click();
  });
});
