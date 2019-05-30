const sgMail = require('@sendgrid/mail')
const config = require('config')
const shortUUID = require('short-uuid')
const { ObjectID } = require('mongodb')

const userFunctions = require('../entities/user')

const logger = require('../logger')

const find = async ({ DBFunctions }, { limit, skip, tenantId }) => {
  const { tenant, user } = DBFunctions

  let query = { deleted: false }

  if (tenantId) {
    if (!ObjectID.isValid(tenantId)) {
      return { errors: ['tenantId is invalid'] }
    }

    const { errors: findTenantErrors, value: [tenantDoc] = [] } = await tenant.find({ _id: ObjectID(tenantId) })

    if (findTenantErrors.length) {
      return { errors: findTenantErrors }
    }

    if (!tenantDoc) {
      return { errors: [`Tenant wasn't found`] }
    }

    if (tenantDoc.deleted) {
      return { errors: [`Tenant deleted`] }
    }

    query['tenantId'] = tenantId
  }

  return user.find(query, limit, skip, { password: 0 })
}

const findById = async ({ DBFunctions }, { userId }) => {
  const { user } = DBFunctions

  const { errors: findUserErrors, value: [userDoc] = [] } = await user.find({ _id: ObjectID(userId) })

  if (findUserErrors.length) {
    return { errors: findUserErrors }
  }

  if (userDoc) {
    return { errors: ['User wasn\'t found'] }
  }

  if (userDoc.deleted) {
    return { errors: ['User deleted'] }
  }

  return { errors: [], value: user }
}

const updateById = ({ DBFunctions: { user } }, { userId, fieldsToUpdate }) => user.update({ _id: ObjectID(userId) }, { $set: fieldsToUpdate })

const deleteById = ({ DBFunctions: { user } }, { userId }) => user.update({ _id: ObjectID(userId) }, { $set: { deleted: true } })

const create = async ({ DBFunctions }, { firstname, lastname, email, tenantAdmin, tenantName, message, JWT }) => {
  const { tenant, user } = DBFunctions

  const { errors, value: caller } = userFunctions.JWTToUser(DBFunctions, { JWT })

  if (errors) {
    return { errors }
  }

  if (caller.tenantAdmin && caller.rootAdmin) {
    return { errors: ['You don\'t have the permission to create users'] }
  }

  if (!caller.rootAdmin && tenantAdmin) {
    return { errors: ['You don\'t have the permission to create tenant admin'] }
  }

  if (caller.rootAdmin && tenantAdmin) {
    const { errors: findTenantErrors, value: [tenantDoc] = [] } = await tenant.find({ name: tenantName })

    if (findTenantErrors.length) {
      return { errors: findTenantErrors }
    }

    if (tenantDoc) {
      return { errors: [`Tenant with ${tenantName} already exists`] }
    }

    const { errors: tenantCreationErrors } = await tenant.create({ name: tenantName })

    if (tenantCreationErrors.length) {
      return { errors: tenantCreationErrors }
    }
  }

  const { errors: findTenantErrors, value: [tenantDoc] = [] } = await tenant.find({ name: tenantName })

  if (findTenantErrors.length) {
    return { errors: findTenantErrors }
  }

  if (!tenantDoc) {
    return { errors: ['Tenant doesn\'t exist'] }
  }

  if (caller.tenantAdmin && caller.tenantId !== tenant._id.toString()) {
    return { errors: ['You can create users only for tenant you\'re an admin of'] }
  }

  const finishRegistrationCode = shortUUID.generate()
  const userCreationRes = await user.create({
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
    from: `${caller.firstname} ${caller.lastname} <${caller.email}>`,
    subject: '[Arial Point]: Finish registration process',
    text: message + (message && '\n' + '\n' + '\n') + `link to finish registration, do not share it with anyone - ${config.app.URL}/user-registration?code=${finishRegistrationCode}`
  }

  try {
    sgMail.setApiKey(config.email.API_KEY)
    await sgMail.send(msg)

    return { errors: [], value: finishRegistrationCode }
  } catch (err) {
    logger.error({ err, id: shortUUID() })

    return { errors: ['Internal server error has occured'] }
  }
}

const finishUserRegistration = async ({ DBFunctions: { user } }, { finishRegistrationCode, additionalFields }) =>
  user.updateWithAdditionalFilds(finishRegistrationCode, additionalFields)

const login = async ({ DBFunctions }, { password, email }) => {
  const { user } = DBFunctions

  const { errors: passwordMatchErrors, value: passwordMatch } = await user.doesPasswordMatch(email, password)

  if (passwordMatchErrors.length) {
    return { errors: passwordMatchErrors }
  }

  if (!passwordMatch) {
    return { errors: ['Your password doesn\'t match'] }
  }

  return user.getJWTFromUser(email)
}

module.exports = { create, find, findById, updateById, deleteById, finishUserRegistration, login }
