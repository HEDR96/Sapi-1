'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Columns3, Check } from 'lucide-react'
import { CattleWithRelations } from '@/types'
import { StatusBadge } from '@/components/catalog/CattleStatusBadge'
import { formatWeight, formatCurrency, formatDate } from '@/lib/utils/formatters'
import { calculateWeightStats } from '@/lib/utils/calculations'

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

  const handleClose = () => {
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const isSelected = (id: string) => selectedCattle.some(c => c.id === id)

  return (
    <div
      className="fixed inset-0 z-[105] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="modal-shell w-full max-w-[1080px] overflow-hidden rounded-2xl bg-[hsl(var(--cream2))] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--line))] bg-white px-4 py-3">
          <div>
            <h3 className="font-display text-[22px] font-bold text-[hsl(var(--forest))]">Perbandingan Sapi</h3>
            <p className="text-[8px] text-[hsl(var(--forest))/50]">
              Bandingkan harga, bobot, ADG, progress, dan status hingga 3 sapi.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-[hsl(var(--line))] bg-[hsl(var(--cream))] text-[hsl(var(--forest))]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 max-h-[70vh] overflow-y-auto">
          {/* Tab buttons */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('compare')}
                className={`rounded-lg px-3 py-2 text-[9px] font-semibold transition-colors ${
                  activeView === 'compare'
                    ? 'bg-[hsl(var(--forest))] text-white'
                    : 'border border-[hsl(var(--line))] bg-white text-[hsl(var(--forest))]'
                }`}
              >
                <Columns3 className="h-3.5 w-3.5 inline mr-1" />
                Lihat Perbandingan
              </button>
              <button
                onClick={() => setActiveView('select')}
                className={`rounded-lg px-3 py-2 text-[9px] font-semibold transition-colors ${
                  activeView === 'select'
                    ? 'bg-[hsl(var(--forest))] text-white'
                    : 'border border-[hsl(var(--line))] bg-white text-[hsl(var(--forest))]'
                }`}
              >
                Pilih Sapi
              </button>
            </div>
            {selectedCattle.length < 2 && activeView === 'compare' && (
              <span className="text-[8px] text-[hsl(var(--forest))/50]">
                Pilih minimal 2 sapi untuk melihat perbandingan
              </span>
            )}
          </div>

          {/* SELECT VIEW */}
          {activeView === 'select' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {allCattle.map((cattle) => {
                const selected = isSelected(cattle.id)
                const lastWeight = cattle.weights?.[0]?.weight
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
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[hsl(var(--forest))] text-white flex items-center justify-center">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className="aspect-video rounded-lg overflow-hidden bg-[hsl(var(--cream))] mb-2 relative">
                      {cattle.mainImage ? (
                        <Image
                          src={cattle.mainImage}
                          alt={cattle.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[hsl(var(--forest))/30] text-xs">
                          N/A
                        </div>
                      )}
                      <div className="absolute top-1 left-1">
                        <StatusBadge status={cattle.status} />
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-[hsl(var(--forest))] truncate">
                      {cattle.name}
                    </div>
                    <div className="text-[7px] text-[hsl(var(--forest))/50]">
                      {cattle.code} • {cattle.breed}
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
                <div className="rounded-xl border border-dashed border-[hsl(var(--line))] bg-white p-8 text-center">
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
                <div className="overflow-x-auto rounded-xl">
                  <table className="compare-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        {selectedCattle.map((cattle) => {
                          const lastWeight = cattle.weights?.[0]?.weight
                          const weightStats = calculateWeightStats(cattle.weights || [])

                          return (
                            <th key={cattle.id}>
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <div className="text-[12px] text-[hsl(var(--forest))]">{cattle.name}</div>
                                  <div className="text-[8px] font-normal text-[hsl(var(--forest))/50]">{cattle.code}</div>
                                </div>
                                <button
                                  onClick={() => onSelectCattle(cattle)}
                                  className="grid h-7 w-7 place-items-center rounded-full bg-[hsl(var(--cream))] text-[hsl(var(--forest))/50] hover:bg-red-100 hover:text-red-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="mt-2 h-20 rounded-lg overflow-hidden relative">
                                {cattle.mainImage ? (
                                  <Image
                                    src={cattle.mainImage}
                                    alt={cattle.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="h-full bg-[hsl(var(--cream))]" />
                                )}
                              </div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Foto</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id}>
                            {cattle.mainImage && (
                              <div className="h-24 w-full rounded-lg overflow-hidden">
                                <Image
                                  src={cattle.mainImage}
                                  alt={cattle.name}
                                  width={130}
                                  height={96}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Harga</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id}>
                            <strong className="text-[hsl(var(--forest))]">
                              {formatCurrency(Number(cattle.price))}
                            </strong>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Status</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id}>
                            <StatusBadge status={cattle.status} />
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Jenis</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id}>{cattle.breed}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Bobot Terakhir</td>
                        {selectedCattle.map((cattle) => {
                          const lastWeight = cattle.weights?.[0]?.weight
                          return (
                            <td key={cattle.id}>
                              <strong>{formatWeight(lastWeight || null)}</strong>
                            </td>
                          )
                        })}
                      </tr>
                      <tr>
                        <td>Bobot Awal</td>
                        {selectedCattle.map((cattle) => {
                          const firstWeight = cattle.weights?.[cattle.weights.length - 1]?.weight
                          return <td key={cattle.id}>{formatWeight(firstWeight || null)}</td>
                        })}
                      </tr>
                      <tr>
                        <td>Kenaikan</td>
                        {selectedCattle.map((cattle) => {
                          const lastWeight = cattle.weights?.[0]?.weight
                          const firstWeight = cattle.weights?.[cattle.weights.length - 1]?.weight
                          const gain = lastWeight && firstWeight ? lastWeight - firstWeight : 0
                          return (
                            <td key={cattle.id} className={gain > 0 ? 'text-[hsl(var(--olive))]' : ''}>
                              {gain > 0 ? `+${formatWeight(gain)}` : '-'}
                            </td>
                          )
                        })}
                      </tr>
                      <tr>
                        <td>ADG</td>
                        {selectedCattle.map((cattle) => {
                          const weightStats = calculateWeightStats(cattle.weights || [])
                          return (
                            <td key={cattle.id}>
                              {weightStats.adg?.toFixed(2) || '-'} kg/hari
                            </td>
                          )
                        })}
                      </tr>
                      <tr>
                        <td>Target Bobot</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id}>{formatWeight(cattle.targetWeight)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Progress Target</td>
                        {selectedCattle.map((cattle) => {
                          const lastWeight = cattle.weights?.[0]?.weight
                          const progress = cattle.targetWeight && lastWeight
                            ? Math.min(100, Math.round((lastWeight / cattle.targetWeight) * 100))
                            : 0
                          return <td key={cattle.id}>{progress}%</td>
                        })}
                      </tr>
                      <tr>
                        <td>Jumlah Timbang</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id}>{cattle.weights?.length || 0}x</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Riwayat Kesehatan</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id}>{cattle.healthRecords?.length || 0}x</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Aksi</td>
                        {selectedCattle.map((cattle) => (
                          <td key={cattle.id}>
                            <a
                              href={`/sapi/${cattle.code}`}
                              className="inline-block w-full rounded-md bg-[hsl(var(--forest))] px-3 py-2 text-[8px] font-bold text-white text-center"
                            >
                              Lihat Detail {cattle.name}
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
