import { mount } from 'cypress-react-unit-test'
import React from 'react'
import {Planter} from "../../src/components/Planters.js";

describe.skip('HelloWorld component', () => {
  it('works', () => {
    mount(<Planter planter={{}} />)
    // now use standard Cypress commands
    cy.contains('Hello World!').should('be.visible')
  })
})
