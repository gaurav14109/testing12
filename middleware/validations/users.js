const joi = require("joi");

const userSchema = joi.object({
  vertical_name: joi.string(),
  pf_no: joi.string().required(),
  email: joi.string().required(),
  employee_name: joi.string().required(),
  branch: joi.string().required(),
  createdBy: joi.string().required(),
  role_name: joi.string().required(),
  updated_by:joi.string().required(),
  adminDetails:joi.object(),
  sol:joi.string().required(),
});

const updateUserSchema = joi.object({
  vertical_name: joi.string().required(),
  pf_no: joi.string().required(),
  email: joi.string().required(),
  employee_name: joi.string().required(),
  branch: joi.string().required(),
  createdBy: joi.string().required(),
  role_name: joi.string().required(),
  updated_by: joi.string().required(),
  user_id:joi.number().required(),
  created_date:joi.string(),
  last_updated_date:joi.string(),
  active:joi.boolean().required(),
  sol:joi.string(),
  adminDetails:joi.object(),
});

const userSearch = joi.object({
    pfNo:joi.string().required()
});

module.exports = { userSchema, updateUserSchema,userSearch };