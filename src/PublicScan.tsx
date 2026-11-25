import { useEffect, useState } from 'react'
import { AlertCircle, Building2, CalendarDays, MapPin, Package, Phone, ShieldCheck, Tag, Weight } from 'lucide-react'
import axios from 'axios'

type ScanData={
  business:{name:string;registrationNumber:string;address:string;phone:string;whatsapp:string;logo:string}
  product:{id:string;name:string;sku:string;barcode:string;category:string;brand:string;weight:string;unit:string;ingredients:string;batch:string;manufacturing:string;expiry:string;priceLkr:string;priceChf:string}
  currencies:{LKR:boolean;CHF:boolean}
}

function dateLabel(value:string){if(!value)return '';const parts=value.split('-').map(Number);return parts.length===3&&parts.every(Number.isFinite)?new Intl.DateTimeFormat('en-LK',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(parts[0],parts[1]-1,parts[2])):value}
function price(value:string,currency:'LKR'|'CHF'){return new Intl.NumberFormat('en-LK',{style:'currency',currency,maximumFractionDigits:currency==='LKR'?0:2}).format(Number(value)||0)}

export default function PublicScan({productId}:{productId:string}){
 const [data,setData]=useState<ScanData|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('')
 useEffect(()=>{let cancelled=false;void axios.get(`/api/public/scan/${encodeURIComponent(productId)}`).then(response=>{if(!cancelled)setData(response.data)}).catch(()=>{if(!cancelled)setError('We couldn’t find this product. Check the QR code or contact the business.')}).finally(()=>{if(!cancelled)setLoading(false)});return()=>{cancelled=true}},[productId])
 const expired=Boolean(data?.product.expiry&&data.product.expiry<new Date().toISOString().slice(0,10))
 const phoneHref=data?.business.phone?`tel:${data.business.phone.replace(/[^+\d]/g,'')}`:''
 const whatsappHref=data?.business.whatsapp?`https://wa.me/${data.business.whatsapp.replace(/\D/g,'')}`:''
 return <main className="public-scan-page"><div className="public-scan-shell">
  <header className="public-scan-brand"><div className="public-scan-brand-icon"><Package size={19}/></div><span>Product information</span><ShieldCheck size={17}/></header>
  {loading?<section className="public-scan-state"><span className="scan-loader"/><h1>Loading product details</h1><p>Please wait a moment.</p></section>:error?<section className="public-scan-state scan-error"><AlertCircle size={34}/><h1>Product not found</h1><p>{error}</p></section>:data&&<>
   <section className="public-scan-hero"><div className="scan-business-top">{data.business.logo?<img src={data.business.logo} alt={`${data.business.name} logo`}/>:<span className="scan-business-monogram">{(data.business.name||'B').trim().slice(0,1).toUpperCase()}</span>}<div><small>PROVIDED BY</small><strong>{data.business.name||'Your business'}</strong>{data.business.registrationNumber&&<span>BR No. {data.business.registrationNumber}</span>}</div></div><div className="scan-product-heading"><span className="scan-eyebrow">{data.product.category||'PRODUCT'}</span><h1>{data.product.name}</h1><div className="scan-product-sub">{data.product.brand&&<span><Tag size={14}/>{data.product.brand}</span>}{data.product.weight&&<span><Weight size={14}/>{data.product.weight} {data.product.unit}</span>}</div></div></section>
   {(data.currencies.LKR||data.currencies.CHF)&&<section className="scan-section scan-prices"><div className="scan-section-title"><span className="scan-section-icon"><Tag size={17}/></span><div><h2>Retail price</h2><p>Current listed price</p></div></div><div className="scan-price-grid">{data.currencies.LKR&&<div className="scan-price-card"><span>LKR</span><strong>{price(data.product.priceLkr,'LKR')}</strong></div>}{data.currencies.CHF&&<div className="scan-price-card"><span>CHF</span><strong>{price(data.product.priceChf,'CHF')}</strong></div>}</div></section>}
   <section className="scan-section"><div className="scan-section-title"><span className="scan-section-icon"><Package size={17}/></span><div><h2>Product details</h2><p>Information for this item</p></div></div><div className="scan-detail-list">{data.product.ingredients&&<div className="scan-detail scan-ingredients"><span>Ingredients</span><strong>{data.product.ingredients}</strong></div>}<div className="scan-detail"><span>SKU</span><strong>{data.product.sku||'—'}</strong></div><div className="scan-detail"><span>Barcode</span><strong className="scan-code">{data.product.barcode||'—'}</strong></div>{data.product.batch&&<div className="scan-detail"><span>Batch number</span><strong>{data.product.batch}</strong></div>}<div className="scan-date-grid">{data.product.manufacturing&&<div className="scan-date-card"><CalendarDays size={16}/><span>Manufactured</span><strong>{dateLabel(data.product.manufacturing)}</strong></div>}{data.product.expiry&&<div className={`scan-date-card ${expired?'scan-expired':''}`}><CalendarDays size={16}/><span>Expiry date</span><strong>{dateLabel(data.product.expiry)}</strong>{expired&&<em>Expired</em>}</div>}</div></div></section>
   {(data.business.address||data.business.phone||data.business.whatsapp)&&<section className="scan-section"><div className="scan-section-title"><span className="scan-section-icon"><Building2 size={17}/></span><div><h2>Business contact</h2><p>Questions about this product?</p></div></div><div className="scan-contact-list">{data.business.address&&<div className="scan-contact-row"><MapPin size={17}/><span>{data.business.address}</span></div>}{data.business.phone&&<a className="scan-contact-row" href={phoneHref}><Phone size={17}/><span>{data.business.phone}</span></a>}{data.business.whatsapp&&<a className="scan-contact-row" href={whatsappHref} target="_blank" rel="noreferrer"><Phone size={17}/><span>WhatsApp {data.business.whatsapp}</span></a>}</div></section>}
   <footer className="public-scan-footer">Product details supplied by {data.business.name||'the business'}.</footer>
  </>}
 </div></main>
}
