import { auth } from '../../lib/auth'
import { prisma } from '../../lib/prisma'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const dishes = await prisma.dish.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  })

  return <AdminClient initialDishes={dishes} />
}