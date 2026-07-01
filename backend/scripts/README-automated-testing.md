# RBLA5 Automated Testing Scripts

This directory contains scripts to automate the testing of the RBLA5 e-commerce platform. The tests simulate a complete user journey from login to placing orders, making payments, and leaving reviews.

## Setup

1. Navigate to the automated-testing directory:
```bash
cd backend/scripts/automated-testing
```

2. Install dependencies:
```bash
npm install
```

## Configuration

All test settings are in the `config.js` file:

- **API_URL**: The base URL of your API (default: http://localhost:5000/api)
- **TEST_USER**: Credentials for the test user (email, password, name)
- **BULK_ORDER_COUNT**: Number of products to order in each test run (default: 25)
- **OPERATION_DELAY**: Delay between operations in milliseconds (default: 1000)
- **PAYMENT**: Payment configuration for Braintree sandbox
- **REVIEW_TEMPLATE**: Template for product reviews

## Running Tests

To run the automated tests:

```bash
npm test
```

## What the Tests Do

1. **Login**: Logs in with the configured user credentials
2. **Add Products to Cart**: Randomly selects products and adds them to the cart
3. **Process Payment**: Simulates a payment using Braintree sandbox
4. **Create Order**: Creates an order with the items in the cart
5. **Add Reviews**: Adds reviews for all purchased products

## Customizing Tests

You can modify different aspects of the tests:

- To change the number of products ordered, update `BULK_ORDER_COUNT` in config.js
- To adjust the delay between operations, update `OPERATION_DELAY` in config.js
- To modify the review content, update `REVIEW_TEMPLATE` in config.js

## Notes

- The test user account must already exist in the system
- The server must be running before executing tests
- For payment testing, a Braintree sandbox environment is used

## Troubleshooting

- If login fails, verify that the credentials in `config.js` are correct
- If product retrieval fails, ensure the products API endpoint is working
- If payment processing fails, check that the Braintree configuration is correct
