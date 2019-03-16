const sgMail = require('@sendgrid/mail')
const config = require('config')
const shortUUID = require('short-uuid')
const { ObjectID } = require('mongodb')

const logger = require('../logger')

sgMail.setApiKey(config.email.API_KEY)

const createUserFunctions = ({ tenantEntity, userEntity }) => {
  const getUsers = async ({ limit, skip, tenantId }) => {
    let query = { deleted: false }

    if (tenantId) {
      if (!ObjectID.isValid(tenantId)) {
        return { errors: ['tenantId is invalid'] }
      }

      const { errors: findTenantErrors, value: [tenant] = [] } = await tenantEntity.find({ _id: ObjectID(tenantId) })

      if (findTenantErrors.length) {
        return { errors: findTenantErrors }
      }

      if (!tenant) {
        return { errors: [`Tenant wasn't found`] }
      }

      if (tenant.deleted) {
        return { errors: [`Tenant deleted`] }
      }

      query['tenantId'] = tenantId
    }

    return userEntity.find(query, limit, skip, { password: 0 })
  }

  const getUserById = async ({ userId }) => {
    const { errors: findUserErrors, value: [user] = [] } = await userEntity.find({ _id: ObjectID(userId) })

    if (findUserErrors.length) {
      return { errors: findUserErrors }
    }

    if (user) {
      return { errors: ['User wasn\'t found'] }
    }

    if (user.deleted) {
      return { errors: ['User deleted'] }
    }

    return { errors: [], value: user }
  }

  const updateUserById = ({ userId, fieldsToUpdate }) => userEntity.update({ _id: ObjectID(userId) }, { $set: fieldsToUpdate })

  const deleteUserById = ({ userId }) => userEntity.update({ _id: ObjectID(userId) }, { $set: { deleted: true } })

  const createUser = async ({ user, firstname, lastname, email, tenantAdmin, tenantName, message = '' }) => {
    if (user.tenantAdmin && user.rootAdmin) {
      return { errors: ['You don\'t have the permission to create users'] }
    }

    if (!user.rootAdmin && tenantAdmin) {
      return { errors: ['You don\'t have the permission to create tenant admin'] }
    }

    if (user.rootAdmin && tenantAdmin) {
      const { errors: findTenantErrors, value: [tenant] = [] } = await tenantEntity.find({ name: tenantName })

      if (findTenantErrors.length) {
        return { errors: findTenantErrors }
      }

      if (tenant) {
        return { errors: [`Tenant with ${tenantName} already exists`] }
      }

      const { errors: tenantCreationErrors } = await tenantEntity.create({ name: tenantName })

      if (tenantCreationErrors.length) {
        return { errors: tenantCreationErrors }
      }
    }

    const { errors: findTenantErrors, value: [tenant] = [] } = await tenantEntity.find({ name: tenantName })

    if (findTenantErrors.length) {
      return { errors: findTenantErrors }
    }

    if (!tenant) {
      return { errors: ['Tenant doesn\'t exist'] }
    }

    if (user.tenantAdmin && user.tenantId !== tenant._id.toString()) {
      return { errors: ['You can create users only for tenant you\'re an admin of'] }
    }

    const finishRegistrationCode = shortUUID.generate()
    const userCreationRes = await userEntity.create({
      email,
      finishRegistrationCode,
      firstname,
      lastname,
      tenant: tenant,
      tenantAdmin,
      tenantId: tenant._id.toString()
    })

    if (!userCreationRes.value) {
      return userCreationRes
    }

    const msg = {
      to: email,
      from: `${user.firstname} ${user.lastname} <${user.email}>`,
      subject: '[Arial Point]: Finish registration process',
      text: message + (message && '\n' + '\n' + '\n') + `link to finish registration, do not share it with anyone - ${config.app.URL}/user-registration?code=${finishRegistrationCode}`
    }

    try {
      await sgMail.send(msg)
      return { errors: [], value: finishRegistrationCode }
    } catch (error) {
      logger.error(error, 'Email invite hasn\'t been sent due to error, post /user')
      return { errors: ['Internal server error has occured'] }
    }
  }

  const finishUserRegistration = async ({ finishRegistrationCode, additionalFields }) =>
    userEntity.updateWithAdditionalFilds(finishRegistrationCode, additionalFields)

  const login = async ({ password, email }) => {
    const { errors: passwordMatchErrors, value: passwordMatch } = await userEntity.doesPasswordMatch(email, password)

    if (passwordMatchErrors.length) {
      return { errors: passwordMatchErrors }
    }

    if (!passwordMatch) {
      return { errors: ['Your password doesn\'t match'] }
    }

    const getJWTFromUserRes = await userEntity.getJWTFromUser(email)

    return getJWTFromUserRes
  }

  return {
    getUsers,
    getUserById,
    createUser,
    finishUserRegistration,
    login,
    deleteUserById,
    updateUserById
  }
}

module.exports = { createUserFunctions }
