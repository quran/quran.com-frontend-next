import { appWithTranslation } from 'next-i18next'

const ns = ['common', 'home']
const locale = 'en'

const resources = ns.reduce((acc, n) => {
  if (!acc[locale]) acc[locale] = {}
  acc[locale] = {
    ...acc[locale],
    [n]: require(`../locales/${locale}/${n}.json`),
  }

  return acc
}, {})

export default (Story, context) => {
  const _nextI18Next = {
    ns,
    initialLocale: locale,
    initialI18nStore: {
      [locale]: {
        ...resources[locale],
      },
    },
    userConfig: {
      resources,
      i18n: {
        locales: [locale],
        defaultLocale: locale,
      },
    },
  }

  const AppWithTranslation = appWithTranslation(Story)

  return (
    <AppWithTranslation
      pageProps={{
        _nextI18Next,
      }}
    />
  )
}