const pCompose = (...args) => startValue => {
  return args.reduce(async (value, curr) => {
    const awaitedValue = await value
    curr(awaitedValue)
  }, startValue)
}

module.exports = { pCompose }
