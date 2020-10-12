import rangeParser from 'range-parser' // eslint-disable-line import/no-extraneous-dependencies
import { LocalFile } from 'generic-filehandle' // eslint-disable-line import/no-extraneous-dependencies
import PluginManager from '@jbrowse/core/PluginManager'
import { TextDecoder, TextEncoder } from 'fastestsmallesttextencoderdecoder'
import JBrowseRootModelFactory from '../rootModel'
import configSnapshot from '../../test_data/volvox/config.json'
import corePlugins from '../corePlugins'

configSnapshot.configuration = {
  rpc: {
    defaultDriver: 'MainThreadRpcDriver',
  },
  useUrlSession: false,
}

export function getPluginManager(initialState, adminMode = true, sessionName) {
  const pluginManager = new PluginManager(corePlugins.map(P => new P()))
  pluginManager.createPluggableElements()

  const JBrowseRootModel = JBrowseRootModelFactory(pluginManager, adminMode)
  const rootModel = JBrowseRootModel.create({
    jbrowse: initialState || configSnapshot,
    assemblyManager: {},
  })
  if (sessionName) {
    const { name } = rootModel.jbrowse.savedSessions.find(
      session => session.name === sessionName,
    )
    rootModel.activateSession(name)
  } else if (rootModel.jbrowse && rootModel.jbrowse.savedSessions.length) {
    const { name } = rootModel.jbrowse.savedSessions[0]
    rootModel.activateSession(name)
  } else {
    rootModel.setDefaultSession()
  }
  rootModel.session.views.map(view => view.setWidth(800))
  pluginManager.setRootModel(rootModel)

  pluginManager.configure()
  return pluginManager
}

export function generateReadBuffer(getFileFunction) {
  return async request => {
    try {
      const file = getFileFunction(request.url)
      const maxRangeRequest = 1000000 // kind of arbitrary, part of the rangeParser
      if (request.headers.get('range')) {
        const range = rangeParser(maxRangeRequest, request.headers.get('range'))
        if (range === -2 || range === -1) {
          throw new Error(
            `Error parsing range "${request.headers.get('range')}"`,
          )
        }
        const { start, end } = range[0]
        const len = end - start + 1
        const buf = Buffer.alloc(len)
        const { bytesRead } = await file.read(buf, 0, len, start)
        const stat = await file.stat()
        return new Response(buf.slice(0, bytesRead), {
          status: 206,
          headers: [['content-range', `${start}-${end}/${stat.size}`]],
        })
      }
      const body = await file.readFile()
      return new Response(body, { status: 200 })
    } catch (e) {
      console.error(e)
      return new Response(undefined, { status: 404 })
    }
  }
}

export function setup() {
  if (!window.TextEncoder) window.TextEncoder = TextEncoder
  if (!window.TextDecoder) window.TextDecoder = TextDecoder

  window.requestIdleCallback = cb => cb()
  window.cancelIdleCallback = () => {}
  window.requestAnimationFrame = cb => setTimeout(cb)
  window.cancelAnimationFrame = () => {}

  Storage.prototype.getItem = jest.fn(() => null)
  Storage.prototype.setItem = jest.fn()
  Storage.prototype.removeItem = jest.fn()
  Storage.prototype.clear = jest.fn()
}

// eslint-disable-next-line no-native-reassign,no-global-assign
window = Object.assign(window, { innerWidth: 800 })

const originalError = console.error

// this is here to silence a warning related to useStaticRendering
// xref https://github.com/GMOD/jbrowse-components/issues/1277
jest.spyOn(console, 'error').mockImplementation((...args) => {
  if (typeof args[0] === 'string' && args[0].includes('useLayoutEffect')) {
    return undefined
  }
  return originalError.call(console, args)
})
