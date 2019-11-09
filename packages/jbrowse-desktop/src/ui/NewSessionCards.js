import { readConfObject } from '@gmod/jbrowse-core/configuration'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import FormControl from '@material-ui/core/FormControl'
import Icon from '@material-ui/core/Icon'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { PropTypes as MobxPropTypes } from 'mobx-react'
import PropTypes from 'prop-types'
import React, { useState } from 'react'

const useStyles = makeStyles(theme => ({
  card: {
    width: 150,
    height: 200,
    cursor: 'pointer',
  },
  name: {
    marginTop: theme.spacing(),
  },
}))

function NewSessionCard({ name, onClick, children }) {
  const classes = useStyles()
  const [hovered, setHovered] = useState(false)
  return (
    <div>
      <Card
        className={classes.card}
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
        onClick={onClick}
        raised={Boolean(hovered)}
      >
        <CardContent style={{ textAlign: 'center', margin: 'auto' }}>
          {children}
        </CardContent>
      </Card>
      <Typography variant="subtitle2" className={classes.name}>
        {name}
      </Typography>
    </div>
  )
}

NewSessionCard.propTypes = {
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
}

NewSessionCard.defaultProps = {
  onClick: () => {},
}

const emptySessionSnapshot = {
  name: `New Session ${new Date(Date.now()).toISOString()}`,
  menuBars: [
    {
      type: 'MainMenuBar',
      menus: [
        {
          name: 'File',
          menuItems: [
            {
              name: 'Back to Welcome Screen',
              icon: 'arrow_back',
              callback:
                'function(session) {session.activateSession(undefined)}',
            },
            {
              name: 'Import tabular data',
              icon: 'table_chart',
              callback:
                "function(session) { session.addView('SpreadsheetView', {})}",
            },
          ],
        },
        {
          name: 'Help',
          menuItems: [
            {
              name: 'About',
              icon: 'info',
              callback: 'openAbout',
            },
            {
              name: 'Help',
              icon: 'help',
              callback: 'openHelp',
            },
          ],
        },
      ],
    },
  ],
  connections: {},
}

export function NewEmptySession({ root }) {
  function onClick() {
    root.activateSession(emptySessionSnapshot)
  }
  return (
    <NewSessionCard name={'Empty'} onClick={onClick}>
      <Icon color="primary" fontSize="large">
        add
      </Icon>
    </NewSessionCard>
  )
}

NewEmptySession.propTypes = {
  root: MobxPropTypes.objectOrObservableObject.isRequired,
}

const useNewLinearGenomeViewSessionStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(),
  },
}))

export function NewLinearGenomeViewSession({ root }) {
  const classes = useNewLinearGenomeViewSessionStyles()
  const [selectedDatasetIdx, setSelectedDatasetIdx] = useState('')

  function selectDataset(event) {
    setSelectedDatasetIdx(event.target.value)
  }

  function createLGVSessionOfDatasetIdx() {
    const dataset = root.jbrowse.datasets[Number(selectedDatasetIdx)]
    const assemblyName = readConfObject(dataset.assembly, 'name')
    const snapshot = {
      ...emptySessionSnapshot,
      name: `New ${readConfObject(dataset, 'name')} Session ${new Date(
        Date.now(),
      ).toISOString()}`,
      views: [
        {
          type: 'LinearGenomeView',
          displayRegionsFromAssemblyName: assemblyName,
        },
      ],
    }
    root.activateSession(snapshot)
  }

  return (
    <NewSessionCard name={'Linear Genome View'}>
      <FormControl fullWidth>
        <InputLabel htmlFor="age-simple">Dataset</InputLabel>
        <Select value={selectedDatasetIdx} onChange={selectDataset}>
          {root.jbrowse.datasets.map((dataset, idx) => {
            const name = readConfObject(dataset, 'name')
            return (
              <MenuItem key={name} value={idx}>
                {name}
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>
      <Button
        disabled={selectedDatasetIdx === ''}
        onClick={createLGVSessionOfDatasetIdx}
        variant="contained"
        color="primary"
        className={classes.button}
      >
        Open
      </Button>
    </NewSessionCard>
  )
}

NewLinearGenomeViewSession.propTypes = {
  root: MobxPropTypes.objectOrObservableObject.isRequired,
}

export function NewSVInspectorSession({ root }) {
  const launchSVSession = () => {
    const snapshot = {
      ...emptySessionSnapshot,
      name: `New SV Inspector Session ${new Date(Date.now()).toISOString()}`,
      views: [
        {
          type: 'SvInspectorView',
        },
      ],
    }
    root.activateSession(snapshot)
  }
  return (
    <NewSessionCard
      name="Structural Variant Inspector"
      onClick={launchSVSession}
    >
      {''}
    </NewSessionCard>
  )
}

NewSVInspectorSession.propTypes = {
  root: MobxPropTypes.objectOrObservableObject.isRequired,
}
