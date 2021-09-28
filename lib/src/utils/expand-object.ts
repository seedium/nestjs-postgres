export const expandObject = (alias, name) => {
  return `coalesce(to_json(${alias}.*), json 'null') as ${name}`
}
