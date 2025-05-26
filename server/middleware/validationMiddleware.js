const Joi = require("joi");
const responseFormatter = require("../utils/responseFormatter");

// Schemas for various routes
const schemas = {
  auth: {
    register: Joi.object({
      name: Joi.string().min(2).max(50).required().messages({
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name cannot exceed 50 characters",
        "any.required": "Name is required",
      }),
      email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email",
        "any.required": "Email is required",
      }),
      password: Joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
        "any.required": "Password is required",
      }),
    }),
    login: Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email",
        "any.required": "Email is required",
      }),
      password: Joi.string().required().messages({
        "any.required": "Password is required",
      }),
      turnstileToken: Joi.string().allow("", null),
    }),
    verifyEmail: Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email",
        "any.required": "Email is required",
      }),
      otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
          "string.length": "OTP must be 6 digits",
          "string.pattern.base": "OTP must contain only numbers",
          "any.required": "OTP is required",
        }),
    }),
    forgotPassword: Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email",
        "any.required": "Email is required",
      }),
    }),
    resetPassword: Joi.object({
      password: Joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
        "any.required": "Password is required",
      }),
    }),
    updatePassword: Joi.object({
      currentPassword: Joi.string().required().messages({
        "any.required": "Current password is required",
      }),
      newPassword: Joi.string().min(6).required().messages({
        "string.min": "New password must be at least 6 characters",
        "any.required": "New password is required",
      }),
    }),
  },
  anime: {
    search: Joi.object({
      q: Joi.string().min(1).required().messages({
        "string.min": "Search query must not be empty",
        "any.required": "Search query is required",
      }),
      page: Joi.number().integer().min(1).default(1).messages({
        "number.base": "Page must be a number",
        "number.integer": "Page must be an integer",
        "number.min": "Page must be at least 1",
      }),
      type: Joi.string()
        .valid("tv", "ova", "movie", "special", "ona", "music")
        .messages({
          "any.only":
            "Type must be one of: tv, ova, movie, special, ona, music",
        }),
      score: Joi.number().min(1).max(10).messages({
        "number.min": "Score must be at least 1",
        "number.max": "Score cannot exceed 10",
      }),
      status: Joi.string().valid("airing", "complete", "upcoming").messages({
        "any.only": "Status must be one of: airing, complete, upcoming",
      }),
      genre: Joi.array().items(Joi.string()).messages({
        "array.base": "Genres must be an array",
      }),
      demographic: Joi.string().messages({
        "string.base": "Demographic must be a string",
      }),
      adult: Joi.boolean().default(false).messages({
        "boolean.base": "Adult flag must be a boolean",
      }),
      startDate: Joi.date().iso().messages({
        "date.base": "Start date must be a valid date",
        "date.format": "Start date must be in ISO format (YYYY-MM-DD)",
      }),
      endDate: Joi.date().iso().min(Joi.ref("startDate")).messages({
        "date.base": "End date must be a valid date",
        "date.format": "End date must be in ISO format (YYYY-MM-DD)",
        "date.min": "End date must be after or equal to start date",
      }),
    }),
  },
  watchlist: {
    addItem: Joi.object({
      animeId: Joi.string().required().messages({
        "any.required": "Anime ID is required",
      }),
      title: Joi.string().required().messages({
        "any.required": "Title is required",
      }),
      imageUrl: Joi.string().uri().allow("", null).messages({
        "string.uri": "Image URL must be a valid URI",
      }),
      status: Joi.string()
        .valid("plan_to_watch", "watching", "completed", "on_hold", "dropped")
        .default("plan_to_watch")
        .messages({
          "any.only":
            "Status must be one of: plan_to_watch, watching, completed, on_hold, dropped",
        }),
      totalEpisodes: Joi.number().integer().min(0).allow(null).messages({
        "number.base": "Total episodes must be a number",
        "number.integer": "Total episodes must be an integer",
        "number.min": "Total episodes cannot be negative",
      }),
    }),
    updateItem: Joi.object({
      status: Joi.string()
        .valid("plan_to_watch", "watching", "completed", "on_hold", "dropped")
        .messages({
          "any.only":
            "Status must be one of: plan_to_watch, watching, completed, on_hold, dropped",
        }),
      rating: Joi.number().min(0).max(10).messages({
        "number.min": "Rating must be at least 0",
        "number.max": "Rating cannot exceed 10",
      }),
      episodesWatched: Joi.number().integer().min(0).messages({
        "number.base": "Episodes watched must be a number",
        "number.integer": "Episodes watched must be an integer",
        "number.min": "Episodes watched cannot be negative",
      }),
      notes: Joi.string().allow("", null).messages({
        "string.base": "Notes must be a string",
      }),
    }),
  },
};

/**
 * Validate request against schema
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        path: detail.path.join("."),
        message: detail.message,
      }));

      return responseFormatter.error(
        res,
        400,
        "Validation Error",
        errorDetails
      );
    }

    next();
  };
};

module.exports = {
  schemas,
  validate,
};
