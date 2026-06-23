import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Search, Smartphone, X, ChevronDown, ChevronUp, DollarSign, Percent } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getScreenPrices, createScreenPrice } from '../api/screenPrices'
import AnimatedBackground from '../components/AnimatedBackground'

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Motorola', 'Huawei']

const inputClass = "w-full bg-gray-900/60 border border-gray-800 focus:border-rose-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all duration-300"

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-gray-400 text-xs tracking-wider uppercase block mb-1.5 font-medium">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  )
}

function NewScreenModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    brand: 'Apple', customBrand: '', model: '', cost_price: '', sale_price: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const finalBrand = form.brand === 'Otra' ? form.customBrand.trim() : form.brand
    if (!finalBrand) {
      setError('Por favor especifica la marca.')
      setLoading(false)
      return
    }

    const cost = parseFloat(form.cost_price)
    const sale = parseFloat(form.sale_price)

    if (isNaN(cost) || cost <= 0) {
      setError('El precio costo debe ser un número positivo.')
      setLoading(false)
      return
    }

    if (isNaN(sale) || sale <= 0) {
      setError('El precio cliente debe ser un número positivo.')
      setLoading(false)
      return
    }

    if (sale < cost) {
      setError('El precio cliente no puede ser menor al precio costo.')
      setLoading(false)
      return
    }

    try {
      await createScreenPrice({
        brand: finalBrand,
        model: form.model.trim(),
        cost_price: cost,
        sale_price: sale
      })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar los precios de la pantalla.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-gray-950/90 border border-gray-800/80 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-rose-950/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white tracking-wide">Nuevo Valor de Pantalla</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-2.5 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Marca" required>
              <select
                value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value })}
                className="w-full bg-gray-900/60 border border-gray-800 focus:border-rose-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
              >
                {BRANDS.map(b => (
                  <option key={b} value={b} className="bg-gray-950">{b}</option>
                ))}
                <option value="Otra" className="bg-gray-950">Otra / Manual</option>
              </select>
            </Field>

            {form.brand === 'Otra' && (
              <Field label="Especificar Marca" required>
                <input
                  value={form.customBrand}
                  onChange={e => setForm({ ...form, customBrand: e.target.value })}
                  placeholder="Ej: OnePlus"
                  required
                  className={inputClass}
                />
              </Field>
            )}
          </div>

          <Field label="Modelo" required>
            <input
              value={form.model}
              onChange={e => setForm({ ...form, model: e.target.value })}
              placeholder="Ej: iPhone 14 Pro Max"
              required
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio Costo (Empresa)" required>
              <input
                type="number"
                step="0.01"
                value={form.cost_price}
                onChange={e => setForm({ ...form, cost_price: e.target.value })}
                placeholder="45000"
                required
                className={inputClass}
              />
            </Field>

            <Field label="Precio Venta (Cliente)" required>
              <input
                type="number"
                step="0.01"
                value={form.sale_price}
                onChange={e => setForm({ ...form, sale_price: e.target.value })}
                placeholder="89000"
                required
                className={inputClass}
              />
            </Field>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-3 rounded-xl text-sm font-semibold tracking-wider uppercase mt-4 shadow-lg shadow-rose-950/20 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Agregar Pantalla'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}

