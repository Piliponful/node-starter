const shortUUID = require('short-uuid')
const config = require('config')

const { getUserFromJWT } = require('./getUserFromJWT')
const { validateUser } = require('./validateUser')

const createUser = async ({
  withSideEffects: {
    db,
    sgMail
  },
  input: {
    firstname,
    lastname,
    email,
    tenantAdmin,
    tenantName,
    message,
    jwt
  }
}) => {
  const tenantCollection = db.collection('tenant')
  const userCollection = db.collection('user')

  const { errors, value: caller } = getUserFromJWT({ jwt })

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
    const { errors: findTenantErrors, value: [tenantDoc] = [] } = await tenantCollection.find({ name: tenantName })

    if (findTenantErrors.length) {
      return { errors: findTenantErrors }
    }

    if (tenantDoc) {
      return { errors: [`Tenant with ${tenantName} already exists`] }
    }

    const { errors: tenantCreationErrors } = await tenantCollection.create({ name: tenantName })

    if (tenantCreationErrors.length) {
      return { errors: tenantCreationErrors }
    }
  }

  const { errors: findTenantErrors, value: [tenantDoc] = [] } = await tenantCollection.find({ name: tenantName })

  if (findTenantErrors.length) {
    return { errors: findTenantErrors }
  }

  if (!tenantDoc) {
    return { errors: ['Tenant doesn\'t exist'] }
  }

  if (caller.tenantAdmin && caller.tenantId !== tenantDoc._id.toString()) {
    return { errors: ['You can create users only for tenant you\'re an admin of'] }
  }

  const finishRegistrationCode = shortUUID.generate()
  const userFields = {
    email,
    finishRegistrationCode,
    firstname,
    lastname,
    tenant: tenantDoc,
    tenantAdmin,
    tenantId: tenantDoc._id.toString()
  }

  const { errors: userValidationErrors, value: valid } = validateUser(userFields)

  if (valid) {
    const userCreationRes = await userCollection.insert(userFields)
    if (!userCreationRes.value) {
      return userCreationRes
    }

    const msg = {
      to: email,
      from: `${caller.firstname} ${caller.lastname} <${caller.email}>`,
      subject: '[Arial Point]: Finish registration process',
      text: message + (message && '\n' + '\n' + '\n') + `link to finish registration, do not share it with anyone - ${config.app.URL}/user-registration?code=${finishRegistrationCode}`
    }

    sgMail.setApiKey(config.email.API_KEY)
    await sgMail.send(msg)

    return { value: true }
  } else {
    return { errors: userValidationErrors }
  }
}

module.exports = { createUser }
