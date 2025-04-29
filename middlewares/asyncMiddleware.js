/**
 *  Purpose: To handle async functions in routes to avoid try-catch blocks
 *
 *  Usage: import asyncHandler from 'path/to/asyncMiddleware.js'
 *   router.get('/', asyncHandler(async (req, res) => {
 *      // code here
 *   }))
 *
 */

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
