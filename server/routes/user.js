const createUserRouter = (userEntity, tenantEntity, auth) => {
  const Router = require('koa-router')
  const sgMail = require('@sendgrid/mail')
  const config = require('config')
  const shortUUID = require('short-uuid')
  const { ObjectId } = require('mongodb')

  const logger = require('../logger')

  sgMail.setApiKey(config.email.API_KEY)

  const router = new Router()

  router.get('/user', async ctx => {
    const { limit, skip, tenantId } = ctx.query

    let query = { deleted: false }

    if (tenantId) {
      if (!ObjectId.isValid(tenantId)) {
        ctx.body = { errors: ['The tenantId is invalid'] }
        return
      }

      const { errors: findTenantErrors, value: [tenant] = [] } = await tenantEntity.find({ _id: ObjectId(tenantId) })

      if (findTenantErrors.length) {
        ctx.body = { errors: findTenantErrors }
        return
      }

      if (!tenant) {
        ctx.body = { errors: [`Tenant with tenantId - ${tenantId} wasn't found`] }
        return
      }

      query['tenantId'] = tenantId
    }

    const users = await userEntity.find(query, limit, skip, { password: 0 })

    ctx.body = users
  })

  router.get('/user/:id', async ctx => {
    const { id } = ctx.params

    const { errors, value: user } = await userEntity.find({ _id: ObjectId(id) })

    if (errors.length) {
      ctx.body = { errors }
      return
    }

    if (user) {
      ctx.body = { errors: [`User with ${id} wasn't found`] }
      return
    }

    if (user.deleted) {
      ctx.body = { errors: [`User with ${id} was deleted`] }
      return
    }

    ctx.body = { errors: [], value: user }
  })

  router.patch('/user/:id', async ctx => {
    const { id } = ctx.params

    ctx.body = await userEntity.update({ _id: ObjectId(id) }, { $set: ctx.request.body })
  })

  router.delete('/user/:id', async ctx => {
    const { id } = ctx.params

    ctx.body = await userEntity.update({ _id: ObjectId(id) }, { $set: { deleted: true } })
  })

  router.post('/user', auth, async ctx => {
    logger.info(ctx.request.body, 'Starting registration process, post /user')

    const { firstname, lastname, email, tenantAdmin, tenantName, message = '' } = ctx.request.body

    if (!ctx.user.tenantAdmin && !ctx.user.rootAdmin) {
      ctx.body = { errors: ['You don\'t have the permission to create users'] }
      return
    }

    if (!ctx.user.rootAdmin && tenantAdmin) {
      ctx.body = { errors: ['You don\'t have the permission to create tenant admin'] }
      return
    }

    if (ctx.user.rootAdmin && tenantAdmin) {
      const { errors: findTenantErrors, value: [tenant] } = await tenantEntity.find({ name: tenantName })

      if (findTenantErrors.length) {
        ctx.body = { errors: findTenantErrors }
        return
      }

      if (tenant) {
        ctx.body = { errors: [`Tenant with ${tenantName} already exists`] }
        return
      }

      const { errors: tenantCreationErrors } = await tenantEntity.create({ name: tenantName })

      if (tenantCreationErrors.length) {
        ctx.body = { errors: tenantCreationErrors }
        return
      }
    }

    const { errors: findTenantErrors, value: [tenant] } = await tenantEntity.find({ name: tenantName })

    if (findTenantErrors.length) {
      ctx.body = { errors: findTenantErrors }
      return
    }

    if (!tenant) {
      ctx.body = { errors: [`Wasn't able to find tenant by the '${tenantName}' name`] }
      return
    }

    if (ctx.user.tenantAdmin && ctx.user.tenantId !== tenant._id.toString()) {
      ctx.body = { errors: ['You can create users only for tenant you\'re an admin of'] }
      return
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
      ctx.body = userCreationRes
      return
    }

    const msg = {
      to: email,
      from: `${ctx.user.firstname} ${ctx.user.lastname} <${ctx.user.email}>`,
      subject: '[Arial Point]: Finish registration process',
      text: message + (message && '\n' + '\n' + '\n') + `link to finish registration, do not share it with anyone - ${config.app.URL}/user-registration?code=${finishRegistrationCode}`
    }

    try {
      await sgMail.send(msg)
    } catch (error) {
      logger.error(error, 'Email invite hasn\'t been sent due to error, post /user')
      ctx.body = { errors: ['Internal server error has occured'] }
      return
    }

    logger.info(msg, 'Email invite sent, post /user')

    ctx.body = userCreationRes
  })

  router.post('/user/finish-registration', async ctx => {
    const { finishRegistrationCode, additionalFields } = ctx.request.body

    ctx.body = await userEntity.updateWithAdditionalFilds(finishRegistrationCode, additionalFields)
  })

  router.post('/user/login', async ctx => {
    const { password, email } = ctx.request.body
    const { errors: passwordMatchErrors, value: passwordMatch } = await userEntity.doesPasswordMatch(email, password)

    if (passwordMatchErrors.length) {
      ctx.body = { errors: passwordMatchErrors }
      return
    }

    if (!passwordMatch) {
      ctx.body = { errors: ['Your password doesn\'t match'] }
      return
    }

    const getJWTFromUserRes = await userEntity.getJWTFromUser(email)

    ctx.body = getJWTFromUserRes
  })

  router.post('/user/byJwt', async ctx => {
    const { jwt } = ctx.request.body

    const getUser = await userEntity.getUserFromJWT(jwt)

    ctx.body = getUser
  })

  return router
}

module.exports = { createUserRouter }
