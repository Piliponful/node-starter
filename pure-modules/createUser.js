const shortUUID = require('short-uuid')
const config = require('config')

const logger = require('../logger')
const userFunctions = require('../entities/user')

const createUser = async ({ DBFunctions, sgMail }, { firstname, lastname, email, tenantAdmin, tenantName, message, JWT }) => {
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

module.exports = { createUser }
