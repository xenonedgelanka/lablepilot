import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import PublicScan from './PublicScan'
import './style.css'
const client = new QueryClient()
const scanId=new URLSearchParams(window.location.search).get('scan')
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><QueryClientProvider client={client}>{scanId?<PublicScan productId={scanId}/>:<App/>}</QueryClientProvider></React.StrictMode>)
