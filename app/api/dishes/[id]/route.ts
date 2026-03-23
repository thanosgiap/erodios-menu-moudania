import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { auth } from '../../../../lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const dish = await prisma.dish.update({
    where: { id: Number(id) },
    data: {
      category: body.category,
      nameEn:   body.nameEn,
      nameEl:   body.nameEl,
      nameRu:   body.nameRu,
      descEn:   body.descEn,
      descEl:   body.descEl,
      descRu:   body.descRu,
      price:    body.price,
      order:    body.order,
      visible:  body.visible,
    },
  })
  return NextResponse.json(dish)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.dish.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}