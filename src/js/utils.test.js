const { utils } = require('./utils');

describe('Utils', () => {
  it('convertCamel', () => {
    const obj = {
      first_name: 'a',
      created_at: 'b',
    };
    const result = utils.convertCamel(obj);
    expect(result).toHaveProperty('firstName');
  });

  it('convertDB', () => {
    const obj = {
      firstName: 'a',
      createdAt: 'b',
    };
    const result = utils.convertDB(obj);
    expect(result).toHaveProperty('first_name');
    expect(result).toHaveProperty('created_at');
  });

  it('update fields', () => {
    const obj = {
      id: 0,
      firstName: 'a',
      lastName: 'b',
      role: [1, 2],
    };
    const result = utils.buildUpdateFields(obj);
    expect(result).toMatch(/first_name = 'a'\s+,\s+last_name = 'b'/);
    //expect(result).toMatch(/where\s+id\s*=\s*\d+/);
    console.log(result);
  });

  it('insert fields', () => {
    const obj = {
      id: 0,
      firstName: 'a',
      lastName: 'b',
      role: [1, 2],
    };
    const result = utils.buildInsertFields(obj);
    expect(result).toMatch(/first_name\s*,\s*last_name/);
    expect(result).toMatch(/'a'/);
    expect(result).toMatch(/'b'/);
    //expect(result).toMatch(/where\s+id\s*=\s*\d+/)
    console.log(result);
  });
});
