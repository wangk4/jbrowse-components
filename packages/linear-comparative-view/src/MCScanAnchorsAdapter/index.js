import AdapterClass from './MCScanAnchorsAdapter'
import configSchema from './configSchema'

export default ({ jbrequire }: { jbrequire: Function }) => {
  const AdapterType = jbrequire(
    '@gmod/jbrowse-core/pluggableElementTypes/AdapterType',
  )
  return new AdapterType({
    name: 'MCScanAnchorsAdapter',
    AdapterClass,
    configSchema,
  })
}
