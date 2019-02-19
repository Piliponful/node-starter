const Router = require('koa-router')
const sgMail = require('@sendgrid/mail')
const config = require('config')
const shortUUID = require('short-uuid')
const { ObjectId } = require('mongodb')

const User = require('../db/entities/user')
const Tenant = require('../db/entities/tenant')
const logger = require('../logger')

const router = new Router()

sgMail.setApiKey(config.email.API_KEY)

router.get('/user', async ctx => {
  const { limit, skip } = ctx.query

  ctx.body = await User.find({ deleted: false }, limit, skip, { password: 0 })
})

router.get('/user/:id', async ctx => {
  const { id } = ctx.params

  const { errors, value: user } = await User.find({ _id: ObjectId(id) })

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

  ctx.body = await User.update({ _id: ObjectId(id) }, { $set: ctx.request.body })
})

router.delete('/user/:id', async ctx => {
  const { id } = ctx.params

  ctx.body = await User.update({ _id: ObjectId(id) }, { $set: { deleted: true } })
})

router.post('/user', async ctx => {
  logger.info(ctx.request.body, 'Starting registration process, post /user')
  const { jwt, firstname, lastname, email, tenantAdmin, tenantName, message = '' } = ctx.request.body
  if (!jwt) {
    ctx.body = { errors: ['You have to supply jwt token in body jwt field'] }
    return
  }

  const { errors: getUserFromJWTErrors, value: user } = User.getUserFromJWT(jwt)

  if (getUserFromJWTErrors.length) {
    ctx.body = { errors: getUserFromJWTErrors }
    return
  }

  if (!user.tenantAdmin && !user.rootAdmin) {
    ctx.body = { errors: ['You don\'t have the permission to create users'] }
    return
  }

  if (!user.rootAdmin && tenantAdmin) {
    ctx.body = { errors: ['You don\'t have the permission to create tenant admin'] }
    return
  }

  if (user.rootAdmin && tenantAdmin) {
    const { errors: tenantCreationErrors } = await Tenant.create({ name: tenantName })

    if (tenantCreationErrors.length) {
      ctx.body = { errors: tenantCreationErrors }
      return
    }
  }

  const { errors: findTenantErrors, value: [tenant] } = await Tenant.find({ name: tenantName })

  if (!tenant) {
    ctx.body = { errors: [`Wasn't able to find tenant by the '${tenant}' name`] }
    return
  }

  if (findTenantErrors.length) {
    ctx.body = { errors: findTenantErrors }
    return
  }

  if (user.tenantAdmin && user.tenantId !== tenant._id.toString()) {
    ctx.body = { errors: ['You can create users only for tenant you\'re an admin of'] }
    return
  }

  const finishRegistrationCode = shortUUID.generate()
  const userCreationRes = await User.create({
    firstname,
    lastname,
    email,
    tenantAdmin,
    tenantId: tenant._id.toString(),
    finishRegistrationCode
  })

  if (!userCreationRes.value) {
    ctx.body = userCreationRes
    return
  }

  const msg = {
    to: email,
    from: `${user.firstname} ${user.lastname} <${user.email}>`,
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

  ctx.body = await User.updateWithAdditionalFilds(finishRegistrationCode, additionalFields)
})

router.post('/user/login', async ctx => {
  const { password, email } = ctx.request.body
  const { errors: passwordMatchErrors, value: passwordMatch } = await User.doesPasswordMatch(email, password)

  if (passwordMatchErrors.length) {
    ctx.body = { errors: passwordMatchErrors }
    return
  }

  if (!passwordMatch) {
    ctx.body = { errors: ['Your password doesn\'t match'] }
    return
  }

  const getJWTFromUserRes = await User.getJWTFromUser(email)

  ctx.body = getJWTFromUserRes
})

router.post('/user/byJwt', async ctx => {
  const { jwt } = ctx.request.body

  const getUser = await User.getUserFromJWT(jwt)

  ctx.body = getUser
})

module.exports = router
