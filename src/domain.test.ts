import { describe,expect,it } from 'vitest'
import { barcodeForSequence,calculateProfit,exchangeReference,generateUniqueSku } from './domain'

describe('internal barcode sequence',()=>{
  it('produces fixed-width, unique consecutive identifiers',()=>{
    const codes=[1,2,3].map(barcodeForSequence)
    expect(codes).toEqual(['200000000001','200000000002','200000000003'])
    expect(new Set(codes).size).toBe(codes.length)
  })
  it('rejects a non-positive sequence',()=>expect(()=>barcodeForSequence(0)).toThrow(RangeError))
})

describe('currency-safe price math',()=>{
  it('calculates profit, markup and margin inside one currency',()=>{
    const lkr=calculateProfit(180,'LKR',300,'LKR')
    expect(lkr.profit).toBe(120)
    expect(lkr.markupPercent).toBeCloseTo(200/3)
    expect(lkr.marginPercent).toBe(40)
    expect(calculateProfit(.55,'CHF',.9,'CHF').profit).toBeCloseTo(.35)
  })
  it('never mixes LKR and CHF',()=>expect(()=>calculateProfit(180,'LKR',.9,'CHF')).toThrow(/different currencies/))
  it('does reference conversion only when explicitly called',()=>{
    expect(exchangeReference(2,335.5,'CHF','LKR')).toEqual({amount:671,currency:'LKR'})
    expect(exchangeReference(671,335.5,'LKR','CHF').amount).toBe(2)
  })
})

describe('automatic product SKUs',()=>{
  it('builds a readable SKU using the name and size',()=>{
    expect(generateUniqueSku('Ceylon Cinnamon','250','g',[])).toBe('CEY-CIN-250G')
  })
  it('adds a suffix to keep generated SKUs unique',()=>{
    expect(generateUniqueSku('Ceylon Cinnamon','250','g',['CEY-CIN-250G'])).toBe('CEY-CIN-250G-02')
    expect(generateUniqueSku('Ceylon Cinnamon','250','g',['CEY-CIN-250G','CEY-CIN-250G-02'])).toBe('CEY-CIN-250G-03')
  })
})
