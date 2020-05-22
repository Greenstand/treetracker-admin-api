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

    return result
    //}}}
  }
}
