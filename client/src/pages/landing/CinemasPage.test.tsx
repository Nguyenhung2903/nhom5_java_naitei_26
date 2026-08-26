import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { CinemasPage } from './CinemasPage'
import { theaterService } from '@/services/theaterService'

vi.mock('@/services/theaterService', () => ({
  theaterService: {
    getAll: vi.fn(),
  },
}))

describe('CinemasPage', () => {
  it('loads and displays the public cinema list', async () => {
    vi.mocked(theaterService.getAll).mockResolvedValue([
      { id: 'theater-1', name: 'Cinema A', address: 'Address A', phone: '0123456789' },
    ])

    render(
      <MemoryRouter>
        <CinemasPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Cinema A')).toBeTruthy()
    expect(screen.getByText('Address A')).toBeTruthy()
    expect(theaterService.getAll).toHaveBeenCalledOnce()
  })
})
