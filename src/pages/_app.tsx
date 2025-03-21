import { getCookie } from 'cookies-next'
import type { AppContext, AppProps } from 'next/app'
import App from 'next/app'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import Decimal from 'decimal.js'

import i18n from '../i18n'
import { isClient } from '../utils/common'
import '@/components/Toast/toast.css'
import '@/components/LandingPage/components/tvl.css'
import '@/components/LandingPage/liquidity.css'
import 'react-day-picker/dist/style.css'
import { GoogleAnalytics } from '@next/third-parties/google'

// import { isValidUrl } from '@/utils/url'
import { useDisclosure } from '@chakra-ui/react'
import { useAppStore } from '@/store'
import shallow from 'zustand/shallow'

const DynamicProviders = dynamic(() => import('@/provider').then((mod) => mod.Providers))
const DynamicContent = dynamic(() => import('@/components/Content'))
const DynamicAppNavLayout = dynamic(() => import('@/components/AppLayout/AppNavLayout'), { ssr: false })

const CONTENT_ONLY_PATH = ['/', '404', '/moonpay']
const OVERFLOW_HIDDEN_PATH = ['/liquidity-pools']

Decimal.set({ precision: 1e3 })

const MyApp = ({ Component, pageProps, ...props }: AppProps) => {
  const { pathname } = useRouter()

  const [onlyContent, overflowHidden] = useMemo(
    () => [CONTENT_ONLY_PATH.includes(pathname), OVERFLOW_HIDDEN_PATH.includes(pathname)],
    [pathname]
  )
  const [setRpcUrlAct] = useAppStore((s) => [s.setRpcUrlAct], shallow)
  const { onOpen: onLoading, onClose: offLoading } = useDisclosure()

  useEffect(() => {
    const setRpcUrl = async () => {
      onLoading()
      await setRpcUrlAct('https://mainnet.helius-rpc.com/?api-key=e6eb0566-8ed5-4c78-aee0-bdbfc3fa91b8') //https://mainnet.helius-rpc.com/?api-key=e6eb0566-8ed5-4c78-aee0-bdbfc3fa91b8
      offLoading()
    }

    setRpcUrl().catch(console.error)
  }, [])

  return (
    <>
      {/* <GoogleAnalytics gaId="G-DR3V6FTKE3" /> */}
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        {/* <meta name="twitter:image" content="https://isg.fi/isg.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ISGProtocol" />
        <meta name="twitter:creator" content="@ISGProtocol" />
        <meta name="twitter:title" content="ISG" />
        <meta name="twitter:description" content="" />
        <meta property="og:description" content="" />
        <meta property="og:url" content="https://isg.fi/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://isg.fi/isg.png" />
        <meta property="og:image:alt" content="ISG" />
        <meta property="og:locale" content="en" />
        <meta property="og:site_name" content="ISG" />
        <meta property="og:title" content="Swap | ISG" /> */}
        <title>{pageProps?.title ? `${pageProps.title} : ISG` : 'ISG'}</title>
      </Head>
      <DynamicProviders>
        <DynamicContent {...props}>
          {onlyContent ? (
            <Component {...pageProps} />
          ) : (
            <DynamicAppNavLayout overflowHidden={overflowHidden}>
              <Component {...pageProps} />
            </DynamicAppNavLayout>
          )}
        </DynamicContent>
      </DynamicProviders>
    </>
  )
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  if (isClient()) return {}
  try {
    const ctx = await App.getInitialProps(appContext)
    let lng = getCookie('i18nextLng', { req: appContext.ctx.req, res: appContext.ctx.res }) as string
    lng = lng || 'en'
    i18n.changeLanguage(lng)

    return ctx
  } catch (err) {
    return {}
  }
}

export default MyApp
