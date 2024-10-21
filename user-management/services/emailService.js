const { sendMail } = require('../helpers/mailer');

const sendAccountCreationEmail = async (userData, password) => {
    const content = `
        <p>Hi <b>${userData.name}</b>,</p>
        <p>Your account has been created. Below are your details:</p>
        <table style="border-style:none;">
            <tr>
                <th>Name:</th>
                <td>${userData.name}</td>
            </tr>
            <tr>
                <th>Email:</th>
                <td>${userData.email}</td>
            </tr>
            <tr>
                <th>Password:</th>
                <td>${password}</td>
            </tr>
        </table>
        <p>You can now log into your account. Thanks!</p>
    `;

    try {
        await sendMail(userData.email, 'Account Created', content);
        console.log('Account creation email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendAccountCreationEmail};
