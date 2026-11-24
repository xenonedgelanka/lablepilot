export type CurrencyCode='LKR'|'CHF'

/** Internal identifier sequence: the business-issued prefix plus a nine-digit sequence. */
export function barcodeForSequence(sequence:number):string{
  if(!Number.isSafeInteger(sequence)||sequence<1)throw new RangeError('Barcode sequence must be a positive safe integer')
  return `200${String(sequence).padStart(9,'0')}`
}

/** Build a readable product SKU and append a numeric suffix when it already exists. */
export function generateUniqueSku(name:string,weight:string,unit:string,existingSkus:string[]):string{
  const words=name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean)
  const stem=words.length>1?words.slice(0,3).map(word=>word.slice(0,3)).join('-'):(words[0]?.slice(0,8)||'PRODUCT')
  const size=weight&&Number(weight)>0?`${weight}${unit}`.replace(/[^A-Z0-9]/gi,'').toUpperCase():''
  const base=[stem,size].filter(Boolean).join('-').slice(0,34).replace(/-+$/,'')||'PRODUCT'
  const used=new Set(existingSkus.map(sku=>sku.trim().toUpperCase()))
  if(!used.has(base))return base
  let suffix=2
  while(used.has(`${base}-${String(suffix).padStart(2,'0')}`))suffix++
  return `${base}-${String(suffix).padStart(2,'0')}`
}

/** Profit math is deliberately currency-local. Cross-currency comparisons are rejected. */
export function calculateProfit(cost:number,costCurrency:CurrencyCode,retail:number,retailCurrency:CurrencyCode){
  if(costCurrency!==retailCurrency)throw new TypeError('Prices in different currencies cannot be combined')
  if(!Number.isFinite(cost)||!Number.isFinite(retail)||cost<0||retail<0)throw new RangeError('Prices must be finite non-negative amounts')
  const profit=retail-cost
  return {currency:costCurrency,profit,markupPercent:cost===0?null:(profit/cost)*100,marginPercent:retail===0?null:(profit/retail)*100}
}

/** Convert only when explicitly requested, and round the display value to minor units. */
export function exchangeReference(amount:number,rate:number,from:CurrencyCode,to:CurrencyCode){
  if(!Number.isFinite(amount)||amount<0||!Number.isFinite(rate)||rate<=0)throw new RangeError('Enter a valid amount and exchange rate')
  if(from===to)return {amount,currency:to}
  const converted=from==='CHF'?amount*rate:amount/rate
  return {amount:Math.round((converted+Number.EPSILON)*100)/100,currency:to}
}
