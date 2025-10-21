import { createContext, useContext, useState, ReactNode } from 'react'
import { Prize, LotteryResult } from '../types'

interface PrizeContextType {
  prizes: Prize[]
  setPrizes: (prizes: Prize[]) => void
  addPrize: (prize: Prize) => void
  updatePrize: (id: string, prize: Partial<Prize>) => void
  deletePrize: (id: string) => void
  results: LotteryResult[]
  addResult: (result: LotteryResult) => void
  decrementStock: (id: string) => void
}

const PrizeContext = createContext<PrizeContextType | undefined>(undefined)

export function PrizeProvider({ children }: { children: ReactNode }) {
  const [prizes, setPrizes] = useState<Prize[]>([
    {
      id: '1',
      name: '一等奖',
      ratio: 5,
      stock: 1,
      color: '#FF6B6B'
    },
    {
      id: '2',
      name: '二等奖',
      ratio: 10,
      stock: 3,
      color: '#4ECDC4'
    },
    {
      id: '3',
      name: '三等奖',
      ratio: 20,
      stock: 5,
      color: '#45B7D1'
    },
    {
      id: '4',
      name: '参与奖',
      ratio: 65,
      stock: 100,
      color: '#FFA07A'
    }
  ])
  
  const [results, setResults] = useState<LotteryResult[]>([])

  const addPrize = (prize: Prize) => {
    setPrizes([...prizes, prize])
  }

  const updatePrize = (id: string, updatedPrize: Partial<Prize>) => {
    setPrizes(prizes.map(p => p.id === id ? { ...p, ...updatedPrize } : p))
  }

  const deletePrize = (id: string) => {
    setPrizes(prizes.filter(p => p.id !== id))
  }

  const addResult = (result: LotteryResult) => {
    setResults([...results, result])
  }

  const decrementStock = (id: string) => {
    setPrizes(prizes.map(p => 
      p.id === id && p.stock > 0 ? { ...p, stock: p.stock - 1 } : p
    ))
  }

  return (
    <PrizeContext.Provider value={{
      prizes,
      setPrizes,
      addPrize,
      updatePrize,
      deletePrize,
      results,
      addResult,
      decrementStock
    }}>
      {children}
    </PrizeContext.Provider>
  )
}

export function usePrizes() {
  const context = useContext(PrizeContext)
  if (context === undefined) {
    throw new Error('usePrizes must be used within a PrizeProvider')
  }
  return context
}
