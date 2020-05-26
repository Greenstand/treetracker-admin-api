
describe("Planter", () => {
  before(() => {
    cy.visit("/");
    cy.get("button[title=menu]")
      .click();
    cy.contains("Planters")
      .click();
  });

  it("Should get id:xxx", () => {
    cy.contains(/ID:\d+/);
  });

  it("Should be page 1", () => {
    cy.contains("button", "1").should("have.class", "Mui-selected");
  });

  describe.skip("Click page 2", () => {

    before(() => {
      cy.contains("2")
        .click();
    });

    it("Should get id:xxx", async () => {
      cy.contains(/ID:\d+/);
    });

    it("Should be page 2", () => {
      cy.contains("button", "2").should("have.class", "Mui-selected");
    });

  });

});
