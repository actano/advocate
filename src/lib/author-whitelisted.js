const isWhitelisted = (whitelist = [], author) =>
  author != null && author.name != null && whitelist.includes(author.name)

export default isWhitelisted
