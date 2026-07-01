// Architect: SP
const express = require('express');
const router = express.Router();
const {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    filterCustomersByStore
} = require('../../controllers/superadmin/customersController');

// Search and filter routes
router.get('/search', searchCustomers);
router.get('/filter', filterCustomersByStore);

// CRUD routes
router
    .route('/')
    .get(getAllCustomers)
    .post(createCustomer);

router
    .route('/:id')
    .get(getCustomerById)
    .put(updateCustomer)
    .delete(deleteCustomer);

module.exports = router;
