const Router = require('koa-router')
const sgMail = require('@sendgrid/mail')
const config = require('config')
const shortUUID = require('short-uuid')

const User = require('../db/entities/user')
const logger = require('../logger')

const router = new Router()

sgMail.setApiKey(config.email.API_KEY)

router.post('/user', async ctx => {
  logger.info(ctx.body, 'Starting registration process, post /user')
  const { jwt, firstname, lastname, email, tenantAdmin, tenantId, message = '' } = ctx.request.body

  const { error: getUserFromJWTError, value: user } = User.getUserFromJWT(jwt)

  if (getUserFromJWTError) {
    ctx.body = { error: getUserFromJWTError }
    return
  }

  if (!user.tenantAdmin && !user.rootAdmin) {
    ctx.body = { error: 'You don\'t have the permission to create users' }
    return
  }

  if (!user.rootAdmin && tenantAdmin) {
    ctx.body = { error: 'You don\'t have the permission to create tenant admin' }
    return
  }

  if (user.tenantAdmin && user.tenantId !== tenantId) {
    ctx.body = { error: 'You can create users only for tenant you\'re an admin of' }
    return
  }

  const finishRegistrationCode = shortUUID.generate()
  const userCreationRes = await User.create({
    firstname,
    lastname,
    email,
    tenantAdmin,
    tenantId,
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
    text: message + (message && '\n' + '\n' + '\n') + `link to finish registration, do not share it with anyone - ${config.app.URL}/user/finish-registration?code=${finishRegistrationCode}`
  }

  try {
    await sgMail.send(msg)
  } catch (error) {
    logger.error(error, 'Email invite hasn\'t been sent due to error, post /user')
    ctx.body = { error: 'Internal server error has occured' }
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
  const { error: passwordMatchError, value: passwordMatch } = await User.doesPasswordMatch(email, password)

  if (passwordMatchError) {
    ctx.body = passwordMatchError
    return
  }

  if (!passwordMatch) {
    ctx.body = { error: 'Your password doesn\'t match' }
    return
  }

  const getJWTFromUserRes = await User.getJWTFromUser(email)

  ctx.body = getJWTFromUserRes
})

module.exports = router
