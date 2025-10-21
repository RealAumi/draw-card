import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrizes } from '../contexts/PrizeContext'
import { Prize } from '../types'

export default function LotteryPage() {
  const navigate = useNavigate()
  const { prizes, addResult, decrementStock } = usePrizes()
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null)
  const [showResult, setShowResult] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)

  // 计算每个奖项的角度范围
  const calculateAngles = () => {
    let currentAngle = 0
    return prizes.map(prize => {
      const angle = (prize.ratio / 100) * 360
      const result = {
        prize,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        midAngle: currentAngle + angle / 2
      }
      currentAngle += angle
      return result
    })
  }

  const prizeAngles = calculateAngles()

  // 根据概率和库存选择奖项
  const selectPrize = (): Prize | null => {
    const availablePrizes = prizes.filter(p => p.stock > 0)
    if (availablePrizes.length === 0) return null

    const totalRatio = availablePrizes.reduce((sum, p) => sum + p.ratio, 0)
    let random = Math.random() * totalRatio
    
    for (const prize of availablePrizes) {
      random -= prize.ratio
      if (random <= 0) {
        return prize
      }
    }
    
    return availablePrizes[0]
  }

  const handleSpin = () => {
    if (isSpinning) return

    const prize = selectPrize()
    if (!prize) {
      alert('所有奖品已抽完！')
      return
    }

    setIsSpinning(true)
    setShowResult(false)
    
    // 找到中奖奖项的角度
    const prizeAngle = prizeAngles.find(pa => pa.prize.id === prize.id)
    if (!prizeAngle) return

    // 计算目标角度 (指针在顶部，指向中奖扇形的中心)
    // 转盘顺时针旋转，指针固定在顶部(0度)
    const targetAngle = 360 - prizeAngle.midAngle + 90 // 调整使指针对准扇形中心
    const spinRotations = 5 // 额外旋转5圈
    const finalRotation = rotation + (360 * spinRotations) + targetAngle

    setRotation(finalRotation)

    // 动画结束后显示结果
    setTimeout(() => {
      setSelectedPrize(prize)
      setShowResult(true)
      setIsSpinning(false)
      addResult({
        prize,
        timestamp: Date.now()
      })
      decrementStock(prize.id)
    }, 5000)
  }

  const handleClose = () => {
    setShowResult(false)
    setSelectedPrize(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4 relative">
      {/* 返回按钮 */}
      <button
        className="btn btn-ghost absolute top-4 left-4 text-white"
        onClick={() => navigate('/')}
      >
        ← 返回配置
      </button>

      {/* 标题 */}
      <h1 className="text-5xl font-bold text-white mb-8 animate-pulse">
        幸运大转盘
      </h1>

      {/* 转盘容器 */}
      <div className="relative w-[500px] h-[500px] mb-8">
        {/* 指针 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-0 h-0 border-l-[25px] border-r-[25px] border-t-[50px] border-l-transparent border-r-transparent border-t-red-500 filter drop-shadow-lg" />
        </div>

        {/* 转盘 */}
        <div
          ref={wheelRef}
          className="w-full h-full rounded-full shadow-2xl relative overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {/* 绘制扇形 */}
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {prizeAngles.map((pa) => {
              const startAngle = (pa.startAngle - 90) * (Math.PI / 180)
              const endAngle = (pa.endAngle - 90) * (Math.PI / 180)
              
              const x1 = 100 + 100 * Math.cos(startAngle)
              const y1 = 100 + 100 * Math.sin(startAngle)
              const x2 = 100 + 100 * Math.cos(endAngle)
              const y2 = 100 + 100 * Math.sin(endAngle)
              
              const largeArc = (pa.endAngle - pa.startAngle) > 180 ? 1 : 0
              
              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 100 100 0 ${largeArc} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ')

              // 计算文字位置
              const textAngle = (pa.midAngle - 90) * (Math.PI / 180)
              const textX = 100 + 70 * Math.cos(textAngle)
              const textY = 100 + 70 * Math.sin(textAngle)

              return (
                <g key={pa.prize.id}>
                  <path
                    d={pathData}
                    fill={pa.prize.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${pa.midAngle}, ${textX}, ${textY})`}
                  >
                    {pa.prize.name}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* 中心圆 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="text-2xl font-bold text-gray-800">抽奖</div>
          </div>
        </div>

        {/* 外圈装饰 */}
        <div className="absolute inset-0 rounded-full border-8 border-yellow-400 animate-spin-slow" 
             style={{ animation: 'spin 20s linear infinite' }} />
      </div>

      {/* 抽奖按钮 */}
      <button
        className={`btn btn-lg btn-primary ${isSpinning ? 'btn-disabled' : ''} text-xl px-12`}
        onClick={handleSpin}
        disabled={isSpinning}
      >
        {isSpinning ? '抽奖中...' : '开始抽奖'}
      </button>

      {/* 剩余库存提示 */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        {prizes.map(prize => (
          <div key={prize.id} className="badge badge-lg gap-2" style={{ backgroundColor: prize.color, color: 'white' }}>
            {prize.name}: {prize.stock}
          </div>
        ))}
      </div>

      {/* 中奖结果弹窗 */}
      {showResult && selectedPrize && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">🎉 恭喜中奖 🎉</h2>
              <div 
                className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: selectedPrize.color }}
              >
                <span className="text-4xl font-bold text-white">
                  {selectedPrize.name}
                </span>
              </div>
              <p className="text-xl mb-6">您获得了 <span className="font-bold text-primary">{selectedPrize.name}</span></p>
              <p className="text-gray-600 mb-6">剩余库存: {selectedPrize.stock}</p>
              <button
                className="btn btn-primary btn-wide"
                onClick={handleClose}
              >
                继续抽奖
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
