import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import Layout from '~/layout'
import { BreakpointPanel, BreakpointPanels, ChartAndValuesWrapper, ProtocolsTable } from '~/components'
import { ProtocolsChainsSearch } from '~/components/Search'
import { columnsToShow } from '~/components/Table'
import { RowLinks, LinksWrapper } from '~/components/Filters'
import { useCalcExtraTvlsByDay, useCalcStakePool2Tvl } from '~/hooks/data'
import { formattedNum, getPercentChange, getPrevTvlFromChart, getTokenDominance } from '~/utils'
import { getForkPageData, revalidate } from '~/utils/dataApi'

const Chart = dynamic(() => import('~/components/GlobalChart'), {
  ssr: false,
})

export async function getStaticProps({ params: { fork } }) {
  const data = await getForkPageData(fork)

  return {
    ...data,
    revalidate: revalidate(),
  }
}

export async function getStaticPaths() {
  const { forks = {} } = await getForkPageData()

  const forksList = Object.keys(forks)

  const paths = forksList.slice(0, 10).map((fork) => {
    return {
      params: { fork },
    }
  })

  return { paths, fallback: 'blocking' }
}

const columns = columnsToShow(
  'protocolName',
  'category',
  'chains',
  '1dChange',
  '7dChange',
  '1mChange',
  'tvl',
  'mcaptvl'
)

const PageView = ({ chartData, tokenLinks, token, filteredProtocols, parentTokens }) => {
  const protocolsData = useCalcStakePool2Tvl(filteredProtocols)
  const parentForks = useCalcStakePool2Tvl(parentTokens)

  const finalChartData = useCalcExtraTvlsByDay(chartData)

  const { totalVolume, volumeChangeUSD } = useMemo(() => {
    const totalVolume = getPrevTvlFromChart(finalChartData, 0)
    const tvlPrevDay = getPrevTvlFromChart(finalChartData, 1)
    const volumeChangeUSD = getPercentChange(totalVolume, tvlPrevDay)
    return { totalVolume, volumeChangeUSD }
  }, [finalChartData])

  const topToken = {}

  if (protocolsData.length > 0) {
    topToken.name = protocolsData[0]?.name
    topToken.tvl = protocolsData[0]?.tvl
  }

  const tvl = formattedNum(totalVolume, true)

  const dominance = getTokenDominance(topToken, totalVolume)

  const percentChange = volumeChangeUSD?.toFixed(2)

  return (
    <>
      <ProtocolsChainsSearch step={{ category: 'Oracles', name: token, route: 'forks' }} />

      <ChartAndValuesWrapper>
        <BreakpointPanels>
          <BreakpointPanel>
            <h1>Total Value Locked (USD)</h1>
            <p style={{ '--tile-text-color': '#4f8fea' }}>{tvl}</p>
          </BreakpointPanel>
          <BreakpointPanel>
            <h2>Change (24h)</h2>
            <p style={{ '--tile-text-color': '#fd3c99' }}> {percentChange || 0}%</p>
          </BreakpointPanel>
          <BreakpointPanel>
            <h2>{topToken.name} Dominance</h2>
            <p style={{ '--tile-text-color': '#46acb7' }}> {dominance}%</p>
          </BreakpointPanel>
        </BreakpointPanels>
        <BreakpointPanel id="chartWrapper">
          <Chart
            display="liquidity"
            dailyData={finalChartData}
            totalLiquidity={totalVolume}
            liquidityChange={volumeChangeUSD}
            title="TVL"
          />
        </BreakpointPanel>
      </ChartAndValuesWrapper>

      <LinksWrapper>
        <RowLinks links={tokenLinks} activeLink={token} />
      </LinksWrapper>

      <ProtocolsTable columns={columns} data={protocolsData} pinnedRow={parentForks[0]} />
    </>
  )
}

export default function Forks(props) {
  return (
    <Layout title={`Forks - DefiLlama`} defaultSEO>
      <PageView {...props} />
    </Layout>
  )
}
