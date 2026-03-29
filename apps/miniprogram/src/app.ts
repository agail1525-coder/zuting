import { createElement, PropsWithChildren } from 'react'
import { I18nProvider } from './lib/i18n'
import './app.scss'

function App({ children }: PropsWithChildren) {
  return createElement(I18nProvider, null, children)
}

export default App
