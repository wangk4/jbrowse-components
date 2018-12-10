import JBrowse from './JBrowse'
import { renderRegion, freeResources } from './render.worker'

const jbrowse = new JBrowse().configure()

test('can render a single region with Pileup + BamAdapter', async () => {
  const testprops = {
    region: { assembly: 'volvox', refName: 'ctgA', start: 0, end: 800 },
    sessionId: 'knickers the cow',
    adapterType: 'BamAdapter',
    adapterConfig: {
      _configId: '7Hc9NkuD4x',
      type: 'BamAdapter',
      bamLocation: {
        path: require.resolve('../public/test_data/volvox-sorted.bam'),
      },
      index: {
        _configId: 'sGW8va26pr',
        location: {
          path: require.resolve('../public/test_data/volvox-sorted.bam.bai'),
        },
      },
    },
    rendererType: 'PileupRenderer',
    renderProps: { bpPerPx: 1 },
  }

  const result = await renderRegion(jbrowse.pluginManager, testprops)
  expect(Object.keys(result)).toEqual(['features', 'html', 'layout'])
  expect(result.features.length).toBe(93)
  expect(result.html).toMatchSnapshot()
  expect(result.layout).toMatchSnapshot()

  expect(
    freeResources(jbrowse.pluginManager, {
      sessionId: 'knickers the cow',
    }),
  ).toBe(2)

  expect(
    freeResources(jbrowse.pluginManager, {
      sessionId: 'fozzy bear',
    }),
  ).toBe(0)
})
