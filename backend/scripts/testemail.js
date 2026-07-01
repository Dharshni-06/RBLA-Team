// Architect: SP
require('dotenv').config();
const { sendOtpEmail } = require('../utils/email');

const testEmail = async () => {
  try {
    await sendOtpEmail('2301722049020@mcc.edu.in', '123456');
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testEmail();
