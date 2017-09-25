const mailer = require('./sendMail');
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

exports.handler = (event, context, callback) => {

    // eventから情報を獲得する
    const params = event.params;

    mailer.sendMail(params, (err, data) => {
        if (err) {
            return callback(err);
        }
        context.succeed('Mail has been successfully sent.');
        callback(null, data);
    });
};

/*
 * test 1:  ライブラリの`sendMail`が呼び出される
 */
const context = {};
context.succeed = sinon.spy();
const callbackSpy = sinon.spy();
const sendMailStub = sinon.stub(mailer, 'sendMail');

exports.handler({params: 123}, context, callbackSpy);
expect(sendMailStub).to.have.been.called;

/*
 * test 2: sendMailが成功すれば、コールバックが呼ばれ、dataが引数に渡される
 *       : ログ出力処理 `context.succeed` が呼び出される
 */
sendMailStub.callArgWith(1, null, {test: 'success'});
expect(callbackSpy).to.have.been.calledWith(null, {test: 'success'});
expect(context.succeed).to.have.been.calledWith(`Mail has been successfully sent.`);
/*
 * test 3: sendMailが失敗すれば、コールバックが呼ばれ、errが引数に渡される
 */
sendMailStub.callArgWith(1, {test: 'error'});
expect(callbackSpy).to.have.been.calledWith({test: 'error'});

/*
 * test 4: params = { param: 123 } のとき、 `sendMail`に {}が渡される
 */
expect(sendMailStub).to.have.been.calledWith(123);

