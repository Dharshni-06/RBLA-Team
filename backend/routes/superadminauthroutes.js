// Architect: SP
// backend/routes/superadminauthroutes.js
const express = require('express');
const { loginSuperadmin } = require('../controllers/superadmin/superadmincontroller');
const router = express.Router();

// Superadmin login route
router.post('/login', loginSuperadmin);

module.exports = router;
