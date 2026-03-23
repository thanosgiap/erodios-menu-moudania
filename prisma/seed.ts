import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

const pool = new Pool({ connectionString: process.env.POSTGRES_PRISMA_URL! })
const adapter = new PrismaNeon(pool)
const prisma = new PrismaClient({ adapter })

interface DishRow {
    english_name: string
    greek_name: string
    russian_name: string
    english_description: string
    greek_description: string
    russian_description: string
    price: string
    category: string
}

async function main() {
    // Create manager account
    const hashed = await bcrypt.hash('erodios2024', 10)
    await prisma.manager.upsert({
        where: { username: 'manager' },
        update: {},
        create: { username: 'manager', password: hashed },
    })
    console.log('✔ Manager account created')

    // Read and parse CSV
    const csvPath = path.join(__dirname, 'dishes.csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')

    const rows = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }) as DishRow[]

    // Clear existing dishes before seeding
    await prisma.dish.deleteMany()

    let order = 1
    let currentCategory = ''

    for (const row of rows) {
        if (row.category !== currentCategory) {
            currentCategory = row.category
            order = 1
        }

        await prisma.dish.create({
            data: {
                nameEn: row.english_name,
                nameEl: row.greek_name,
                nameRu: row.russian_name,
                descEn: row.english_description,
                descEl: row.greek_description,
                descRu: row.russian_description,
                price: parseFloat(row.price),
                category: row.category,
                order: order++,
            },
        })
    }

    console.log(`✔ ${rows.length} dishes inserted from CSV`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())