const signature = ({ name, version, license }) =>
  `${name}@${version}:${(Array.isArray(license) ? license.join(' OR ') : String(license))}`

export default (modules) => {
  const signatures = {}

  return modules.filter((module) => {
    const s = signature(module)
    if (signatures[s]) return false
    signatures[s] = true
    return true
  })
}
