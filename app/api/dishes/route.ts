import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { auth } from '../../../lib/auth'

export async function GET() {
  const dishes = await prisma.dish.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  })
  return NextResponse.json(dishes)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const dish = await prisma.dish.create({ data: body })
  return NextResponse.json(dish)
}