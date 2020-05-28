
describe("Login", () => {
  before(() => {
    cy.visit("/");
    cy.contains(/Login/i);
    cy.findInputByLabel("username")
      .type("dadiorchen");
    cy.findInputByLabel("password")
      .type("123456");
    cy.contains(/login/i)
      .click();
  });

  it("Login successfully", () => {
    cy.contains(/Welcome/i);
  });

  describe("User Manager", () => {

    beforeEach(() => {
      cy.contains(/user manager/i)
        .click();
    });

  it("Edit", () => {
//    cy.get("button[title=edit]")
//      .click();
    cy.findRoleByText("listitem", "Dadior")
      .find("button[title=edit]")
      .click();
    cy.contains("User Detail");
    cy.findInputByLabel("First Name")
      .type("Dadior2");
    cy.contains(/save/i)
      .click();
    cy.contains("User Detail").should("not.visible");
  });

  });

});
