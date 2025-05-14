const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');

// Get all salary records
router.get('/', salaryController.getAllSalaryRecords);

// Get a specific salary record by employeeId
router.get('/:id', salaryController.getSalaryRecordById);

// Create a new salary record
router.post('/', salaryController.addSalaryRecord);

// Update a salary record by employeeId
router.put('/:id', salaryController.updateSalaryRecord);

module.exports = router;