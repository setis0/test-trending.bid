import {config} from "dotenv";
import {join} from "path";
import {getBalance, getToken} from "./browser";
import {use, expect, request, should} from 'chai'
import chaiHttp from 'chai-http'
should()
use(chaiHttp);
// config({path: join(__dirname, "../.env"), debug: true, override: true})
const {app} = require('./app');
describe('http server', function () {
    before(done => {
        app.listen(process.env.PORT,process.env.HOST,done)
    })

    it('auth', function (done) {
        this.timeout(30e3)
        request(app)
            .post('/auth')
            .send({
                      login: process.env.TEST_LOGIN as string,
                      password: process.env.TEST_PASSWORD as string
                  })
            .end(function (err, res) {
                if (err) return done(err);
                res.should.have.status(200);
                res.body.should.have.property('action').eq('auth');
                res.body.should.have.property('status').eq(true);
                done();
            });
    });
    it('balance', function (done) {
        this.timeout(30e3)
        request(app)
            .get('/balance')
            .query({
                       login: process.env.TEST_LOGIN
                   })
            .end(function (err, res) {
                if (err) return done(err);
                res.should.have.status(200);
                res.body.should.have.property('action').eq('balance');
                res.body.should.have.property('status').eq(true);
                res.body.should.have.property('result').haveOwnProperty('balance')
                res.body.should.have.property('result').haveOwnProperty('currency')
                done();
            })
    });
});
