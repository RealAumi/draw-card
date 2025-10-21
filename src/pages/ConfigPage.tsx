import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrizes } from '../contexts/PrizeContext'
import { Prize } from '../types'

export default function ConfigPage() {
  const navigate = useNavigate()
  const { prizes, addPrize, updatePrize, deletePrize } = usePrizes()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    ratio: 10,
    stock: 1,
    color: '#FF6B6B'
  })

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#96CEB4', '#FFEAA7', '#DFE6E9', '#A29BFE'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updatePrize(editingId, formData)
      setEditingId(null)
    } else {
      const newPrize: Prize = {
        id: Date.now().toString(),
        ...formData
      }
      addPrize(newPrize)
    }
    setFormData({ name: '', ratio: 10, stock: 1, color: '#FF6B6B' })
    setShowAddForm(false)
  }

  const handleEdit = (prize: Prize) => {
    setFormData({
      name: prize.name,
      ratio: prize.ratio,
      stock: prize.stock,
      color: prize.color
    })
    setEditingId(prize.id)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setFormData({ name: '', ratio: 10, stock: 1, color: '#FF6B6B' })
    setEditingId(null)
    setShowAddForm(false)
  }

  const totalRatio = prizes.reduce((sum, p) => sum + p.ratio, 0)

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">抽奖配置</h1>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/lottery')}
          >
            开始抽奖
          </button>
        </div>

        {/* 统计信息 */}
        <div className="stats shadow mb-8 w-full">
          <div className="stat">
            <div className="stat-title">奖项总数</div>
            <div className="stat-value">{prizes.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">概率总和</div>
            <div className="stat-value" style={{ color: totalRatio === 100 ? '#36D399' : '#F87272' }}>
              {totalRatio}%
            </div>
            <div className="stat-desc">
              {totalRatio === 100 ? '✓ 概率正确' : '⚠ 需要等于100%'}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">总库存</div>
            <div className="stat-value">{prizes.reduce((sum, p) => sum + p.stock, 0)}</div>
          </div>
        </div>

        {/* 奖项列表 */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-2xl">奖项列表</h2>
              {!showAddForm && (
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddForm(true)}
                >
                  添加奖项
                </button>
              )}
            </div>

            {/* 添加/编辑表单 */}
            {showAddForm && (
              <form onSubmit={handleSubmit} className="bg-base-200 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  {editingId ? '编辑奖项' : '添加新奖项'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">奖项名称</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">中奖比例 (%)</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={formData.ratio}
                      onChange={(e) => setFormData({ ...formData, ratio: Number(e.target.value) })}
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">库存数量</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">颜色</span>
                    </label>
                    <div className="flex gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-10 h-10 rounded-full border-4 ${
                            formData.color === color ? 'border-primary' : 'border-base-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? '保存' : '添加'}
                  </button>
                  <button type="button" className="btn" onClick={handleCancel}>
                    取消
                  </button>
                </div>
              </form>
            )}

            {/* 奖项表格 */}
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>颜色</th>
                    <th>名称</th>
                    <th>比例</th>
                    <th>库存</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {prizes.map((prize) => (
                    <tr key={prize.id}>
                      <td>
                        <div 
                          className="w-12 h-12 rounded-lg"
                          style={{ backgroundColor: prize.color }}
                        />
                      </td>
                      <td className="font-semibold">{prize.name}</td>
                      <td>
                        <div className="badge badge-primary">{prize.ratio}%</div>
                      </td>
                      <td>
                        <div className={`badge ${prize.stock > 0 ? 'badge-success' : 'badge-error'}`}>
                          {prize.stock}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleEdit(prize)}
                          >
                            编辑
                          </button>
                          <button 
                            className="btn btn-sm btn-error btn-ghost"
                            onClick={() => deletePrize(prize.id)}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
