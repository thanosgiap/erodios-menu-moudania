import { prisma } from '../lib/prisma'
import { ui, Language } from '../lib/translations'
import LanguageSwitcher from '../components/LanguageSwitcher'
import CategoryNav from '../components/CategoryNav'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ lang?: string }>
}

const CATEGORY_ORDER = ['soup', 'appetizer', 'salad', 'pasta', 'fish', 'seafood', 'meat', 'speciality', 'suggestion', 'dessert', 'coffee']

export default async function MenuPage({ searchParams }: Props) {
  const { lang } = await searchParams
  const language: Language =
    lang === 'en' || lang === 'ru' ? lang : 'el'

  const t = ui[language]

  const dishes = await prisma.dish.findMany({
    where: { visible: true },
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  })

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = dishes.filter(d => d.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {} as Record<string, typeof dishes>)

  return (
    <main style={{
      background: '#EFE9DC',
      minHeight: '100vh',
      fontFamily: '"Jost", sans-serif',
      paddingBottom: '4rem',
    }}>

      {/* Google Fonts */}
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Philosopher:ital,wght@0,400;0,700;1,400&family=Jost:wght@300;400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
`}</style>

      {/* Hero */}
      <header style={{ position: 'relative', textAlign: 'center', padding: '3.5rem 2rem 2rem', borderBottom: '0.5px solid rgba(122,106,85,0.2)', marginBottom: '2.5rem' }}>

        {/* Language switcher - top left */}
        <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
          <LanguageSwitcher current={language} />
        </div>

        {/* Category nav - top right */}
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
          <CategoryNav
            categories={Object.keys(grouped)}
            labels={t}
          />
        </div>

        {/* Hero text stays centered */}
        <p style={{ fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#7A6A55', marginBottom: '0.75rem', fontWeight: 300 }}>
          {t.location}
        </p>
        <h1 style={{ fontFamily: '"Philosopher", serif', fontWeight: 400, fontSize: '3.2rem', letterSpacing: '0.04em', color: '#2C2820', marginBottom: '0.4rem', lineHeight: 1.1 }}>
          Erodios Restaurant
        </h1>
        <p style={{ fontSize: '12px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6B5F52' }}>
          {t.tagline}
        </p>

      </header>

      {/* Menu */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1.5rem' }}>
        {Object.entries(grouped).map(([cat, items]) => (
          <section key={cat} id={cat} style={{ marginBottom: '2rem' }}>

            {/* Category title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2.5rem 0 1.2rem' }}>
              <h2 style={{
                fontFamily: '"Philosopher", serif',
                fontWeight: 400,
                fontSize: '1.05rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#7A6A55',
                whiteSpace: 'nowrap',
              }}>
                {t[cat as keyof typeof t] ?? cat}
              </h2>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(122,106,85,0.2)' }} />
            </div>

            {/* Dishes */}
            {items.map(dish => (
              <div key={dish.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '1rem',
                padding: '1rem 0',
                borderBottom: '0.5px solid rgba(122,106,85,0.15)',
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: '"Philosopher", serif', fontSize: '1.15rem', fontWeight: 400, color: '#2C2820', marginBottom: '3px' }}>
                    {language === 'el' ? dish.nameEl : language === 'ru' ? dish.nameRu : dish.nameEn}
                  </p>

                  <p style={{ fontSize: '12px', fontWeight: 300, color: '#6B5F52', lineHeight: 1.6 }}>
                    {language === 'el' ? dish.descEl : language === 'ru' ? dish.descRu : dish.descEn}
                  </p>
                </div>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.05rem', fontWeight: 300, color: '#7A6A55', whiteSpace: 'nowrap' }}>
                  €{dish.price.toFixed(2)}
                </span>
              </div>
            ))}
          </section>
        ))}
      </div>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontSize: '11px', fontWeight: 300, letterSpacing: '0.15em', color: '#7A6A55', marginTop: '3rem', opacity: 0.7 }}>
        {t.footer}
      </p>
    </main>
  )
}