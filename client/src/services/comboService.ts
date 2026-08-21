import { api } from '@/lib/api'
import type { Combo } from '@/types/combo'

export const comboService = {
  getActiveCombos: async (): Promise<Combo[]> => {
    const res = await api.get<{ data: Combo[] }>('/combos/active')
    return res.data
  },
}
