import React, { useState, useMemo } from 'react'
import { ScreenIndicator } from './ScreenIndicator'
import { SeatItem } from './SeatItem'
import { Button, Modal, FormField, Input, Select, ConfirmDialog } from '@/components/ui'
import { seatService } from '@/services/seatService'
import { roomService } from '@/services/roomService'
import type { Seat, SeatType } from '@/types/seat'
import { Plus, RotateCcw, Trash2, CheckSquare, Square, Armchair, Layers } from 'lucide-react'


interface AdminInteractiveSeatMapProps {
  roomId: string
  roomName: string
  theaterName: string
  seats: Seat[]
  onRefresh: () => void
  className?: string
}

export const AdminInteractiveSeatMap: React.FC<AdminInteractiveSeatMapProps> = ({
  roomId,
  roomName,
  theaterName,
  seats,
  onRefresh,
  className = '',
}) => {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([])
  const [loadingAction, setLoadingAction] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Modal Thêm ghế
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addForm, setAddForm] = useState<{ seatRow: string; seatNumber: number; seatType: SeatType }>({
    seatRow: 'A',
    seatNumber: 1,
    seatType: 'NORMAL',
  })

  // Confirm Reset Sơ đồ
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  // Confirm Xóa các ghế đã chọn
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Nhóm ghế theo hàng
  const rows = useMemo(() => {
    const grouped: Record<string, Seat[]> = {}
    seats.forEach((seat) => {
      const row = seat.seatRow.toUpperCase()
      if (!grouped[row]) grouped[row] = []
      grouped[row].push(seat)
    })

    const sortedRowKeys = Object.keys(grouped).sort()
    return sortedRowKeys.map((rowKey) => {
      const rowSeats = grouped[rowKey].sort((a, b) => a.seatNumber - b.seatNumber)
      return {
        rowKey,
        seats: rowSeats,
        isCoupleRow: rowSeats.some((s) => s.seatType === 'COUPLE'),
      }
    })
  }, [seats])

  const handleSeatToggle = (seatId: string) => {
    setSelectedSeatIds((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    )
  }

  const handleSelectRow = (rowSeats: Seat[]) => {
    const rowIds = rowSeats.map((s) => s.id)
    const allSelected = rowIds.every((id) => selectedSeatIds.includes(id))

    if (allSelected) {
      setSelectedSeatIds((prev) => prev.filter((id) => !rowIds.includes(id)))
    } else {
      setSelectedSeatIds((prev) => Array.from(new Set([...prev, ...rowIds])))
    }
  }

  const handleSelectAll = () => {
    if (selectedSeatIds.length === seats.length) {
      setSelectedSeatIds([])
    } else {
      setSelectedSeatIds(seats.map((s) => s.id))
    }
  }

  // Đổi loại ghế hàng loạt
  const handleBatchChangeType = async (newType: SeatType) => {
    if (selectedSeatIds.length === 0) return
    setLoadingAction(true)
    setFeedback(null)
    try {
      await seatService.updateBatchType(selectedSeatIds, newType)
      setFeedback({
        type: 'success',
        message: `Đã đổi ${selectedSeatIds.length} ghế sang loại ${newType === 'VIP' ? 'VIP' : newType === 'COUPLE' ? 'Ghế Đôi' : 'Ghế Thường'}`,
      })
      setSelectedSeatIds([])
      onRefresh()
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Không thể cập nhật loại ghế',
      })
    } finally {
      setLoadingAction(false)
    }
  }

  // Xóa các ghế đã chọn
  const handleBatchDelete = async () => {
    if (selectedSeatIds.length === 0) return
    setLoadingAction(true)
    setFeedback(null)
    try {
      for (const id of selectedSeatIds) {
        await seatService.delete(id)
      }
      setFeedback({
        type: 'success',
        message: `Đã xóa ${selectedSeatIds.length} ghế khỏi phòng chiếu`,
      })
      setSelectedSeatIds([])
      setDeleteConfirmOpen(false)
      onRefresh()
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Không thể xóa ghế (ghế có thể đã có suất chiếu)',
      })
    } finally {
      setLoadingAction(false)
    }
  }

  // Khôi phục 50 ghế chuẩn
  const handleResetSeats = async () => {
    setLoadingAction(true)
    setFeedback(null)
    try {
      await roomService.resetSeats(roomId)
      setFeedback({
        type: 'success',
        message: 'Đã khôi phục thành công sơ đồ tiêu chuẩn 50 ghế (A-B Thường, C-D VIP, E Đôi)!',
      })
      setSelectedSeatIds([])
      setResetConfirmOpen(false)
      onRefresh()
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Không thể khôi phục sơ đồ ghế (phòng có thể đã có suất chiếu)',
      })
    } finally {
      setLoadingAction(false)
    }
  }

  // Thêm ghế mới
  const handleAddSeat = async () => {
    setLoadingAction(true)
    setFeedback(null)
    try {
      await seatService.create({
        roomId,
        seatRow: addForm.seatRow.trim().toUpperCase(),
        seatNumber: Number(addForm.seatNumber),
        seatType: addForm.seatType,
      })
      setFeedback({
        type: 'success',
        message: `Đã thêm ghế ${addForm.seatRow.toUpperCase()}${addForm.seatNumber} thành công`,
      })
      setAddModalOpen(false)
      onRefresh()
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Không thể thêm ghế (số ghế có thể đã tồn tại)',
      })
    } finally {
      setLoadingAction(false)
    }
  }

  const getSeatByRowAndNumber = (rowKey: string, number: number) => {
    return seats.find((s) => s.seatRow.toUpperCase() === rowKey && s.seatNumber === number)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Thông báo thao tác */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-[var(--rogym-green)]/15 border-[var(--rogym-green)]/30 text-[var(--rogym-green)]'
              : 'bg-[var(--rogym-error)]/15 border-[var(--rogym-error)]/30 text-[var(--rogym-error)]'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs underline opacity-70 hover:opacity-100"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Header công cụ quản lý sơ đồ */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[var(--rogym-bg-card)] border border-[var(--rogym-border-subtle)] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--rogym-teal)]/15 text-[var(--rogym-teal)]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Sơ đồ Chỗ ngồi Trực quan</h3>
            <p className="text-xs text-[var(--rogym-text-muted)]">
              Click vào từng ghế hoặc chọn nhiều ghế để chỉnh sửa loại ghế và bố cục
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 text-xs"
          >
            {selectedSeatIds.length === seats.length && seats.length > 0 ? (
              <>
                <CheckSquare className="w-4 h-4 text-[var(--rogym-teal)]" />
                <span>Bỏ chọn tất cả</span>
              </>
            ) : (
              <>
                <Square className="w-4 h-4" />
                <span>Chọn tất cả ({seats.length})</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setResetConfirmOpen(true)}
            disabled={loadingAction}
            className="flex items-center gap-1.5 text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục 50 ghế chuẩn</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setAddModalOpen(true)}
            disabled={loadingAction}
            className="flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm ghế</span>
          </Button>
        </div>
      </div>

      {/* Floating Batch Action Bar khi có ghế được chọn */}
      {selectedSeatIds.length > 0 && (
        <div className="sticky top-4 z-30 p-3 sm:p-4 rounded-2xl bg-[var(--rogym-bg-elevated)] border border-[var(--rogym-teal)] shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--rogym-green)] text-black text-xs font-bold">
              {selectedSeatIds.length}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white">
              Ghế đang được chọn
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--rogym-text-muted)] mr-1 hidden sm:inline">
              Đổi loại:
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleBatchChangeType('NORMAL')}
              disabled={loadingAction}
              className="text-xs text-[var(--rogym-text-secondary)] border-[var(--rogym-border-white-button)]/40 hover:bg-white/10"
            >
              Thường
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleBatchChangeType('VIP')}
              disabled={loadingAction}
              className="text-xs text-[var(--rogym-teal)] border-[var(--rogym-teal)]/40 hover:bg-[var(--rogym-teal)]/10"
            >
              VIP
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleBatchChangeType('COUPLE')}
              disabled={loadingAction}
              className="text-xs text-rose-300 border-rose-500/40 hover:bg-rose-500/10"
            >
              Ghế Đôi
            </Button>

            <div className="w-[1px] h-6 bg-white/10 mx-1" />

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={loadingAction}
              className="text-xs flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa ({selectedSeatIds.length})</span>
            </Button>

            <Button
              type="button"
              variant="outline-white"
              size="sm"
              onClick={() => setSelectedSeatIds([])}
              className="text-xs text-[var(--rogym-text-muted)]"
            >
              Hủy chọn
            </Button>
          </div>
        </div>
      )}

      {/* Sơ đồ ghế thực tế */}
      <div className="p-4 sm:p-8 rounded-2xl bg-[var(--rogym-bg-deep)] border border-[var(--rogym-border-subtle)] shadow-2xl flex flex-col items-center">
        <ScreenIndicator label={`MÀN HÌNH - ${theaterName.toUpperCase()} • ${roomName.toUpperCase()}`} />


        <div className="w-full max-w-4xl overflow-x-auto py-6 px-2 flex justify-center">
          {seats.length === 0 ? (
            <div className="py-12 text-center text-[var(--rogym-text-muted)] space-y-3">
              <Armchair className="w-12 h-12 mx-auto opacity-40" />
              <p>Phòng chiếu này chưa có ghế nào trong sơ đồ.</p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setResetConfirmOpen(true)}
              >
                Khởi tạo 50 ghế chuẩn ngay
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 min-w-max items-center">
              {rows.map(({ rowKey, seats: rowSeats, isCoupleRow }) => {
                const isAllRowSelected = rowSeats.every((s) => selectedSeatIds.includes(s.id))

                if (isCoupleRow) {
                  const pair1_2 = [getSeatByRowAndNumber(rowKey, 1), getSeatByRowAndNumber(rowKey, 2)].filter(Boolean) as Seat[]
                  const pair3_4 = [getSeatByRowAndNumber(rowKey, 3), getSeatByRowAndNumber(rowKey, 4)].filter(Boolean) as Seat[]
                  const pair5_6 = [getSeatByRowAndNumber(rowKey, 5), getSeatByRowAndNumber(rowKey, 6)].filter(Boolean) as Seat[]
                  const pair7_8 = [getSeatByRowAndNumber(rowKey, 7), getSeatByRowAndNumber(rowKey, 8)].filter(Boolean) as Seat[]
                  const pair9_10 = [getSeatByRowAndNumber(rowKey, 9), getSeatByRowAndNumber(rowKey, 10)].filter(Boolean) as Seat[]

                  const renderCouplePair = (pair: Seat[]) => {
                    if (pair.length === 0) return null
                    const main = pair[0]
                    const partner = pair.length > 1 ? pair[1] : undefined
                    const isSelected = selectedSeatIds.includes(main.id) || (partner ? selectedSeatIds.includes(partner.id) : false)

                    return (
                      <SeatItem
                        key={`couple-${main.id}`}
                        seatRow={main.seatRow}
                        seatNumber={main.seatNumber}
                        couplePartnerNumber={partner?.seatNumber}
                        seatType="COUPLE"
                        isCouple={true}
                        isSelected={isSelected}
                        interactive={true}
                        onClick={() => {
                          handleSeatToggle(main.id)
                          if (partner) handleSeatToggle(partner.id)
                        }}
                      />
                    )
                  }

                  return (
                    <div key={rowKey} className="flex items-center gap-2 sm:gap-3">
                      {/* Nút chọn cả hàng bên trái */}
                      <button
                        type="button"
                        onClick={() => handleSelectRow(rowSeats)}
                        title={`Chọn toàn bộ hàng ${rowKey}`}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border transition-colors ${
                          isAllRowSelected
                            ? 'border-[var(--rogym-green)] bg-[var(--rogym-green)] text-black'
                            : 'border-[var(--rogym-border-subtle)] text-[var(--rogym-text-muted)] hover:border-[var(--rogym-teal)]'
                        }`}
                      >
                        {rowKey}
                      </button>

                      <div className="flex items-center gap-2">{renderCouplePair(pair1_2)}</div>
                      <div className="w-4 sm:w-7 h-8 flex items-center justify-center border-l border-dashed border-[var(--rogym-border-white-dim)]" />
                      <div className="flex items-center gap-2 sm:gap-3">
                        {renderCouplePair(pair3_4)}
                        {renderCouplePair(pair5_6)}
                        {renderCouplePair(pair7_8)}
                      </div>
                      <div className="w-4 sm:w-7 h-8 flex items-center justify-center border-r border-dashed border-[var(--rogym-border-white-dim)]" />
                      <div className="flex items-center gap-2">{renderCouplePair(pair9_10)}</div>

                      <button
                        type="button"
                        onClick={() => handleSelectRow(rowSeats)}
                        title={`Chọn toàn bộ hàng ${rowKey}`}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border transition-colors ${
                          isAllRowSelected
                            ? 'border-[var(--rogym-green)] bg-[var(--rogym-green)] text-black'
                            : 'border-[var(--rogym-border-subtle)] text-[var(--rogym-text-muted)] hover:border-[var(--rogym-teal)]'
                        }`}
                      >
                        {rowKey}
                      </button>
                    </div>
                  )
                }

                // Hàng ghế đơn
                const leftCluster = rowSeats.filter((s) => s.seatNumber <= 2)
                const centerCluster = rowSeats.filter((s) => s.seatNumber >= 3 && s.seatNumber <= 8)
                const rightCluster = rowSeats.filter((s) => s.seatNumber >= 9)

                const renderSingle = (seat: Seat) => (
                  <SeatItem
                    key={seat.id}
                    seatRow={seat.seatRow}
                    seatNumber={seat.seatNumber}
                    seatType={seat.seatType}
                    isSelected={selectedSeatIds.includes(seat.id)}
                    interactive={true}
                    onClick={() => handleSeatToggle(seat.id)}
                  />
                )

                return (
                  <div key={rowKey} className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectRow(rowSeats)}
                      title={`Chọn toàn bộ hàng ${rowKey}`}
                      className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border transition-colors ${
                        isAllRowSelected
                          ? 'border-[var(--rogym-green)] bg-[var(--rogym-green)] text-black'
                          : 'border-[var(--rogym-border-subtle)] text-[var(--rogym-text-muted)] hover:border-[var(--rogym-teal)]'
                      }`}
                    >
                      {rowKey}
                    </button>

                    <div className="flex items-center gap-1.5 sm:gap-2">{leftCluster.map(renderSingle)}</div>
                    <div className="w-4 sm:w-7 h-8 flex items-center justify-center border-l border-dashed border-[var(--rogym-border-white-dim)]" />
                    <div className="flex items-center gap-1.5 sm:gap-2">{centerCluster.map(renderSingle)}</div>
                    <div className="w-4 sm:w-7 h-8 flex items-center justify-center border-r border-dashed border-[var(--rogym-border-white-dim)]" />
                    <div className="flex items-center gap-1.5 sm:gap-2">{rightCluster.map(renderSingle)}</div>

                    <button
                      type="button"
                      onClick={() => handleSelectRow(rowSeats)}
                      title={`Chọn toàn bộ hàng ${rowKey}`}
                      className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border transition-colors ${
                        isAllRowSelected
                          ? 'border-[var(--rogym-green)] bg-[var(--rogym-green)] text-black'
                          : 'border-[var(--rogym-border-subtle)] text-[var(--rogym-text-muted)] hover:border-[var(--rogym-teal)]'
                      }`}
                    >
                      {rowKey}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Chú thích loại ghế */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 py-3 px-6 rounded-xl bg-[var(--rogym-bg-card)] border border-[var(--rogym-border-subtle)] text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm border border-[var(--rogym-border-white-button)]/40 bg-[var(--rogym-bg-card)]" />
            <span className="text-[var(--rogym-text-secondary)]">Thường (A-B)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm border border-[var(--rogym-teal)] bg-[var(--rogym-bg-elevated-green)]" />
            <span className="text-[var(--rogym-teal)] font-medium">VIP (C-D)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-4 rounded-sm border border-rose-500/60 bg-rose-500/20" />
            <span className="text-rose-300 font-medium">Ghế Đôi (E)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm border border-[var(--rogym-green)] bg-[var(--rogym-green)]/25 shadow-[var(--rogym-shadow-tone-sm)]" />
            <span className="text-[var(--rogym-green)] font-medium">Đang chọn</span>
          </div>
        </div>
      </div>

      {/* Modal Thêm ghế mới */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Thêm Ghế Mới vào Sơ Đồ"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleAddSeat} loading={loadingAction}>
              Thêm ghế
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Hàng ghế (A-Z)" htmlFor="new-seat-row" required>
              <Input
                id="new-seat-row"
                maxLength={2}
                value={addForm.seatRow}
                onChange={(e) => setAddForm((prev) => ({ ...prev, seatRow: e.target.value.toUpperCase() }))}
                placeholder="VD: A, B, F..."
                required
              />
            </FormField>
            <FormField label="Số ghế (1-99)" htmlFor="new-seat-number" required>
              <Input
                id="new-seat-number"
                type="number"
                min={1}
                max={99}
                value={addForm.seatNumber}
                onChange={(e) => setAddForm((prev) => ({ ...prev, seatNumber: Number(e.target.value) }))}
                required
              />
            </FormField>
          </div>

          <FormField label="Loại ghế" htmlFor="new-seat-type" required>
            <Select
              value={addForm.seatType}
              onValueChange={(val) => setAddForm((prev) => ({ ...prev, seatType: val as SeatType }))}
              required
            >
              <option value="NORMAL">Ghế Thường (NORMAL)</option>
              <option value="VIP">Ghế VIP (VIP)</option>
              <option value="COUPLE">Ghế Đôi (COUPLE)</option>
            </Select>
          </FormField>
        </div>
      </Modal>

      {/* Confirm Dialog Khôi phục sơ đồ chuẩn */}
      <ConfirmDialog
        open={resetConfirmOpen}
        title="Khôi phục Sơ đồ Chuẩn 50 Ghế?"
        description={`Hành động này sẽ xóa toàn bộ cấu hình ghế hiện tại của ${roomName} và tái tạo lại 50 ghế chuẩn theo ma trận rạp (A-B Thường, C-D VIP, E Đôi). Bạn có chắc chắn muốn thực hiện?`}
        confirmLabel="Khôi phục ngay"
        cancelLabel="Hủy"
        variant="primary"
        onConfirm={handleResetSeats}
        onClose={() => setResetConfirmOpen(false)}
      />

      {/* Confirm Dialog Xóa các ghế đã chọn */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={`Xóa ${selectedSeatIds.length} ghế đã chọn?`}
        description="Các ghế đã chọn sẽ bị xóa khỏi sơ đồ phòng chiếu. Bạn có chắc chắn muốn xóa không?"
        confirmLabel="Xóa ghế"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleBatchDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </div>
  )
}

