import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Edit, Newspaper, Plus, RefreshCcw, Search, Trash2 } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from '@/components/ui'
import { newsService } from '@/services/newsService'
import type { News, NewsPayload } from '@/types/news'

const emptyForm: NewsPayload = {
  title: '',
  content: '',
  thumbnail: '',
}

export function NewsManagementPage() {
  const [newsList, setNewsList] = useState<News[]>([])
  const [form, setForm] = useState<NewsPayload>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editingNews = useMemo(
    () => newsList.find((news) => news.id === editingId) ?? null,
    [newsList, editingId]
  )

  const loadNews = async () => {
    setLoading(true)
    setError(null)
    try {
      setNewsList(await newsService.getNews(keyword))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách tin tức')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadNews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const startEdit = (news: News) => {
    setEditingId(news.id)
    setForm({
      title: news.title,
      content: news.content,
      thumbnail: news.thumbnail ?? '',
    })
  }

  const buildPayload = (): NewsPayload => ({
    title: form.title.trim(),
    content: form.content.trim(),
    thumbnail: form.thumbnail?.trim() || undefined,
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = buildPayload()
      if (editingId) {
        await newsService.updateNews(editingId, payload)
      } else {
        await newsService.createNews(payload)
      }
      resetForm()
      await loadNews()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu tin tức')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (news: News) => {
    if (!window.confirm(`Xóa tin tức "${news.title}"?`)) return
    setError(null)
    try {
      await newsService.deleteNews(news.id)
      await loadNews()
      if (editingId === news.id) resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa tin tức')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-wide text-white">
            <Newspaper className="h-6 w-6 text-[var(--rogym-green)]" />
            Quản lý tin tức
          </h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm tiêu đề hoặc nội dung"
            leftIcon={<Search className="h-4 w-4" />}
          />
          <Button type="button" variant="secondary" onClick={loadNews} loading={loading} leftIcon={<RefreshCcw className="h-4 w-4" />}>
            Lọc
          </Button>
        </div>
      </div>

      {error && (
        <Card variant="danger" padding="sm">
          <p className="text-sm text-red-200">{error}</p>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Danh sách tin tức</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {newsList.length === 0 ? (
              <p className="py-10 text-center text-sm text-[var(--rogym-text-muted)]">
                Chưa có tin tức nào.
              </p>
            ) : (
              newsList.map((news) => (
                <div
                  key={news.id}
                  className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[96px_minmax(0,1fr)_auto]"
                >
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-white/5">
                    {news.thumbnail ? (
                      <img src={news.thumbnail} alt={news.title} className="h-full w-full object-cover" />
                    ) : (
                      <Newspaper className="h-8 w-8 text-[var(--rogym-text-muted)]" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-2">
                    <h2 className="truncate text-base font-bold text-white">{news.title}</h2>
                    <p className="line-clamp-3 text-xs text-[var(--rogym-text-secondary)]">
                      {news.content}
                    </p>
                    {news.createdAt && (
                      <p className="text-xs text-[var(--rogym-text-muted)]">
                        Tạo lúc: {new Date(news.createdAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 md:flex-col">
                    <Button type="button" variant="secondary" size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={() => startEdit(news)}>
                      Sửa
                    </Button>
                    <Button type="button" variant="danger" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => void handleDelete(news)}>
                      Xóa
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card variant="accent">
          <CardHeader>
            <CardTitle>{editingNews ? `Sửa tin: ${editingNews.title}` : 'Tạo tin tức mới'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Tiêu đề"
                required
              />
              <Textarea
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                placeholder="Nội dung"
                rows={8}
                required
              />
              <Input
                value={form.thumbnail ?? ''}
                onChange={(event) => setForm((current) => ({ ...current, thumbnail: event.target.value }))}
                placeholder="URL thumbnail"
              />
              <div className="flex gap-2 pt-2">
                <Button type="submit" loading={saving} leftIcon={<Plus className="h-4 w-4" />}>
                  {editingId ? 'Cập nhật' : 'Tạo mới'}
                </Button>
                {editingId && (
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Hủy
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default NewsManagementPage
