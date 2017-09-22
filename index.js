const sendMail = require('./sendMail');

exports.handler = (event, context) => {

    // eventから情報を獲得する
    const config = {};

    sendMail(config, () => {
        context.succeed('Mail has been successfuly sent.');
    });
};