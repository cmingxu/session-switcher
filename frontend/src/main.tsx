import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import Dashboard from './dashboard'
import Account from './account'
import AccountHome from './account-home'
import Message from './message'
import Upload from './upload'
import Setting from './setting'

import { HashRouter, Route, Routes } from 'react-router'
import { AppContextProvider } from '@/contexts/appContext'


const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <AppContextProvider>
      <HashRouter>
        <Routes>
          <Route element={<Dashboard />}>
            <Route index element={<div></div>} />
            <Route path="/accounts"  >
              <Route index element={<AccountHome /> } />
              <Route path=":uid" element={<Account />} />
            </Route>
            <Route path="/messages" element={<Message />} />
            <Route path="/uploads" element={<Upload />} />
            <Route path="/setting" element={<Setting />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppContextProvider>
  </React.StrictMode>
)