function ScreenCard({ item }) {
  const [expanded, setExpanded] = useState(false)

  // Cálculo de márgenes
  const cost = parseFloat(item.cost_price)
  const sale = parseFloat(item.sale_price)
  const profit = sale - cost
  const marginPercent = sale > 0 ? ((profit / sale) * 100).toFixed(0) : 0

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val)
  }

  // Colores por marca
  const getBrandBadgeClass = (brand) => {
    const b = brand.toLowerCase()
    if (b.includes('apple')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    if (b.includes('samsung')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    if (b.includes('xiaomi')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    if (b.includes('motorola')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    if (b.includes('huawei')) return 'bg-red-500/10 text-red-400 border-red-500/20'
    return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  }

  return (
    <div 
      className={`border rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${
        expanded 
          ? 'bg-gray-900/60 border-rose-500/30 shadow-lg shadow-rose-950/5' 
          : 'bg-gray-950/40 border-gray-800/80 hover:bg-gray-900/30 hover:border-gray-800'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Cabecera */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getBrandBadgeClass(item.brand)}`}>
              {item.brand}
            </span>
          </div>
          <h3 className="text-white font-medium text-[15px] mt-1">{item.model}</h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Al Cliente</p>
            <p className="text-rose-400 font-bold text-base mt-0.5">{formatCurrency(sale)}</p>
          </div>
          <div className="text-gray-500">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Detalle Desplegable */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-t border-gray-900/60 bg-gray-950/60"
          >
            <div className="p-4 grid grid-cols-3 gap-4 text-left">
              <div className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <DollarSign size={10} /> Costo Empresa
                </p>
                <p className="text-gray-400 font-semibold text-sm">{formatCurrency(cost)}</p>
              </div>

              <div className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <DollarSign size={10} /> Ganancia Neta
                </p>
                <p className="text-emerald-400 font-bold text-sm">+{formatCurrency(profit)}</p>
              </div>

              <div className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Percent size={10} /> Rentabilidad
                </p>
                <p className="text-rose-400 font-bold text-sm">{marginPercent}%</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ScreenPricesPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('Todas')
  const [showModal, setShowModal] = useState(false)

  const fetchPrices = async () => {
    try {
      setLoading(true)
      const data = await getScreenPrices()
      setItems(data.data)
    } catch (err) {
      console.error('Error fetching screen prices:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
  }, [])

  // Filtrado de items
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.model.toLowerCase().includes(search.toLowerCase()) || 
      item.brand.toLowerCase().includes(search.toLowerCase())
    
    const matchesBrand = selectedBrand === 'Todas' || item.brand.toLowerCase() === selectedBrand.toLowerCase()

    return matchesSearch && matchesBrand
  })

  return (
    <>
      <style>{`
        .screens-page {
          min-height: 100vh;
          background: #050508;
          color: #f1f5f9;
          font-family: 'Inter', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .blob {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(95px);
        }
        .blob-rose { top: -10%; left: 20%; width: 400px; height: 400px; background: rgba(244,63,94,.035); }
        .blob-purple { bottom: -10%; right: 20%; width: 400px; height: 400px; background: rgba(168,85,247,.035); }
        
        .nav-header {
          border-bottom: 1px solid rgba(255,255,255,.05);
          background: rgba(9,9,18,.6);
          backdrop-filter: blur(16px);
          padding: 16px 24px;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .nav-inner {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      `}</style>

      <div className="screens-page">
        <AnimatedBackground />
        <div className="blob blob-rose" />
        <div className="blob blob-purple" />

        {/* Header de navegación */}
        <header className="nav-header">
          <div className="nav-inner">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} /> Volver
            </button>
            <h1 className="text-sm font-semibold tracking-widest text-gray-300 uppercase flex items-center gap-2">
              <Smartphone size={16} className="text-rose-500" /> Consulta de Pantallas
            </h1>
            <div className="w-16" /> {/* Balance spacer */}
          </div>
        </header>

        <main className="max-w-[900px] mx-auto px-4 py-8 relative z-10 text-center">
          
          {/* Fila de Controles */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar modelo o marca..."
                className="w-full bg-gray-950/60 border border-gray-800/80 hover:border-gray-800 focus:border-rose-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none transition-all duration-300"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-950/20"
            >
              <Plus size={16} /> Agregar Pantalla
            </motion.button>
          </div>

          {/* Filtro Rápido de Marcas */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none justify-start md:justify-center">
            {['Todas', ...BRANDS, 'Otras'].map(brand => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all duration-300 shrink-0 ${
                  selectedBrand === brand
                    ? 'bg-rose-500/10 border-rose-500/50 text-rose-400'
                    : 'bg-gray-950/40 border-gray-800/80 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* Listado de Precios */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 border border-dashed border-gray-800 rounded-2xl bg-gray-950/20">
              <Smartphone className="mx-auto text-gray-600 mb-3" size={32} />
              <p className="text-gray-400 text-sm">No se encontraron precios registrados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-w-xl mx-auto">
              {filteredItems.map(item => (
                <ScreenCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </main>

        {/* Modal de Creación */}
        <AnimatePresence>
          {showModal && (
            <NewScreenModal 
              onClose={() => setShowModal(false)} 
              onCreated={() => {
                setShowModal(false)
                fetchPrices()
              }} 
            />
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
