const finishUserRegistration = async ({ DBFunctions: { user } }, { finishRegistrationCode, additionalFields }) =>
  user.updateWithAdditionalFilds(finishRegistrationCode, additionalFields)

module.exports = { finishUserRegistration }
