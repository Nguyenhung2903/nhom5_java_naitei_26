import { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  StatusBadge,
  Input,
  FormField,
  StatCard,
  Alert,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui'
import { Dumbbell, Flame, Trophy, Users, Bell, Sparkles } from 'lucide-react'

export function App() {
  const [inputValue, setInputValue] = useState('')

  return (
    <div className="min-h-screen bg-[var(--rogym-bg-base)] text-[var(--rogym-text-primary)] font-body p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--rogym-border-subtle)] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-[var(--rogym-green)]/15 border border-[var(--rogym-green)]/30 text-[var(--rogym-teal)]">
                <Dumbbell className="w-6 h-6" />
              </span>
              <h1 className="text-3xl md:text-4xl font-bold font-display tracking-wide uppercase text-white m-0">
                RoGym Design System
              </h1>
            </div>
            <p className="text-[var(--rogym-text-secondary)] text-sm">
              Đã tích hợp thành công vào <code className="text-[var(--rogym-teal)] bg-black/40 px-2 py-0.5 rounded">client/src</code>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" leftIcon={<Bell className="w-4 h-4" />}>
              Thông báo
            </Button>
            <Button variant="primary" leftIcon={<Sparkles className="w-4 h-4" />}>
              Bắt đầu ngay
            </Button>
          </div>
        </header>

        {/* Alerts & Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Alert tone="success" title="Hệ thống đã sẵn sàng">
            Tất cả 38+ UI components, Tokens và Utilities đã được chuyển giao và sẵn sàng sử dụng.
          </Alert>

          <Card variant="glass" className="flex flex-col justify-center p-6">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-[var(--rogym-text-muted)] mr-2">Badges:</span>
              <Badge tone="primary">Primary</Badge>
              <Badge tone="success">Success</Badge>
              <Badge tone="accent">Accent</Badge>
              <Badge tone="warning">Warning</Badge>
              <Badge tone="danger">Danger</Badge>
              <StatusBadge status="active" />
              <StatusBadge status="pending" />
            </div>
          </Card>
        </div>

        {/* Stat Cards */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">Thống kê hoạt động</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Tổng hội viên"
              value="1,420"
              trend={{ value: '12.5%', isPositive: true }}
              icon={<Users className="w-5 h-5" />}
            />
            <StatCard
              label="Calo đã đốt cháy"
              value="845,200"
              trend={{ value: '8.3%', isPositive: true }}
              icon={<Flame className="w-5 h-5 text-amber-400" />}
            />
            <StatCard
              label="Buổi tập hoàn thành"
              value="3,890"
              trend={{ value: '24.1%', isPositive: true }}
              icon={<Trophy className="w-5 h-5 text-purple-400" />}
            />
            <StatCard
              label="Điểm chuyên cần"
              value="98.5%"
              hint="Top 5% toàn phòng tập"
              icon={<Dumbbell className="w-5 h-5 text-sky-400" />}
            />
          </div>
        </section>

        {/* Tabs & Interactive Demo */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">Tương tác Components</h2>
          <Card variant="default" className="p-6">
            <Tabs defaultValue="buttons">
              <TabsList>
                <TabsTrigger value="buttons">Buttons</TabsTrigger>
                <TabsTrigger value="inputs">Inputs & Form</TabsTrigger>
                <TabsTrigger value="cards">Cards</TabsTrigger>
              </TabsList>

              <TabsContent value="buttons" className="space-y-4 pt-4">
                <p className="text-sm text-[var(--rogym-text-secondary)]">Các biến thể Button tiêu chuẩn:</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary Button</Button>
                  <Button variant="secondary">Secondary Button</Button>
                  <Button variant="outline-green">Outline Green</Button>
                  <Button variant="outline-white">Outline White</Button>
                  <Button variant="danger">Danger Button</Button>
                  <Button variant="primary" loading>Loading</Button>
                </div>
              </TabsContent>

              <TabsContent value="inputs" className="space-y-4 pt-4">
                <div className="max-w-md space-y-3">
                  <FormField label="Tên đăng nhập hoặc Email" hint="Hỗ trợ Path Alias @/components/ui" htmlFor="username-input">
                    <Input
                      id="username-input"
                      placeholder="Nhập tên đăng nhập..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  </FormField>
                </div>
              </TabsContent>

              <TabsContent value="cards" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card variant="elevated" className="p-6">
                    <CardHeader>
                      <CardTitle>Elevated Card</CardTitle>
                      <CardDescription>Mô tả chi tiết thẻ elevated</CardDescription>
                    </CardHeader>
                    <CardContent>
                      Nội dung bên trong thẻ với tông màu chuẩn RoGym dark theme.
                    </CardContent>
                  </Card>

                  <Card variant="interactive" className="p-6">
                    <CardHeader>
                      <CardTitle>Interactive Card</CardTitle>
                      <CardDescription>Thẻ có hiệu ứng hover & focus mượt mà</CardDescription>
                    </CardHeader>
                    <CardContent>
                      Thử di chuột vào thẻ để thấy hiệu ứng viền sáng và chuyển động.
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </section>

      </div>
    </div>
  )
}

export default App
