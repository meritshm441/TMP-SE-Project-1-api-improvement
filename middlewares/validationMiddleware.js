import { BAD_REQUEST } from "../constant/http.js";

/**
 * This middleware is used to validate the request body using Zod schema
 */
const validateRequestBody = (schema) => async (req, res, next) => {
  try {
    const validatedRequestBody = schema.parse(req.body);

    req.body = validatedRequestBody;

    next();
  } catch (error) {
    res.status(BAD_REQUEST).json({
      success: false,
      errors: error.errors.map((err) => {
        return {
          message: err.message,
        };
      }),
    });
  }
};

export default validateRequestBody;
