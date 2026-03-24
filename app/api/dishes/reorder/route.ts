import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { auth } from '../../../../lib/auth'

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { dishes } = await req.json()

  await Promise.all(
    dishes.map((dish: { id: number; order: number }) =>
      prisma.dish.update({
        where: { id: dish.id },
        data: { order: dish.order },
      })
    )
  )

  return NextResponse.json({ success: true })
}