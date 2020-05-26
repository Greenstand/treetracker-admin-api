/*
 * A simple model for tree filter
 */

export default class Filter {

  constructor(options) {
    Object.assign(this, options)
  }

  getBackloopString() {
    //{{{
    let result = ''

    if (this.personId) {
      result += `&filter[where][personId]=${this.personId}`
    }

    if (this.id) {
      result += `&filter[where][id]=${this.id}`
    }

    if (this.firstName) {
      result += `&filter[where][firstName]=${this.firstName}`
    }

    if (this.lastName) {
      result += `&filter[where][lastName]=${this.lastName}`
    }

    return result
    //}}}
  }
}
