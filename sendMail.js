const nodemailer = require('nodemailer');
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

// See, https://gist.github.com/neguse11/bc09d86e7acbd6442cd4
//      https://developers.google.com/oauthplayground/

const clientId = '<YOUR CLIENT KEY>';
const clientSecret = '<YOUR CLIENT SECRET>';
const refreshToken = '<YOUR REFRESHTOKEN>';
const accessToken = '<YOUR ACCESSTOKEN>';

const config = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        clientId,
        clientSecret,
    }
};

let transporter = nodemailer.createTransport(config);

function sendMail({from, to, subject, text, html, attachments}, callback) {
    let mailOptions = {
        from,
        to,
        subject,
        text,
        html,
        attachments,
    };

    const authOptions = {
        user: '<YOUR ADDRESS>',
        refreshToken,
        accessToken,
        expires: 1484314697598
    };

    mailOptions = Object.assign({}, mailOptions, {auth: authOptions });

    transporter.sendMail(mailOptions, (err, res) => {
        if (err) {
            return console.log(err);
        }
        console.log('Message sent: ', res);
        callback();
        transporter.close();
    });
}

module.exports = sendMail;

/*
 * test1: パラメータから宛先、タイトル、本文を受け取り、sendMailする
 */
const sendMailSpy = sinon.stub(transporter, 'sendMail');

const targetMock = {
    from: 'from@example.com',
    to: 'test@example.com',
    subject: 'trial',
    text: 'body',
    html: '<p>body</p>',
    attachments: [
        {
            filename: 'test.txt',
            content: 'hello test',
        }
    ],
};

const callback = sinon.spy();
sendMail(targetMock, callback);
expect(sendMailSpy.args[0][0].from).to.equal(targetMock.from);
expect(sendMailSpy.args[0][0].to).to.equal(targetMock.to);
expect(sendMailSpy.args[0][0].subject).to.equal(targetMock.subject);
expect(sendMailSpy.args[0][0].text).to.equal(targetMock.text);
expect(sendMailSpy.args[0][0].html).to.equal(targetMock.html);
expect(sendMailSpy.args[0][0].attachments).to.deep.equal(targetMock.attachments);
expect(sendMailSpy.args[0][0]).to.include(targetMock);


/*
 * test2: 成功したらコールバック処理を行う
 */
logSpy = sinon.stub(console, 'log');
sendMailSpy.callArgWith(1, undefined, 'test!');
expect(logSpy).to.have.been.calledWith('Message sent: ', 'test!');
expect(callback).to.have.been.called;

/*
 * test3: 失敗したらコールバック処理を行う
 */

sendMailSpy.callArgWith(1, 'error!', undefined);
expect(logSpy).to.have.been.calledWith('error!');

logSpy.restore();

/*
 * test4: 引数にとったファイルをメールに添付する
 */
expect(sendMailSpy.args[0][0].hasOwnProperty('attachments')).to.equal(true);

sendMailSpy.restore();
