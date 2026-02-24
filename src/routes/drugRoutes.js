const express = require('express');
const router = express.Router();
const drugController = require('../controllers/drugController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes here require a Token (Login)
router.use(authMiddleware);


//POST /api/drugs -> Add a drug
// (Restricted: Only Store Keeper & Admin)
router.post('/', roleMiddleware(['storekeeper', 'admin']), drugController.addDrug);

//PUT /api/drugs/:id -> Update a drug
// (Restricted: Only Store Keeper & Admin)
router.put('/:id', roleMiddleware(['storekeeper', 'admin']), drugController.updateDrug);

// GET /api/drugs -> See all drugs
router.get('/', drugController.getDrugs);


//DELETE /api/drugs/:id -> Delete a drug
// (Restricted: ADMIN ONLY - Safety Feature)
router.delete('/:id', roleMiddleware(['admin']), drugController.deleteDrug);

module.exports = router;