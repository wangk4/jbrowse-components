import React, { useEffect, useState } from 'react'
import { getConf } from '@jbrowse/core/configuration'
import { useQueryParam, StringParam } from 'use-query-params'
import { App, createJBrowseTheme } from '@jbrowse/core/ui'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ThemeProvider } from '@material-ui/core/styles'
import { observer } from 'mobx-react'
import { onSnapshot } from 'mobx-state-tree'
import ShareButton from './ShareButton'
import StartScreen from './StartScreen'
import factoryReset from './factoryReset'

function deleteBaseUris(config) {
  if (typeof config === 'object') {
    for (const key of Object.keys(config)) {
      if (typeof config[key] === 'object') {
        deleteBaseUris(config[key])
      } else if (key === 'uri') {
        delete config.baseUri
      }
    }
  }
}

const JBrowse = observer(({ pluginManager, defaultScreen }) => {
  const [adminKey] = useQueryParam('adminKey', StringParam)
  const [adminServer] = useQueryParam('adminServer', StringParam)
  const [, setSessionId] = useQueryParam('session', StringParam)
  const [firstLoad, setFirstLoad] = useState(false)
  const [once, setOnce] = useState(1)

  const { rootModel } = pluginManager
  const { error, jbrowse, session } = rootModel || {}
  const { id: currentSessionId } = session
  console.log('pm', pluginManager)
  console.log('defaultScreen', defaultScreen)
  console.log('fistload', firstLoad)
  console.log('views === 0 ?', session.views.length === 0)
  if (defaultScreen && !firstLoad) {
    if (once === 1) {
      if (session.views.length === 0) {
        setFirstLoad(true)
      }
      setOnce(0)
    } else {
      setFirstLoad(false)
    }
  }

  useEffect(() => {
    setSessionId(`local-${currentSessionId}`)
  }, [currentSessionId, setSessionId])

  useEffect(() => {
    onSnapshot(jbrowse, async snapshot => {
      if (adminKey) {
        const config = JSON.parse(JSON.stringify(snapshot))
        deleteBaseUris(config)
        const payload = { adminKey, config }

        const response = await fetch(adminServer || `/updateConfig`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const message = await response.text()
          session.notify(
            `Admin server error: ${response.status} (${response.statusText}) ${
              message || ''
            }`,
          )
        }
      }
    })
  }, [jbrowse, session, adminKey, adminServer])

  if (error) {
    throw error
  }

  const theme = getConf(rootModel.jbrowse, 'theme')
  const { AssemblyManager } = pluginManager.getPlugin(
    'DataManagementPlugin',
  ).exports

  console.log(session)
  return (
    <ThemeProvider theme={createJBrowseTheme(theme)}>
      <CssBaseline />
      {firstLoad ? (
        <StartScreen
          root={rootModel}
          pluginManager={pluginManager}
          bypass={firstLoad}
          onFactoryReset={factoryReset}
        />
      ) : (
        <App
          session={session}
          HeaderButtons={<ShareButton session={session} />}
        />
      )}
      {/* <App
        session={session}
        HeaderButtons={<ShareButton session={session} />}
      /> */}
      {adminKey ? (
        <AssemblyManager
          rootModel={rootModel}
          open={rootModel.isAssemblyEditing}
          onClose={() => {
            rootModel.setAssemblyEditing(false)
          }}
        />
      ) : null}
    </ThemeProvider>
  )
})

export default JBrowse
