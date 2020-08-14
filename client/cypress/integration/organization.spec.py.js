
describe("Organzation", () => {
  before(() => {
    cy.visit("/");
    cy.contains(/Login/i);
    cy.findInputByLabel("userName")
      .type("freetown");
    cy.findInputByLabel("password")
      .type("admin");
    cy.contains(/login/i)
      .click();
    cy.contains(/Greenstand admin panel/i);
  });



  it("", () => {
    cy.contains(/verify/i)
      .click();
  });
});
