import { api } from '@/lib/api'
import type { Combo, ComboPayload } from '@/types/combo'

export const comboService = {
  getActiveCombos: async (): Promise<Combo[]> => {
    const res = await api.get<{ data: Combo[] }>('/combos/active')
    return res.data
  },
  getAll: async (): Promise<Combo[]> => (await api.get<{ data: Combo[] }>('/combos')).data,
  create: async (payload: ComboPayload): Promise<Combo> => (await api.post<{ data: Combo }>('/combos', payload)).data,
  update: async (id: string, payload: ComboPayload): Promise<Combo> => (await api.put<{ data: Combo }>(`/combos/${id}`, payload)).data,
  delete: async (id: string): Promise<void> => { await api.delete(`/combos/${id}`) },
}
