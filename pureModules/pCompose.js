const pCompose = (...args) => startValue => {
  args.reduce(async (value, curr) => {
    const awaitedValue = await value
    curr(awaitedValue)
  }, startValue)
}

module.exports = { pCompose }
