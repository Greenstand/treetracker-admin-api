import { mount } from 'cypress-react-unit-test'
import React from 'react'
import { TreeTags } from "../../src/components/TreeTags.js";

describe('TreeTags component', () => {
  it('works', () => {
    mount(<TreeTags />)
    cy.contains('ChipInput').should('be.visible')
  })
})
