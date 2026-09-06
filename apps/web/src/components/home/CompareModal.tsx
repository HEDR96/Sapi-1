'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Columns3, Check, Film } from 'lucide-react'
import { CattleWithRelations } from '@samadya/shared/types'
import { CattleStatusBadge } from '@samadya/shared/components/ui/CattleStatusBadge'
import { formatWeight, formatCurrency } from '@samadya/shared/lib/utils/formatters'
import { calculateWeightStats } from '@samadya/shared/lib/utils/calculations'
import { getDirectImageUrl, isVideoUrl } from '@samadya/shared/lib/utils/imageUrl'

interface CompareModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCattle: CattleWithRelations[]
  allCattle: CattleWithRelations[]
  onSelectCattle: (cattle: CattleWithRelations) => void
}

export function CompareModal({
  isOpen,
  onClose,
  selectedCattle,
  allCattle,
  onSelectCattle
}: CompareModalProps) {
  const [activeView, setActiveView] = useState<'compare' | 'select'>('compare')

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const isSelected = (id: string) => selectedCattle.some(c => c.id === id)

  return (
    <div
      className="fixed inset-0 z-[105] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="modal-shell w-full max-w-[1080px] max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-2xl bg-[hsl(var(--cream2))] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--line))] bg-white px-3 sm:px-4 py-2.5 sm:py-3 shrink-0">
          <div className="min-w-0 flex-1 pr-2">
            <h3 className="font-display text-base sm:text-[22px] font-bold text-[hsl(var(--forest))] leading-tight">Perbandingan Sapi</h3>
            <p className="text-[7px] sm:text-[8px] text-[hsl(var(--forest))/50] leading-tight">
              Bandingkan harga, bobot, ADG, progress, dan status hingga 3 sapi.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-[hsl(var(--line))] bg-[hsl(var(--cream))] text-[hsl(var(--forest))] shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-4 flex-1 overflow-y-auto min-h-0">
          {/* Tab buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveView('compare')}
                className={`flex-1 sm:flex-none rounded-lg px-3 py-2 text-[8px] sm:text-[9px] font-semibold transition-colors ${
                  activeView === 'compare'
                    ? 'bg-[hsl(var(--forest))] text-white'
                    : 'border border-[hsl(var(--line))] bg-white text-[hsl(var(--forest))]'
                }`}
              >
                <Columns3 className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline mr-1" />
                <span className="hidden sm:inline">Lihat Perbandingan</span>
                <span className="sm:hidden">Perbandingan</span>
              </button>
              <button
                onClick={() => setActiveView('select')}
                className={`flex-1 sm:flex-none rounded-lg px-3 py-2 text-[8px] sm:text-[9px] font-semibold transition-colors ${
                  activeView === 'select'
                    ? 'bg-[hsl(var(--forest))] text-white'
                    : 'border border-[hsl(var(--line))] bg-white text-[hsl(var(--forest))]'
                }`}
              >
                Pilih Sapi
              </button>
            </div>
            {selectedCattle.length < 2 && activeView === 'compare' && (
              <span className="text-[7px] sm:text-[8px] text-[hsl(var(--forest))/50] whitespace-nowrap">
                Min. 2 sapi
              </span>
            )}
          </div>

          {/* SELECT VIEW */}
          {activeView === 'select' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {allCattle.map((cattle) => {
                const selected = isSelected(cattle.id)
                const sortedWeights = [...(cattle.weights || [])].sort(
                  (a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()
                )
                const lastWeight = sortedWeights[0]?.weight
                const weightStats = calculateWeightStats(cattle.weights || [])

                return (
                  <button
                    key={cattle.id}
                    onClick={() => onSelectCattle(cattle)}
                    className={`relative rounded-xl border p-2 text-left transition-all ${
                      selected
                        ? 'border-[hsl(var(--forest))] bg-[hsl(var(--forest))]/5'
                        : 'border-[hsl(var(--line))] bg-white hover:border-[hsl(var(--olive))]'
                    }`}
                  >
                    {selected && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[hsl(var(--forest))] text-white flex items-center justify-center z-10">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className="aspect-video rounded-lg overflow-hidden bg-[hsl(var(--cream))] mb-2 relative">
                      {cattle.mainImage && !isVideoUrl(cattle.mainImage) ? (
                        <Image
                          src={getDirectImageUrl(cattle.mainImage)}
                          alt={cattle.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : cattle.mainImage && isVideoUrl(cattle.mainImage) ? (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-[hsl(var(--forest))/20] to-[hsl(var(--forest))/40]">
                          <Film className="h-8 w-8 text-[hsl(var(--forest))/50]" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-[hsl(var(--forest))/30] text-xs">
                          N/A
                        </div>
                      )}
                      <div className="absolute top-1 left-1">
                        <CattleStatusBadge status={cattle.status} />
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-[hsl(var(--forest))] truncate">
                      {cattle.name}
                    </div>
                    <div className="text-[7px] text-[hsl(var(--forest))/50] truncate">
                      {cattle.code} - {cattle.breed}
                    </div>
                    <div className="mt-1 flex justify-between text-[8px]">
                      <span className="text-[hsl(var(--forest))/55]">Bobot:</span>
                      <span className="font-bold text-[hsl(var(--forest))]">
                        {formatWeight(lastWeight || null)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[8px]">
                      <span className="text-[hsl(var(--forest))/55]">ADG:</span>
                      <span className="font-bold text-[hsl(var(--forest))]">
                        {weightStats.adg?.toFixed(2) || '-'} kg
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* COMPARE VIEW */}
          {activeView === 'compare' && (
            <>
              {selectedCattle.length < 2 ? (
                <div className="rounded-xl border border-dashed border-[hsl(var(--line))] bg-white p-6 sm:p-8 text-center">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--cream))] text-[hsl(var(--olive))]">
                    <Columns3 className="h-5 w-5" />
                  </div>
                  <div className="mt-2 text-[11px] font-bold text-[hsl(var(--forest))]">
                    Pilih minimal 2 sapi
                  </div>
                  <p className="mt-1 text-[9px] text-[hsl(var(--forest))/55]">
                    Klik tombol <strong>Pilih Sapi</strong> untuk menambahkan sapi yang ingin dibandingkan.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl -mx-2 px-2 sm:mx-0 sm:px-0">
                  <table className="w-full min-w-[600px] compare-table text-[9px] sm:text-[10px]">
                    <thead>
                      <tr>
                        <th className="text-left p-2 sm:p-3 bg-[hsl(var(--cream))] font-semibold text-[hsl(var(--forest))] w-[100px] sm:w-[120px]">
                          <span className="hidden sm:inline">Parameter</span>
                          <span className="sm:hidden">Param</span>
                        </th>
                        {selectedCattle.map((cattle, index) => {
                          return (
                            <th key={cattle.id} className="min-w-[120px] sm:min-w-[150px] p-2 sm:p-3 align-top">
                              <div className="flex items-start justify-between gap-1 sm:gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="text-[11px] sm:text-[12px] text-[hsl(var(--forest))] font-bold truncate">{cattle.name}</div>
                                  <div className="text-[7px] sm:text-[8px] font-normal text-[hsl(var(--forest))/50] truncate">{cattle.code}</div>
                                </div>
                                <button
                                  onClick={() => onSelectCattle(cattle)}
                                  className="grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-full bg-[hsl(var(--cream))] text-[hsl(var(--forest))/50] hover:bg-red-100 hover:text-red-500 shrink-0"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              {/* Image - Full width, fit to page */}
                              <div className="mt-2 sm:mt-3 h-24 sm:h-32 w-full rounded-lg overflow-hidden relative bg-[hsl(var(--cream))]">
                                {cattle.mainImage && !isVideoUrl(cattle.mainImage) ? (
                                  <Image
                                    src={getDirectImageUrl(cattle.mainImage)}
                                    alt={cattle.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 20vw"
                                  />
                                ) : cattle.mainImage && isVideoUrl(cattle.mainImage) ? (
                                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-[hsl(var(--forest))/20] to-[hsl(var(--forest))/40]">
                                    <Film className="h-6 w-6 text-[hsl(var(--forest))/50]" />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-full text-[hsl(var(--forest))/30]">
                                    N/A
                                  </div>
                                )}
                              </div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-[hsl(var(--line))]">
                        <td className="p-2 sm:p-3 font-medium text-[hsl(var(--forest))/70] bg-[hsl(var(--cream))/50]">Harga</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id} className="p-2 sm:p-3">
                            <strong className="text-[hsl(var(--forest))] text-[10px] sm:text-[11px]">
                              {formatCurrency(Number(cattle.price))}
                            </strong>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-[hsl(var(--line))]">
                        <td className="p-2 sm:p-3 font-medium text-[hsl(var(--forest))/70] bg-[hsl(var(--cream))/50]">Status</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id} className="p-2 sm:p-3">
                            <CattleStatusBadge status={cattle.status} />
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-[hsl(var(--line))]">
                        <td className="p-2 sm:p-3 font-medium text-[hsl(var(--forest))/70] bg-[hsl(var(--cream))/50]">Jenis</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id} className="p-2 sm:p-3">{cattle.breed}</td>
                        ))}
                      </tr>
                      <tr className="border-t border-[hsl(var(--line))]">
                        <td className="p-2 sm:p-3 font-medium text-[hsl(var(--forest))/70] bg-[hsl(var(--cream))/50]">Bobot Terakhir</td>
                        {selectedCattle.map((cattle) => {
                          const sortedWeights = [...(cattle.weights || [])].sort(
                            (a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()
                          )
                          const lastWeight = sortedWeights[0]?.weight
                          return (
                            <td key={cattle.id} className="p-2 sm:p-3">
                              <strong className="text-[10px] sm:text-[11px]">{formatWeight(lastWeight || null)}</strong>
                            </td>
                          )
                        })}
                      </tr>
                      <tr className="border-t border-[hsl(var(--line))]">
                        <td className="p-2 sm:p-3 font-medium text-[hsl(var(--forest))/70] bg-[hsl(var(--cream))/50]">Bobot Awal</td>
                        {selectedCattle.map((cattle) => {
                          const sortedWeights = [...(cattle.weights || [])].sort(
                            (a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
                          )
                          const firstWeight = sortedWeights[0]?.weight
                          return <td key={cattle.id} className="p-2 sm:p-3">{formatWeight(firstWeight || null)}</td>
                        })}
                      </tr>
                      <tr className="border-t border-[hsl(var(--line))]">
                        <td className="p-2 sm:p-3 font-medium text-[hsl(var(--forest))/70] bg-[hsl(var(--cream))/50]">Kenaikan</td>
                        {selectedCattle.map((cattle) => {
                          const sortedWeights = [...(cattle.weights || [])].sort(
                            (a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
                          )
                          const lastWeight = sortedWeights[sortedWeights.length - 1]?.weight
                          const firstWeight = sortedWeights[0]?.weight
                          const gain = lastWeight && firstWeight ? lastWeight - firstWeight : 0
                          return (
                            <td key={cattle.id} className={`p-2 sm:p-3 ${gain > 0 ? 'text-[hsl(var(--olive))] font-bold' : ''}`}>
                              {gain > 0 ? `+${formatWeight(gain)}` : '-'}
                            </td>
                          )
                        })}
                      </tr>
                      <tr className="border-t border-[hsl(var(--line))]">
                        <td className="p-2 sm:p-3 font-medium text-[hsl(var(--forest))/70] bg-[hsl(var(--cream))/50]">ADG</td>
                        {selectedCattle.map((cattle) => {
                          const weightStats = calculateWeightStats(cattle.weights || [])
                          return (
                            <td key={cattle.id} className="p-2 sm:p-3">
                              {weightStats.adg?.toFixed(2) || '-'} kg/hari
                            </td>
                          )
                        })}
                      </tr>
                      <tr className="border-t border-[hsl(var(--line))]">
                        <td className="p-2 sm:p-3 font-medium text-[hsl(var(--forest))/70] bg-[hsl(var(--cream))/50]">Target Bobot</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id} className="p-2 sm:p-3">{formatWeight(cattle.targetWeight)}</td>
                        ))}
                      </tr>
                      <tr className="border-t border-[hsl(var(--line))]">
                        <td className="p-2 sm:p-3 font-medium text-[hsl(var(--forest))/70] bg-[hsl(var(--cream))/50]">Progress</td>
                        {selectedCattle.map((cattle) => {
                          const sortedWeights = [...(cattle.weights || [])].sort(
                            (a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()
                          )
                          const lastWeight = sortedWeights[0]?.weight
                          const progress = cattle.targetWeight && lastWeight
                            ? Math.min(100, Math.round((lastWeight / cattle.targetWeight) * 100))
                            : 0
                          return <td key={cattle.id} className="p-2 sm:p-3 font-bold text-[hsl(var(--olive))]">{progress}%</td>
                        })}
                      </tr>
                      <tr className="border-t border-[hsl(var(--line))]">
                        <td className="p-2 sm:p-3 font-medium text-[hsl(var(--forest))/70] bg-[hsl(var(--cream))/50]">Jumlah Timbang</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id} className="p-2 sm:p-3">{cattle.weights?.length || 0}x</td>
                        ))}
                      </tr>
                      <tr className="border-t border-[hsl(var(--line))]">
                        <td className="p-2 sm:p-3 font-medium text-[hsl(var(--forest))/70] bg-[hsl(var(--cream))/50]">Riwayat Kesehatan</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id} className="p-2 sm:p-3">{cattle.healthRecords?.length || 0}x</td>
                        ))}
                      </tr>
                      <tr className="border-t border-[hsl(var(--line))]">
                        <td className="p-2 sm:p-3 font-medium text-[hsl(var(--forest))/70] bg-[hsl(var(--cream))/50]">Aksi</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id} className="p-2 sm:p-3">
                            <a
                              href={`/sapi/${cattle.code}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block w-full rounded-md bg-[hsl(var(--forest))] px-2 sm:px-3 py-1.5 sm:py-2 text-[7px] sm:text-[8px] font-bold text-white text-center"
                            >
                              Lihat Detail
                            </a>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
