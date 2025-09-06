const express = require('express');
const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  getGoalsSummary
} = require('../controllers/goalController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Routes
router.route('/')
  .get(getGoals)      // GET /api/goals
  .post(createGoal);  // POST /api/goals

router.route('/summary')
  .get(getGoalsSummary); // GET /api/goals/summary

router.route('/:id')
  .get(getGoal)       // GET /api/goals/:id
  .put(updateGoal)    // PUT /api/goals/:id
  .delete(deleteGoal); // DELETE /api/goals/:id

router.route('/:id/progress')
  .put(updateGoalProgress); // PUT /api/goals/:id/progress

module.exports = router;
