import Joi from "joi";

const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    shopname: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\d{10}$/).required(),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .message(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .required(),
    image: Joi.string().required(),
    address: Joi.object({
      localArea: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      pin: Joi.string().pattern(/^\d{6}$/).required(),
    }).required(),
    role: Joi.string().valid("user", "admin", "root").default("user"),
  });
  return schema.validate(data);

};

export { validateUser };


const updateUserValidater=(data)=>{
  const Test = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    shopname: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\d{10}$/).required(),
    password: Joi.string().min(8).required(),
    image: Joi.string().required(),
    address: Joi.object({
      localArea: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      pin: Joi.string().pattern(/^\d{6}$/).required(),
    }).required(),
    role: Joi.string().valid("user", "admin", "root").default("user"),
  });

  return Test.validate(data);
  

}

export {updateUserValidater}
