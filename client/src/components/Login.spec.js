import { mount } from 'cypress-react-unit-test'
import React from 'react'
import Login from "./Login";

describe("Login", () => {
  it("Login", () => {
    mount(<Login/>);
    cy.contains("Login");
  });
});
