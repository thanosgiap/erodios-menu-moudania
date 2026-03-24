'use client'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable'
import SortableDishRow from './SortableDishRow'
import { useState, useEffect } from 'react'
import React from 'react'

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

    const filtered = dishes
        .filter(d => {
            const matchCat = filterCat === 'all' || d.category === filterCat
            const matchSearch = d.nameEn.toLowerCase().includes(search.toLowerCase())
            return matchCat && matchSearch
        })
        .sort((a, b) => {
            const catDiff = CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category)
            if (catDiff !== 0) return catDiff
            return a.order - b.order
        })

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const activeDish = dishes.find(d => d.id === active.id)
        const overDish = dishes.find(d => d.id === over.id)

        if (!activeDish || !overDish) return
        if (activeDish.category !== overDish.category) return

        const categoryDishes = dishes.filter(d => d.category === activeDish.category)
        const otherDishes = dishes.filter(d => d.category !== activeDish.category)

        const oldIndex = categoryDishes.findIndex(d => d.id === active.id)
        const newIndex = categoryDishes.findIndex(d => d.id === over.id)

        const reordered = arrayMove(categoryDishes, oldIndex, newIndex)
        const updatedCategory = reordered.map((d, i) => ({ ...d, order: i + 1 }))

        const allDishes = [...otherDishes, ...updatedCategory].sort((a, b) => {
            if (a.category === b.category) return a.order - b.order
            return a.category.localeCompare(b.category)
        })

        setDishes(allDishes)

        await fetch('/api/dishes/reorder', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dishes: updatedCategory.map(d => ({ id: d.id, order: d.order }))
            }),
        })

        router.refresh()
    }

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
                    <div
                        onClick={(e) => { if (e.target === e.currentTarget) cancelForm() }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(44,40,32,0.5)',
                            zIndex: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem',
                        }}
                    >
                        <div style={{
                            background: '#F7F3EE',
                            border: '0.5px solid rgba(122,106,85,0.25)',
                            borderRadius: '4px',
                            padding: '2rem',
                            width: '100%',
                            maxWidth: '860px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            position: 'relative',
                        }}>

                            {/* Close button */}
                            <button
                                onClick={cancelForm}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    color: '#7A6A55',
                                    lineHeight: 1,
                                    padding: '4px 8px',
                                }}
                            >
                                ✕
                            </button>

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
                                    <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value === '' ? 0 : parseFloat(e.target.value) })} style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div><label style={labelStyle}>Name (Greek)</label><input value={form.nameEl} onChange={e => setForm({ ...form, nameEl: e.target.value })} style={inputStyle} /></div>
                                <div><label style={labelStyle}>Name (English)</label><input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} style={inputStyle} /></div>
                                <div><label style={labelStyle}>Name (Russian)</label><input value={form.nameRu} onChange={e => setForm({ ...form, nameRu: e.target.value })} style={inputStyle} /></div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div><label style={labelStyle}>Description (Greek)</label><textarea rows={3} value={form.descEl} onChange={e => setForm({ ...form, descEl: e.target.value })} style={{ ...inputStyle, resize: 'vertical' as const }} /></div>
                                <div><label style={labelStyle}>Description (English)</label><textarea rows={3} value={form.descEn} onChange={e => setForm({ ...form, descEn: e.target.value })} style={{ ...inputStyle, resize: 'vertical' as const }} /></div>
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
                    </div>
                )}

                {/* Dishes Table */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div style={{ background: '#fff', border: '0.5px solid rgba(122,106,85,0.25)', borderRadius: '4px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: '0.5px solid rgba(122,106,85,0.2)' }}>
                                    {['', 'Category', 'Name (EL)', 'Name (EN)', 'Name (RU)', 'Price', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6A55', fontWeight: 400 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <SortableContext items={filtered.map(d => d.id)} strategy={verticalListSortingStrategy}>
                                    {filtered.map((dish, i) => {
                                        const showCategoryHeader = i === 0 || filtered[i - 1].category !== dish.category
                                        return (
                                            <React.Fragment key={dish.id}>
                                                {showCategoryHeader && (
                                                    <tr key={`header-${dish.category}`}>
                                                        <td colSpan={7} style={{
                                                            padding: '16px 14px 8px',
                                                            fontSize: '15px',
                                                            letterSpacing: '0.2em',
                                                            textTransform: 'uppercase',
                                                            color: '#7A6A55',
                                                            fontWeight: 400,
                                                            borderBottom: '0.5px solid rgba(122,106,85,0.2)',
                                                            background: 'rgba(122,106,85,0.05)',
                                                            textAlign: 'center',
                                                        }}>
                                                            {dish.category}
                                                        </td>
                                                    </tr>
                                                )}
                                                <SortableDishRow
                                                    dish={dish}
                                                    index={i}
                                                    onEdit={startEdit}
                                                    onDelete={deleteDish}
                                                    onToggle={toggleVisibility}
                                                />
                                            </React.Fragment>
                                        )
                                    })}
                                </SortableContext>
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <p style={{ textAlign: 'center', padding: '2rem', fontSize: '13px', color: '#7A6A55', fontWeight: 300 }}>No dishes found.</p>
                        )}
                    </div>
                </DndContext>

                <p style={{ textAlign: 'center', fontSize: '11px', color: '#7A6A55', marginTop: '1.5rem', fontWeight: 300 }}>
                    {dishes.length} dishes total
                </p>
            </div>
        </main>
    )
}