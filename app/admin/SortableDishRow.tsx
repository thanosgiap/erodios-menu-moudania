'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

type Props = {
  dish: Dish
  index: number
  onEdit: (dish: Dish) => void
  onDelete: (id: number) => void
  onToggle: (dish: Dish) => void
}

export default function SortableDishRow({ dish, index, onEdit, onDelete, onToggle }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: dish.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : dish.visible ? 1 : 0.4,
    background: index % 2 === 0 ? 'transparent' : 'rgba(122,106,85,0.03)',
    borderBottom: '0.5px solid rgba(122,106,85,0.1)',
  }

  return (
    <tr ref={setNodeRef} style={style}>
      <td style={{ padding: '10px 14px', cursor: 'grab', color: '#7A6A55', width: '30px' }} {...attributes} {...listeners}>
        ⠿
      </td>
      <td style={{ padding: '10px 14px', color: '#7A6A55' }}>{dish.category}</td>
      <td style={{ padding: '10px 14px', color: '#2C2820' }}>{dish.nameEl}</td>
      <td style={{ padding: '10px 14px', color: '#2C2820' }}>{dish.nameEn}</td>
      <td style={{ padding: '10px 14px', color: '#2C2820' }}>{dish.nameRu}</td>
      <td style={{ padding: '10px 14px', color: '#2C2820' }}>€{dish.price.toFixed(2)}</td>
      <td style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onEdit(dish)} style={{ background: 'transparent', border: '0.5px solid rgba(122,106,85,0.4)', borderRadius: '2px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', color: '#7A6A55' }}>Επεξεργασία</button>
          <button onClick={() => onToggle(dish)} style={{ background: 'transparent', border: `0.5px solid ${dish.visible ? 'rgba(60,140,80,0.4)' : 'rgba(122,106,85,0.4)'}`, borderRadius: '2px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', color: dish.visible ? '#2D7A45' : '#7A6A55' }}>{dish.visible ? 'Απόκρυψη' : 'Εμφάνιση'}</button>
          <button onClick={() => onDelete(dish.id)} style={{ background: 'transparent', border: '0.5px solid rgba(180,80,60,0.4)', borderRadius: '2px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', color: '#9B3A2A' }}>Διαγραφή</button>
        </div>
      </td>
    </tr>
  )
}