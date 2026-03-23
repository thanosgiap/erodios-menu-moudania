'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

type Dish = {
    id: number
    category: string
    nameEn: string
    nameEl: string
    nameRu: string
    descEn: string
    descEl: string
    descRu: string
    price: number
    order: number
    visible: boolean
}

const CATEGORIES = ['soup', 'appetizer', 'salad', 'pasta', 'fish', 'seafood', 'meat', 'speciality', 'suggestion', 'dessert', 'coffee']

const empty: Omit<Dish, 'id'> = {
    category: 'appetizer',
    nameEn: '', nameEl: '', nameRu: '',
    descEn: '', descEl: '', descRu: '',
    price: 0, order: 0,
    visible: true,
}

export default function AdminClient({ initialDishes }: { initialDishes: Dish[] }) {
    const router = useRouter()
    const [dishes, setDishes] = useState<Dish[]>(initialDishes)
    const [editing, setEditing] = useState<Dish | null>(null)
    const [adding, setAdding] = useState(false)
    const [form, setForm] = useState<Omit<Dish, 'id'>>(empty)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [filterCat, setFilterCat] = useState('all')

    const filtered = dishes.filter(d => {
        const matchCat = filterCat === 'all' || d.category === filterCat
        const matchSearch = d.nameEn.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    function startEdit(dish: Dish) {
        setEditing(dish)
        setAdding(false)
        setForm({
            category: dish.category,
            nameEn: dish.nameEn,
            nameEl: dish.nameEl,
            nameRu: dish.nameRu,
            descEn: dish.descEn,
            descEl: dish.descEl,
            descRu: dish.descRu,
            price: dish.price,
            order: dish.order,
            visible: dish.visible,
        })
    }

    function startAdd() {
        setAdding(true)
        setEditing(null)
        setForm(empty)
    }

    function cancelForm() {
        setEditing(null)
        setAdding(false)
        setForm(empty)
    }

    async function saveDish() {
        setLoading(true)
        if (editing) {
            const res = await fetch(`/api/dishes/${editing.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const updated = await res.json()
            setDishes(dishes.map(d => d.id === editing.id ? updated : d))
        } else {
            const res = await fetch('/api/dishes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const created = await res.json()
            setDishes([...dishes, created])
        }
        cancelForm()
        setLoading(false)
        router.refresh()
    }

    async function deleteDish(id: number) {
        if (!confirm('Delete this dish?')) return
        await fetch(`/api/dishes/${id}`, { method: 'DELETE' })
        setDishes(dishes.filter(d => d.id !== id))
        router.refresh()
    }

    async function toggleVisibility(dish: Dish) {
        const res = await fetch(`/api/dishes/${dish.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...dish, visible: !dish.visible }),
        })
        const updated = await res.json()
        setDishes(dishes.map(d => d.id === dish.id ? updated : d))
    }

    const inputStyle = {
        width: '100%', padding: '8px 10px', background: 'transparent',
        border: '0.5px solid rgba(122,106,85,0.4)', borderRadius: '2px',
        fontSize: '13px', fontFamily: 'inherit', color: '#2C2820',
    }
    const labelStyle = {
        display: 'block' as const, fontSize: '10px', letterSpacing: '0.12em',
        textTransform: 'uppercase' as const, color: '#7A6A55', marginBottom: '4px', fontWeight: 300,
    }

    return (
        <main style={{ minHeight: '100vh', background: '#EFE9DC', fontFamily: '"Jost", sans-serif', paddingBottom: '4rem' }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Philosopher&family=Jost:wght@300;400&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } input,select,textarea { outline: none; } input:focus,select:focus,textarea:focus { border-color: rgba(122,106,85,0.7) !important; }`}</style>

            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', borderBottom: '0.5px solid rgba(122,106,85,0.2)', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontFamily: '"Philosopher", serif', fontWeight: 400, fontSize: '1.8rem', color: '#2C2820' }}>Erodios</h1>
                    <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7A6A55', fontWeight: 300 }}>Manager Dashboard</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <a href="/" style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#7A6A55', textDecoration: 'none' }}>← View Menu</a>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ background: 'transparent', border: '0.5px solid rgba(122,106,85,0.4)', borderRadius: '2px', padding: '6px 14px', fontSize: '11px', letterSpacing: '0.12em', color: '#7A6A55', cursor: 'pointer', fontFamily: 'inherit' }}>Sign Out</button>
                </div>
            </header>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>

                {/* Toolbar */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' as const }}>
                    <input
                        placeholder="Search dishes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ ...inputStyle, maxWidth: '220px' }}
                    />
                    <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inputStyle, maxWidth: '160px' }}>
                        <option value="all">All categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={startAdd} style={{ marginLeft: 'auto', background: '#2C2820', color: '#F7F3EE', border: 'none', borderRadius: '2px', padding: '8px 18px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>
                        + Add Dish
                    </button>
                </div>

                {/* Add / Edit Form */}
                {(adding || editing) && (
                    <div style={{ background: '#fff', border: '0.5px solid rgba(122,106,85,0.25)', borderRadius: '4px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontFamily: '"Philosopher", serif', fontWeight: 400, fontSize: '1.2rem', color: '#2C2820', marginBottom: '1.2rem' }}>
                            {adding ? 'Add New Dish' : 'Edit Dish'}
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Category</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Price (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={form.price}
                                    onChange={e => setForm({ ...form, price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div><label style={labelStyle}>Name (English)</label><input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} style={inputStyle} /></div>
                            <div><label style={labelStyle}>Name (Greek)</label><input value={form.nameEl} onChange={e => setForm({ ...form, nameEl: e.target.value })} style={inputStyle} /></div>
                            <div><label style={labelStyle}>Name (Russian)</label><input value={form.nameRu} onChange={e => setForm({ ...form, nameRu: e.target.value })} style={inputStyle} /></div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div><label style={labelStyle}>Description (English)</label><textarea rows={3} value={form.descEn} onChange={e => setForm({ ...form, descEn: e.target.value })} style={{ ...inputStyle, resize: 'vertical' as const }} /></div>
                            <div><label style={labelStyle}>Description (Greek)</label><textarea rows={3} value={form.descEl} onChange={e => setForm({ ...form, descEl: e.target.value })} style={{ ...inputStyle, resize: 'vertical' as const }} /></div>
                            <div><label style={labelStyle}>Description (Russian)</label><textarea rows={3} value={form.descRu} onChange={e => setForm({ ...form, descRu: e.target.value })} style={{ ...inputStyle, resize: 'vertical' as const }} /></div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={saveDish} disabled={loading} style={{ background: '#2C2820', color: '#F7F3EE', border: 'none', borderRadius: '2px', padding: '8px 20px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={cancelForm} style={{ background: 'transparent', border: '0.5px solid rgba(122,106,85,0.4)', borderRadius: '2px', padding: '8px 20px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', color: '#7A6A55' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Dishes Table */}
                <div style={{ background: '#fff', border: '0.5px solid rgba(122,106,85,0.25)', borderRadius: '4px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ borderBottom: '0.5px solid rgba(122,106,85,0.2)' }}>
                                {['Category', 'Name (EN)', 'Name (EL)', 'Name (RU)', 'Price', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6A55', fontWeight: 400 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((dish, i) => (
                                <tr key={dish.id} style={{
                                    borderBottom: '0.5px solid rgba(122,106,85,0.1)',
                                    background: i % 2 === 0 ? 'transparent' : 'rgba(122,106,85,0.03)',
                                    opacity: dish.visible ? 1 : 0.4,
                                }}>
                                    <td style={{ padding: '10px 14px', color: '#7A6A55' }}>{dish.category}</td>
                                    <td style={{ padding: '10px 14px', color: '#2C2820' }}>{dish.nameEn}</td>
                                    <td style={{ padding: '10px 14px', color: '#2C2820' }}>{dish.nameEl}</td>
                                    <td style={{ padding: '10px 14px', color: '#2C2820' }}>{dish.nameRu}</td>
                                    <td style={{ padding: '10px 14px', color: '#2C2820' }}>€{dish.price.toFixed(2)}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => startEdit(dish)}
                                                style={{ background: 'transparent', border: '0.5px solid rgba(122,106,85,0.4)', borderRadius: '2px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', color: '#7A6A55' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => toggleVisibility(dish)}
                                                style={{ background: 'transparent', border: `0.5px solid ${dish.visible ? 'rgba(60,140,80,0.4)' : 'rgba(122,106,85,0.4)'}`, borderRadius: '2px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', color: dish.visible ? '#2D7A45' : '#7A6A55' }}
                                            >
                                                {dish.visible ? 'Hide' : 'Show'}
                                            </button>
                                            <button
                                                onClick={() => deleteDish(dish.id)}
                                                style={{ background: 'transparent', border: '0.5px solid rgba(180,80,60,0.4)', borderRadius: '2px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', color: '#9B3A2A' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <p style={{ textAlign: 'center', padding: '2rem', fontSize: '13px', color: '#7A6A55', fontWeight: 300 }}>No dishes found.</p>
                    )}
                </div>

                <p style={{ textAlign: 'center', fontSize: '11px', color: '#7A6A55', marginTop: '1.5rem', fontWeight: 300 }}>
                    {dishes.length} dishes total
                </p>
            </div>
        </main>
    )
}