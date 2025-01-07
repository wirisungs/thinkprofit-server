const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const app = require('../src/index');

describe('Express App', () => {
  it('should return Hello World! on GET /', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal('Hello World!');
        done();
      });
  });

  // Additional test cases can be added here

  it('should return 404 on GET /unknown', (done) => {
    chai.request(app)
      .get('/unknown')
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

});
