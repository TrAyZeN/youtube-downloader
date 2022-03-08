import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { convert } from '../src/services/convert';
import { Format } from '../src/services/download';

chai.use(chaiAsPromised);

describe('Convert tests', () => {
  it('Should download the video', () => {
    return expect(convert('https://www.youtube.com/watch?v=0J2QdDbelmY', Format.Mp3))
      .to.not.be.rejected;
  }).timeout(30000);

  it('Should fail to retrieve video info', () => {
    return expect(convert('https://www.youtube.com/watch?v=fXgLARPpryc', Format.Mp3))
      .to.be.rejected;
  });
});
