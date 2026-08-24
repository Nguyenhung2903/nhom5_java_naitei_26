import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Newspaper, RefreshCcw, Search } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { newsService } from '@/services/newsService'
import type { News } from '@/types/news'

function formatDate(value?: string) {
  if (!value) return 'Đang cập nhật'
  return new Date(value).toLocaleDateString('vi-VN')
}

export function NewsPage() {
  const [newsList, setNewsList] = useState<News[]>([])
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadNews = async () => {
    setLoading(true)
    setError(null)
    try {
      setNewsList(await newsService.getNews(keyword))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải tin tức')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadNews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-3xl font-black uppercase tracking-wide text-white">
            <Newspaper className="h-7 w-7 text-[var(--rogym-green)]" />
            Tin tức
          </h1>
          <p className="max-w-2xl text-sm text-[var(--rogym-text-secondary)]">
            Tin tức, thông báo và bài viết được tải trực tiếp từ dữ liệu quản trị.
          </p>
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

      {loading ? (
        <Card variant="elevated" className="py-12 text-center text-sm text-[var(--rogym-text-muted)]">
          Đang tải tin tức...
        </Card>
      ) : newsList.length === 0 ? (
        <Card variant="elevated" className="py-12 text-center text-sm text-[var(--rogym-text-muted)]">
          Chưa có tin tức phù hợp.
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {newsList.map((news) => (
            <Card key={news.id} to={`/news/${news.id}`} variant="interactive" className="flex flex-col overflow-hidden" padding="none">
              <div className="flex aspect-[16/9] items-center justify-center bg-white/5">
                {news.thumbnail ? (
                  <img src={news.thumbnail} alt={news.title} className="h-full w-full object-cover" />
                ) : (
                  <Newspaper className="h-10 w-10 text-[var(--rogym-text-muted)]" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <p className="text-xs text-[var(--rogym-text-muted)]">{formatDate(news.createdAt)}</p>
                <h2 className="line-clamp-2 text-lg font-bold text-white">{news.title}</h2>
                <p className="line-clamp-3 text-sm text-[var(--rogym-text-secondary)]">{news.content}</p>
                <span className="mt-auto text-xs font-semibold text-[var(--rogym-teal)]">Đọc tiếp</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export function NewsDetailPage() {
  const { newsId = '' } = useParams()
  const [news, setNews] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        setNews(await newsService.getNewsById(newsId))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải chi tiết tin tức')
      } finally {
        setLoading(false)
      }
    }
    void loadDetail()
  }, [newsId])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card variant="elevated" className="py-12 text-center text-sm text-[var(--rogym-text-muted)]">
          Đang tải chi tiết tin tức...
        </Card>
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card variant="danger" className="space-y-4">
          <p className="text-sm text-red-200">{error || 'Không tìm thấy tin tức'}</p>
          <Link to="/news">
            <Button variant="secondary">Quay lại tin tức</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/news" className="text-sm font-semibold text-[var(--rogym-teal)] hover:text-white">
        Quay lại tin tức
      </Link>
      <div className="space-y-3">
        <p className="text-xs text-[var(--rogym-text-muted)]">{formatDate(news.createdAt)}</p>
        <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl">{news.title}</h1>
      </div>
      {news.thumbnail && (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <img src={news.thumbnail} alt={news.title} className="max-h-[460px] w-full object-cover" />
        </div>
      )}
      <Card variant="elevated">
        <p className="whitespace-pre-line text-sm leading-7 text-[var(--rogym-text-secondary)]">{news.content}</p>
      </Card>
    </article>
  )
}

export default NewsPage
