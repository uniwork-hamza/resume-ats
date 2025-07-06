import Joi from 'joi';

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
    name: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
    }),
    avatarUrl: Joi.string().uri().optional().messages({
      'string.uri': 'Avatar URL must be a valid URL',
    }),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'New password must be at least 6 characters long',
      'any.required': 'New password is required',
    }),
  }),
};

// Resume validation schemas (matching frontend structure)
export const resumeSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(100).required().messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 100 characters',
      'any.required': 'Title is required',
    }),
    type: Joi.string().valid('form', 'file').required().messages({
      'any.only': 'Type must be either "form" or "file"',
      'any.required': 'Type is required',
    }),
    content: Joi.alternatives().conditional('type', {
      is: 'form',
      then: Joi.object({
        name: Joi.string().required().messages({
          'any.required': 'Name is required',
        }),
        email: Joi.string().email().required().messages({
          'string.email': 'Please provide a valid email',
          'any.required': 'Email is required',
        }),
        phone: Joi.string().required().messages({
          'any.required': 'Phone is required',
        }),
        summary: Joi.string().required().messages({
          'any.required': 'Summary is required',
        }),
        experience: Joi.array().items(
          Joi.object({
            company: Joi.string().required(),
            position: Joi.string().required(),
            duration: Joi.string().required(),
            description: Joi.string().required(),
          })
        ).min(1).required(),
        education: Joi.array().items(
          Joi.object({
            institution: Joi.string().required(),
            degree: Joi.string().required(),
            year: Joi.string().required(),
            gpa: Joi.string().allow('').optional(),
          })
        ).min(1).required(),
        skills: Joi.string().required().messages({
          'any.required': 'Skills are required',
        }),
      }).required(),
      otherwise: Joi.any().optional(), // For file uploads, content might be processed later
    }),
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(100).optional().messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 100 characters',
    }),
    type: Joi.string().valid('form', 'file').optional(),
    content: Joi.object().optional(),
    isActive: Joi.boolean().optional(),
  }),
};

// Job description validation schemas (matching frontend structure)
export const jobSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).optional().messages({
      'string.min': 'Job title cannot be empty',
      'string.max': 'Job title cannot exceed 200 characters',
    }),
    description: Joi.string().min(50).required().messages({
      'string.min': 'Job description must be at least 50 characters long',
      'any.required': 'Job description is required',
    }),
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().min(50).optional(),
    isActive: Joi.boolean().optional(),
  }),
};

// Analysis validation schemas
export const analysisSchemas = {
  create: Joi.object({
    resumeId: Joi.string().uuid().required().messages({
      'string.uuid': 'Resume ID must be a valid UUID',
      'any.required': 'Resume ID is required',
    }),
    jobDescId: Joi.string().uuid().required().messages({
      'string.uuid': 'Job description ID must be a valid UUID',
      'any.required': 'Job description ID is required',
    }),
  }),
};

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
    next();
  };
};

// Query validation middleware
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
    next();
  };
};

// Params validation middleware
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
    next();
  };
}; 