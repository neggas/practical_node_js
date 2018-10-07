const boot = require('../app').boot;
const shutdown = require('../app').shutdown;
const port = require('../app').port;
const superagent = require('superagent');
const expect = require('expect.js');

// TODO: seed from the test and then clean up
const seedArticles = require('../db/articles.json');
// const seedUsers = require('../db/users.json');

describe('server', () => {
  before(() => {
    boot();
  });

  describe('homepage', () => {
    it('should respond to GET', (done) => {
      superagent
        .get(`http://localhost:${port}`)
        .end((err, res) => {
          expect(err).to.be(null);
          expect(res.status).to.equal(200);
          done();
        });
    });

    it('should contain posts', (done) => {
      superagent
        .get(`http://localhost:${port}`)
        .end((err, res) => {
          expect(err).to.be(null);
          seedArticles.forEach((item, index, list) => {
            let expected = `<h2><a href="/articles/${item.slug}">${item.title}`;
            if (item.published) {
              expect(res.text).to.contain(expected);
            } else {
              expect(res.text).not.to.contain(expected);
            }
          });
          done();
        });
    });
  });

  describe('article page', () => {
    it('should display text or 401', (done) => {
      let n = seedArticles.length;
      seedArticles.forEach((item, index, list) => {
        superagent
          .get(`http://localhost:${port}/articles/${seedArticles[index].slug}`)
          .end((error, res) => {
            if (item.published) {
              expect(error).to.be(null);
              expect(res.text).to.contain(seedArticles[index].text);
            } else {
              expect(error).to.be.ok;
              expect(res.status).to.be(401);
            }
            if (index + 1 === n) {
              done();
            }
          });
      });
    });
  });

  after(function() {
    shutdown();
  });
});