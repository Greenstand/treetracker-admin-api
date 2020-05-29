describe('Login', () => {
  before(() => {
    cy.visit('/')
    cy.contains(/Login/i)
    cy.findInputByLabel('username').type('dadiorchen')
    cy.findInputByLabel('password').type('123456')
    cy.contains(/login/i).click()
  })

  it('Login successfully', () => {
    cy.contains(/Welcome/i)
  })

  describe('User Manager', () => {
    beforeEach(() => {
      cy.contains(/user manager/i).click()
    })

    it('Edit', () => {
      //    cy.get("button[title=edit]")
      //      .click();
      cy.findRoleByText('listitem', 'Dadior').find('button[title=edit]').click()
      cy.contains('User Detail')
      cy.findInputByLabel('First Name').type('Dadior2')
      cy.findRoleByText('list', 'Roles').contains('Admin').should('not.visible')
      cy.findRoleByText('list', 'Selected').contains('Admin')
      cy.findRoleByText('list', 'Selected').contains('Tree Auditor').click()
      cy.contains('<').click()
      cy.contains(/save/i).click()
      cy.contains('User Detail').should('not.visible')
      cy.findRoleByText('listitem', 'Dadior2').contains('Tree Auditor').should('not.visible')
    })

    it("Password", () => {
      cy.findRoleByText('listitem', 'Dadior').find('button[title=\'generate password\']').click()
      cy.findInputByLabel(/please input/i)
        .type("abcdef");
      cy.contains("button","Generate")
        .click();
    })

    it("Create", () => {
      cy.contains(/add user/i).click();
      cy.contains(/user detail/i);
      cy.findInputByLabel('Username').type('ezra');
      cy.findInputByLabel('First Name').type('Ezra');
      cy.findInputByLabel('Last Name').type('David');
      cy.findInputByLabel('Email').type('ezra@gmail.com');
      cy.findRoleByText('list', 'Roles').contains('Admin')
        .click();
      cy.contains('>').click()
      cy.contains(/save/i).click()

    })
  })
})

describe.only('Login with bbb', () => {
  before(() => {
    cy.visit('/')
    cy.contains(/Login/i)
    cy.findInputByLabel('username').type('bbb')
    cy.findInputByLabel('password').type('123456')
    cy.contains(/login/i).click()
  })

  it('Login successfully', () => {
    cy.contains(/Welcome/i)
  })

  it.only("Test api, should be 401 or 200 cuz the role", () => {
    cy.request("GET", "http://localhost:3000/api/trees/count")
      .then(res => {
        expect(res.status).to.eq(200);
      });
    cy.request("GET", "http://localhost:3000/api/planter/count")
      .then(res => {
        expect(res.status).to.eq(401);
      });
  });

})
