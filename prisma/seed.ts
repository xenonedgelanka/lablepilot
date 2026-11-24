import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { argon2id, hash } from 'argon2'

const prisma=new PrismaClient()
try {
  const email=process.env.ADMIN_EMAIL?.trim().toLowerCase(),password=process.env.ADMIN_PASSWORD
  if(!email||!password||password.length<12)throw new Error('Set ADMIN_EMAIL and a unique ADMIN_PASSWORD with at least 12 characters in the environment.')
  if(await prisma.admin.count())throw new Error('An administrator already exists. Setup is single-user and cannot create another account.')
  await prisma.$transaction(async tx=>{
    const admin=await tx.admin.create({data:{email,passwordHash:await hash(password,{type:argon2id})}})
    await tx.auditLog.create({data:{action:'admin.seeded',entity:'admin',entityId:admin.id}})
    await tx.currency.createMany({data:[{code:'LKR',name:'Sri Lankan Rupee',symbol:'Rs'},{code:'CHF',name:'Swiss Franc',symbol:'CHF'}],skipDuplicates:true})
    await tx.systemSetting.createMany({data:[{key:'barcode_sequence',value:1},{key:'exchange_rate',value:{base:'CHF',quote:'LKR',rate:null,source:'manual'}}],skipDuplicates:true})
  })
  console.log('Single administrator created. No credentials were printed.')
} finally { await prisma.$disconnect() }
