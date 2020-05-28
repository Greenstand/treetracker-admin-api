
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

    it("in", () => {
      cy.contains(/add user/i);
    });

  });

});
