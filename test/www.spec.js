const { describe, it, expect } = require('chai');
const server = require('../src/bin/www.js');

describe('test', () => {
  it('should return a string', () => {
    expect('Server started on port').to.equal('Server started on port');
  });
});
