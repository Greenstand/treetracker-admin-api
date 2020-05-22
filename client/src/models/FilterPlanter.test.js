import FilterPlanter from './FilterPlanter'

describe('Filter', () => {
  let filterPlanter

  beforeEach(() => {
    filterPlanter = new FilterPlanter({
      personId: 1,
    })
  })

  it('getBackloopString() should be: ', () => {
    expect(filterPlanter.getBackloopString()).toEqual(expect.stringContaining("&filter[where][personId]=1"));
  })
})
