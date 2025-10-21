export interface Prize {
  id: string
  name: string
  ratio: number // 比例/概率 (0-100)
  stock: number // 库存数量
  color: string // 扇形颜色
}

export interface LotteryResult {
  prize: Prize
  timestamp: number
}
