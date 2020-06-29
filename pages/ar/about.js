// @ts-nocheck
import I18nProvider from 'next-translate/I18nProvider'
import React from 'react'
import C from '../../../src/pages_/about'
import ns0 from '../../../locales/ar/common.json'
import ns1 from '../../../locales/ar/about.json'

const namespaces = { 'common': ns0, 'about': ns1 }

export default function Page(p){
  return (
    <I18nProvider 
      lang="ar" 
      namespaces={namespaces}  
      internals={{"defaultLanguage":"en","isStaticMode":true}}
    >
      <C {...p} />
    </I18nProvider>
  )
}

Page = Object.assign(Page, { ...C })

if(C && C.getInitialProps) {
  Page.getInitialProps = ctx => C.getInitialProps({ ...ctx, lang: 'ar'})
}





export * from '../../../src/pages_/about'
