import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GenreManagementPage } from './GenreManagementPage'
import { genreService } from '@/services/genreService'

vi.mock('@/services/genreService', () => ({
  genreService: {
    getGenres: vi.fn(),
    getGenreById: vi.fn(),
    createGenre: vi.fn(),
    updateGenre: vi.fn(),
    deleteGenre: vi.fn(),
  },
}))

const mockGenres = [
  {
    id: 'genre-1',
    name: 'Hành động',
    description: 'Phim hành động kịch tính',
    movieCount: 3,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'genre-2',
    name: 'Hoạt hình',
    description: 'Phim hoạt hình thiếu nhi',
    movieCount: 0,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
]

describe('GenreManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(genreService.getGenres).mockResolvedValue(mockGenres)
  })

  it('renders page header, genres list and description without displaying ID', async () => {
    render(
      <MemoryRouter>
        <GenreManagementPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Quản lý Thể loại phim')).toBeInTheDocument()
    const actionItems = await screen.findAllByText('Hành động')
    expect(actionItems.length).toBeGreaterThan(0)

    const animationItems = screen.getAllByText('Hoạt hình')
    expect(animationItems.length).toBeGreaterThan(0)

    // Verify description is rendered
    const descItems = screen.getAllByText('Phim hành động kịch tính')
    expect(descItems.length).toBeGreaterThan(0)

    // Verify ID string is NOT displayed
    expect(screen.queryByText(/ID: genre-1/i)).not.toBeInTheDocument()

    const threeMovies = screen.getAllByText('3 phim')
    expect(threeMovies.length).toBeGreaterThan(0)
  })

  it('opens create modal and creates a new genre with description', async () => {
    vi.mocked(genreService.createGenre).mockResolvedValue({
      id: 'genre-3',
      name: 'Kinh dị',
      description: 'Phim giật gân hồi hộp',
      movieCount: 0,
    })

    render(
      <MemoryRouter>
        <GenreManagementPage />
      </MemoryRouter>
    )

    await screen.findAllByText('Hành động')

    const addButton = screen.getByRole('button', { name: /Thêm thể loại/i })
    fireEvent.click(addButton)

    expect(screen.getByText('Thêm thể loại phim mới')).toBeInTheDocument()

    const nameInput = screen.getByPlaceholderText(/VD: Hành Động/i)
    const descInput = screen.getByPlaceholderText(/VD: Phim có tiết tấu nhanh/i)

    fireEvent.change(nameInput, { target: { value: 'Kinh dị' } })
    fireEvent.change(descInput, { target: { value: 'Phim giật gân hồi hộp' } })

    const submitBtn = screen.getByRole('button', { name: /^Tạo thể loại$/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(genreService.createGenre).toHaveBeenCalledWith({
        name: 'Kinh dị',
        description: 'Phim giật gân hồi hộp',
      })
    })
  })

  it('opens edit modal for genre and updates name and description successfully', async () => {
    vi.mocked(genreService.updateGenre).mockResolvedValue({
      id: 'genre-1',
      name: 'Hành động & Phiêu lưu',
      description: 'Mô tả thể loại hành động cập nhật',
      movieCount: 3,
    })

    render(
      <MemoryRouter>
        <GenreManagementPage />
      </MemoryRouter>
    )

    await screen.findAllByText('Hành động')

    const editButtons = screen.getAllByTitle('Chỉnh sửa thông tin thể loại')
    fireEvent.click(editButtons[0])

    expect(screen.getByText('Chỉnh sửa thể loại phim')).toBeInTheDocument()
    expect(screen.getByText(/Thể loại này đang được gắn cho/i)).toBeInTheDocument()

    const nameInput = screen.getByPlaceholderText('Tên thể loại')
    const descInput = screen.getByPlaceholderText('Mô tả chi tiết thể loại...')

    fireEvent.change(nameInput, { target: { value: 'Hành động & Phiêu lưu' } })
    fireEvent.change(descInput, { target: { value: 'Mô tả thể loại hành động cập nhật' } })

    const saveBtn = screen.getByRole('button', { name: /Lưu thay đổi/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(genreService.updateGenre).toHaveBeenCalledWith('genre-1', {
        name: 'Hành động & Phiêu lưu',
        description: 'Mô tả thể loại hành động cập nhật',
      })
    })
  })

  it('prevents deletion when genre has linked movies', async () => {
    render(
      <MemoryRouter>
        <GenreManagementPage />
      </MemoryRouter>
    )

    await screen.findAllByText('Hành động')

    // Click delete on genre-1 (movieCount = 3)
    const deleteButtonsBlocked = screen.getAllByTitle('Không thể xóa: Có 3 phim đang gán thể loại này')
    fireEvent.click(deleteButtonsBlocked[0])

    // Check warning confirm dialog appears
    expect(screen.getByText(/CẢNH BÁO: Thể loại này hiện đang được liên kết với 3 bộ phim/i)).toBeInTheDocument()

    // Confirm button says "Đã hiểu" and does not call API
    const acknowledgeBtn = screen.getByRole('button', { name: /Đã hiểu/i })
    fireEvent.click(acknowledgeBtn)

    expect(genreService.deleteGenre).not.toHaveBeenCalled()
  })

  it('allows deletion when genre has 0 movies', async () => {
    vi.mocked(genreService.deleteGenre).mockResolvedValue()

    render(
      <MemoryRouter>
        <GenreManagementPage />
      </MemoryRouter>
    )

    await screen.findAllByText('Hoạt hình')

    const deleteButtonsAllowed = screen.getAllByTitle('Xóa thể loại này')
    fireEvent.click(deleteButtonsAllowed[0])

    expect(screen.getByText(/Bạn có chắc chắn muốn xóa thể loại "Hoạt hình"/i)).toBeInTheDocument()

    const confirmDeleteBtn = screen.getByRole('button', { name: /^Xóa thể loại$/i })
    fireEvent.click(confirmDeleteBtn)

    await waitFor(() => {
      expect(genreService.deleteGenre).toHaveBeenCalledWith('genre-2')
    })
  })
})
