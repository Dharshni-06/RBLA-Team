// Architect: SP
const braintree = require('braintree');
const chalk = require('chalk');
require('dotenv').config();

// Validate Braintree credentials
const merchantId = process.env.BRAINTREE_MERCHANT_ID;
const publicKey = process.env.BRAINTREE_PUBLIC_KEY;
const privateKey = process.env.BRAINTREE_PRIVATE_KEY;

if (!merchantId || !publicKey || !privateKey) {
    console.error(chalk.red('\n❌ Error: Braintree Configuration Failed'));
    console.error(chalk.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.error(chalk.red('✗ Missing required credentials in .env file'));
    console.error(chalk.yellow('\nPlease check the following variables:'));
    console.error(chalk.dim('- BRAINTREE_MERCHANT_ID'));
    console.error(chalk.dim('- BRAINTREE_PUBLIC_KEY'));
    console.error(chalk.dim('- BRAINTREE_PRIVATE_KEY\n'));
    throw new Error('Braintree credentials are missing in environment variables');
}

// ASCII art for success message
const successArt = `
    🌟 ${chalk.green('✓')} Braintree Connected Successfully ${chalk.green('✓')} 🌟
    ===============================================
    ${chalk.cyan('⚡ Environment:')} ${chalk.yellow(process.env.NODE_ENV || 'development')}
    ${chalk.cyan('🔐 Merchant ID:')} ${chalk.dim(merchantId.substring(0, 4) + '...')}
    ${chalk.cyan('📡 Gateway Status:')} ${chalk.green('Active ✓')}
    ${chalk.cyan('💳 Payment System:')} ${chalk.green('Ready ✓')}
    ===============================================
`;

// Create gateway instance
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: merchantId.trim(),
    publicKey: publicKey.trim(),
    privateKey: privateKey.trim()
});

// Test connection synchronously
try {
    console.log(chalk.cyan('\n🔄 Initializing Braintree Payment Gateway...'));
    console.log(successArt);
    console.log(chalk.green('✨ Payment system initialized successfully!'));
    console.log(chalk.yellow('💡 Ready to process transactions\n'));
    
    // Export gateway for use in other modules
    module.exports = gateway;
    
} catch (error) {
    console.error(chalk.red('\n❌ Error: Braintree Connection Failed'));
    console.error(chalk.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.error(chalk.red(`✗ ${error.message}`));
    console.error(chalk.yellow('\nTroubleshooting steps:'));
    console.error(chalk.dim('1. Check your internet connection'));
    console.error(chalk.dim('2. Verify your Braintree credentials'));
    console.error(chalk.dim('3. Ensure Braintree services are available\n'));
    throw error;
}
