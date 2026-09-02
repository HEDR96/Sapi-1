'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CattleWithRelations } from '@/types'
import { formatWeight, formatDate, formatCurrency } from '@/lib/utils/formatters'
import { calculateWeightStats } from '@/lib/utils/calculations'
import { WeightChart } from './WeightChart'
import { Sprout, Wheat, Pill, Droplets, TrendingUp } from 'lucide-react'
import { getDirectImageUrl } from '@/lib/utils/imageUrl'

interface TrackingTabsProps {
  cattle: CattleWithRelations | null
}

type TabKey = 'ringkasan' | 'timbang' | 'kesehatan' | 'pakan' | 'dokumentasi'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'ringkasan', label: 'Ringkasan' },
  { key: 'timbang', label: 'Riwayat Timbang' },
  { key: 'kesehatan', label: 'Riwayat Kesehatan' },
  { key: 'pakan', label: 'Pakan' },
  { key: 'dokumentasi', label: 'Dokumentasi' },
]

export function TrackingTabs({ cattle }: TrackingTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('ringkasan')

  if (!cattle) {
    return (
      <div className="h-full rounded-xl border border-dashed border-[hsl(var(--line))] bg-[hsl(var(--cream))/30] p-6 flex flex-col items-center justify-center text-center">
        <div className="w-full max-w-md space-y-4">
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-16 bg-[hsl(var(--line))] rounded" />
            ))}
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-[hsl(var(--line))] rounded w-3/4 mx-auto" />
            <div className="h-4 bg-[hsl(var(--line))] rounded w-1/2 mx-auto" />
            <div className="h-4 bg-[hsl(var(--line))] rounded w-2/3 mx-auto" />
          </div>
        </div>
        <p className="text-[hsl(var(--forest))/40] text-sm mt-6">
          Pilih sapi dari katalog untuk melihat detail perkembangan
        </p>
      </div>
    )
  }

  const weights = cattle.weights || []
  const healthRecords = cattle.healthRecords || []
  const feedRecords = cattle.feedRecords || []
  const media = cattle.media || []
  const weightStats = calculateWeightStats(weights)

  // Sort weights by date ascending for calculations - handle both string and Date
  const sortedWeights = [...weights].sort(
    (a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
  )

  const lastWeight = sortedWeights[sortedWeights.length - 1]?.weight
  const firstWeight = sortedWeights[0]?.weight
  const totalGain = lastWeight && firstWeight ? lastWeight - firstWeight : 0
  const weightProgress = cattle.targetWeight && lastWeight
    ? Math.min(100, (lastWeight / cattle.targetWeight) * 100)
    : null

  const birthDate = cattle.birthDate ? new Date(cattle.birthDate) : null
  const ageMonths = birthDate
    ? Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    : null

  const latestHealth = healthRecords[0]

  return (
    <div className="flex flex-col">
      {/* Tab Headers - Compact */}
      <div className="tracking-tabs scroll-thin flex gap-1.5 overflow-x-auto border-b border-[hsl(var(--line))] pb-2 text-[9px] text-[hsl(var(--forest))/75]">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-btn whitespace-nowrap rounded px-2.5 py-1.5 font-semibold transition-colors ${
              activeTab === tab.key
                ? 'bg-[hsl(var(--forest))] text-white'
                : 'hover:bg-[hsl(var(--cream))] text-[hsl(var(--forest))/75]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2.5">
        {/* RINGKASAN TAB */}
        {activeTab === 'ringkasan' && (
          <div className="tracking-summary">
            <div className="grid gap-2.5 xl:grid-cols-[.95fr_1.15fr_.78fr_.78fr_.68fr]">
              {/* Ringkasan Stats */}
              <div>
                <div className="mb-1 text-[9px] font-bold text-[hsl(var(--forest))]">Ringkasan</div>
                <div className="grid grid-cols-2 gap-1.5 text-[8px]">
                  <div className="rounded border border-[hsl(var(--line))] p-1.5 bg-white">
                    <div className="text-[hsl(var(--forest))/55]">Berat Terakhir</div>
                    <div className="font-bold text-[hsl(var(--forest))]">{formatWeight(lastWeight || null)}</div>
                    <div className="text-[8px] text-[hsl(var(--forest))/50]">
                      {sortedWeights.length > 0
                        ? formatDate(new Date(sortedWeights[sortedWeights.length - 1].measurementDate))
                        : '-'}
                    </div>
                  </div>
                  <div className="rounded border border-[hsl(var(--line))] p-1.5 bg-white">
                    <div className="text-[hsl(var(--forest))/55]">Kenaikan Total</div>
                    <div className="font-bold text-[hsl(var(--forest))]">{totalGain > 0 ? `+${formatWeight(totalGain)}` : '-'}</div>
                    <div className="text-[8px] text-[hsl(var(--forest))/50]">Sejak Awal</div>
                  </div>
                  <div className="rounded border border-[hsl(var(--line))] p-1.5 bg-white">
                    <div className="text-[hsl(var(--forest))/55]">ADG</div>
                    <div className="font-bold text-[hsl(var(--forest))]">{weightStats.adg?.toFixed(2) || '-'} kg/hari</div>
                    <div className="text-[8px] text-[hsl(var(--forest))/50]">Rata-rata</div>
                  </div>
                  <div className="rounded border border-[hsl(var(--line))] p-1.5 bg-white">
                    <div className="text-[hsl(var(--forest))/55]">Target Bobot</div>
                    <div className="font-bold text-[hsl(var(--forest))]">{formatWeight(cattle.targetWeight)}</div>
                    <div className="text-[8px] text-[hsl(var(--forest))/50]">H-10idul Adha</div>
                  </div>
                  <div className="rounded border border-[hsl(var(--line))] p-1.5 bg-white">
                    <div className="text-[hsl(var(--forest))/55]">Umur</div>
                    <div className="font-bold text-[hsl(var(--forest))]">{ageMonths ? `${ageMonths} bulan` : '-'}</div>
                    <div className="text-[8px] text-[hsl(var(--forest))/50]">Perkiraan</div>
                  </div>
                  <div className="rounded border border-[hsl(var(--line))] p-1.5 bg-white">
                    <div className="text-[hsl(var(--forest))/55]">Status</div>
                    <div className="font-bold text-[hsl(var(--forest))]">{latestHealth?.status || 'Sehat'}</div>
                    <div className="text-[8px] text-[hsl(var(--forest))/50]">Aktif & lincah</div>
                  </div>
                </div>
              </div>

              {/* Weight Chart */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-[9px] font-bold text-[hsl(var(--forest))]">Grafik Kenaikan Bobot</div>
                  <span className="rounded border border-[hsl(var(--line))] px-2 py-1 text-[7px] text-[hsl(var(--forest))/60]">Semua</span>
                </div>
                <div className="rounded border border-[hsl(var(--line))] p-1.5 bg-white">
                  <WeightChart weights={sortedWeights} />
                </div>
              </div>

              {/* Riwayat Timbang Summary */}
              <div>
                <div className="mb-1 text-[9px] font-bold text-[hsl(var(--forest))]">Riwayat Timbang</div>
                <div className="space-y-1 text-[7px] text-[hsl(var(--forest))/70]">
                  {sortedWeights.length > 0 ? (
                    sortedWeights.slice(-6).map((w) => (
                      <div key={w.id} className="flex justify-between rounded border border-[hsl(var(--line))] px-2 py-1 bg-white">
                        <span>{formatDate(new Date(w.measurementDate))}</span>
                        <span className="font-medium">{formatWeight(w.weight)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded border border-[hsl(var(--line))] p-3 text-center bg-white">
                      <div className="text-3xl mb-1">📋</div>
                      <div className="text-[8px] text-[hsl(var(--forest))/50]">Belum ada riwayat timbang</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Riwayat Kesehatan Summary */}
              <div>
                <div className="mb-1 text-[9px] font-bold text-[hsl(var(--forest))]">Riwayat Kesehatan</div>
                <div className="space-y-1.5 text-[7px] leading-4 text-[hsl(var(--forest))/70]">
                  {healthRecords.slice(0, 3).map((record) => (
                    <div key={record.id} className="rounded border border-[hsl(var(--line))] p-2 bg-white">
                      <div className="font-semibold text-[hsl(var(--forest))]">
                        {formatDate(new Date(record.recordDate))}
                      </div>
                      <div>{record.healthType}</div>
                    </div>
                  ))}
                  {healthRecords.length === 0 && (
                    <div className="rounded border border-[hsl(var(--line))] p-3 text-center bg-white">
                      <div className="text-3xl mb-1">🏥</div>
                      <div className="text-[8px] text-[hsl(var(--forest))/50]">Belum ada riwayat kesehatan</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pakan Summary */}
              <div>
                <div className="mb-1 text-[9px] font-bold text-[hsl(var(--forest))]">Pakan</div>
                <div className="space-y-1 text-[7px] leading-4 text-[hsl(var(--forest))/70]">
                  {feedRecords.length > 0 ? (
                    feedRecords.slice(0, 4).map((record) => (
                      <div key={record.id} className="rounded border border-[hsl(var(--line))] p-2 bg-white">
                        {record.feedType}<br />
                        <span className="text-[hsl(var(--forest))/50]">{record.frequency}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="rounded border border-[hsl(var(--line))] p-2 bg-white">
                        Rumput Gajah<br />
                        <span className="text-[hsl(var(--forest))/50]">2x sehari</span>
                      </div>
                      <div className="rounded border border-[hsl(var(--line))] p-2 bg-white">
                        Konsentrat<br />
                        <span className="text-[hsl(var(--forest))/50]">2 kg/hari</span>
                      </div>
                      <div className="rounded border border-[hsl(var(--line))] p-2 bg-white">
                        Vitamin & Mineral<br />
                        <span className="text-[hsl(var(--forest))/50]">Rutin</span>
                      </div>
                      <div className="rounded border border-[hsl(var(--line))] p-2 bg-white">
                        Air Bersih<br />
                        <span className="text-[hsl(var(--forest))/50]">Ad libitum</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TIMBANG TAB */}
        {activeTab === 'timbang' && (
          <div className="grid gap-2.5 md:grid-cols-[1fr_.9fr]">
            <div className="rounded border border-[hsl(var(--line))] p-2.5 bg-white">
              <div className="mb-2 text-[11px] font-bold text-[hsl(var(--forest))]">Data Timbangan</div>
              <div className="space-y-2 text-[9px]">
                {sortedWeights.length > 0 ? (
                  // Group by month
                  Object.entries(
                    sortedWeights.reduce((acc, w) => {
                      const date = new Date(w.measurementDate)
                      const monthKey = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
                      if (!acc[monthKey]) acc[monthKey] = []
                      acc[monthKey].push(w)
                      return acc
                    }, {} as Record<string, typeof sortedWeights>)
                  ).map(([month, monthWeights]) => (
                    <div key={month}>
                      <div className="font-semibold text-[hsl(var(--forest))]">{month}</div>
                      <div className="mt-1 space-y-1.5 text-[hsl(var(--forest))/70]">
                        {monthWeights.map((w) => (
                          <div key={w.id} className="flex justify-between rounded border border-[hsl(var(--line))] px-3 py-2">
                            <span>{formatDate(new Date(w.measurementDate))}</span>
                            <span className="font-bold">{formatWeight(w.weight)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded border border-dashed border-[hsl(var(--line))] p-6 text-center">
                    <div className="mb-3 flex justify-center">
                      <img src="/images/21249315961639312271.svg" alt="Sapi" className="w-12 h-12 opacity-40" />
                    </div>
                    <div className="text-[11px] font-semibold text-[hsl(var(--forest))]">Belum ada Riwayat Timbang</div>
                    <p className="mt-1 text-[9px] text-[hsl(var(--forest))/50]">
                      Data penimbangan akan muncul setelah sapi ditimbang.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="rounded border border-[hsl(var(--line))] p-2.5 bg-white">
              <div className="mb-2 text-[11px] font-bold text-[hsl(var(--forest))]">Grafik Perkembangan</div>
              <WeightChart weights={sortedWeights} height={200} />
            </div>
          </div>
        )}

        {/* KESEHATAN TAB */}
        {activeTab === 'kesehatan' && (
          <div className="rounded border border-[hsl(var(--line))] p-2.5 bg-white">
            <div className="mb-3 text-[11px] font-bold text-[hsl(var(--forest))]">Riwayat Kesehatan</div>
            <div className="space-y-2">
              {healthRecords.length > 0 ? (
                healthRecords.map((record) => (
                  <div key={record.id} className="rounded border border-[hsl(var(--line))] bg-[hsl(var(--cream2))] p-3 text-[9px]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-[hsl(var(--forest))]">
                        {formatDate(new Date(record.recordDate))}
                      </div>
                      <span className={`px-2 py-1 rounded text-[7px] font-medium ${
                        record.status === 'SEHAT' ? 'bg-green-100 text-green-700' :
                        record.status === 'SAKIT' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    <p className="text-[hsl(var(--forest))/70]">{record.healthType}</p>
                    {record.notes && (
                      <p className="mt-1 text-[hsl(var(--forest))/60]">{record.notes}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded border border-dashed border-[hsl(var(--line))] p-8 text-center">
                  <div className="mb-3 flex justify-center">
                    <img src="/images/21433058761642998739.svg" alt="Kesehatan" className="w-12 h-12 opacity-40" />
                  </div>
                  <div className="text-[11px] font-semibold text-[hsl(var(--forest))]">Belum ada Riwayat Kesehatan</div>
                  <p className="mt-1 text-[9px] text-[hsl(var(--forest))/50]">
                    Data kesehatan akan muncul setelah pemeriksaan.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAKAN TAB */}
        {activeTab === 'pakan' && (
          <div className="rounded border border-[hsl(var(--line))] p-2.5 bg-white">
            <div className="mb-3 text-[11px] font-bold text-[hsl(var(--forest))]">Treatment Pakan</div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {feedRecords.length > 0 ? (
                feedRecords.map((record) => {
                  const IconComponent = record.feedType.toLowerCase().includes('rumput') ? Sprout :
                    record.feedType.toLowerCase().includes('konsentrat') ? Wheat :
                    record.feedType.toLowerCase().includes('vitamin') ? Pill : Sprout

                  return (
                    <div key={record.id} className="rounded border border-[hsl(var(--line))] p-3 text-[9px]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--cream))] text-[hsl(var(--forest))]">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-[hsl(var(--forest))]">{record.feedType}</div>
                          <div className="text-[9px] text-[hsl(var(--forest))/55]">{record.frequency}</div>
                        </div>
                      </div>
                      {record.amount && (
                        <div className="text-[hsl(var(--forest))/70]">{record.amount}</div>
                      )}
                      {record.notes && (
                        <p className="mt-1 text-[hsl(var(--forest))/60]">{record.notes}</p>
                      )}
                      <div className="mt-1 text-[7px] text-[hsl(var(--forest))/50]">
                        {formatDate(new Date(record.recordDate))}
                      </div>
                    </div>
                  )
                })
              ) : (
                <>
                  <div className="rounded border border-[hsl(var(--line))] p-3 text-[9px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--cream))] text-[hsl(var(--forest))]">
                        <Sprout className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-[hsl(var(--forest))]">Rumput Gajah</div>
                        <div className="text-[9px] text-[hsl(var(--forest))/55]">2x sehari</div>
                      </div>
                    </div>
                    <div className="text-[hsl(var(--forest))/70]">Untuk pakan utama hijauan.</div>
                  </div>
                  <div className="rounded border border-[hsl(var(--line))] p-3 text-[9px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--cream))] text-[hsl(var(--forest))]">
                        <Wheat className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-[hsl(var(--forest))]">Konsentrat</div>
                        <div className="text-[9px] text-[hsl(var(--forest))/55]">2 kg / hari</div>
                      </div>
                    </div>
                    <div className="text-[hsl(var(--forest))/70]">Untuk menjaga pertumbuhan bobot.</div>
                  </div>
                  <div className="rounded border border-[hsl(var(--line))] p-3 text-[9px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--cream))] text-[hsl(var(--forest))]">
                        <Pill className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-[hsl(var(--forest))]">Vitamin & Mineral</div>
                        <div className="text-[9px] text-[hsl(var(--forest))/55]">Terjadwal</div>
                      </div>
                    </div>
                    <div className="text-[hsl(var(--forest))/70]">Diberikan rutin sesuai kebutuhan.</div>
                  </div>
                  <div className="rounded border border-[hsl(var(--line))] p-3 text-[9px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(var(--cream))] text-[hsl(var(--forest))]">
                        <Droplets className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-[hsl(var(--forest))]">Air Bersih</div>
                        <div className="text-[9px] text-[hsl(var(--forest))/55]">Ad libitum</div>
                      </div>
                    </div>
                    <div className="text-[hsl(var(--forest))/70]">Tersedia sepanjang hari.</div>
                  </div>
                </>
              )}
            </div>
            {feedRecords.length > 0 && (
              <div className="mt-3 rounded border border-[hsl(var(--line))] bg-[hsl(var(--cream2))] p-3 text-[10px] text-[hsl(var(--forest))/60]">
                Catatan: Pakan disesuaikan dengan kebutuhan sapi, target bobot, aktivitas, dan evaluasi kondisi harian.
              </div>
            )}
          </div>
        )}

        {/* DOKUMENTASI TAB */}
        {activeTab === 'dokumentasi' && (
          <div className="rounded border border-[hsl(var(--line))] p-3 bg-white">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold text-[hsl(var(--forest))]">Dokumentasi Foto & Video</div>
                <div className="text-[8px] text-[hsl(var(--forest))/55]">
                  Mosaic acak seperti galeri HP. Klik untuk preview.
                </div>
              </div>
            </div>

            {media.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {media.map((item) => (
                  <button
                    key={item.id}
                    className="relative aspect-square rounded-lg overflow-hidden group"
                  >
                    <img
                      src={getDirectImageUrl(item.fileUrl)}
                      alt={item.title || 'Dokumentasi'}
                      className="w-full h-full object-cover"
                    />
                    {item.fileType.toUpperCase() === 'VIDEO' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                          <span className="text-[hsl(var(--forest))] text-lg">▶</span>
                        </div>
                      </div>
                    )}
                    {item.category && (
                      <div className="absolute top-1 left-1 rounded-full bg-[hsl(var(--forest))]/80 px-2 py-0.5 text-[7px] font-medium text-white">
                        {item.category}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded border border-dashed border-[hsl(var(--line))] p-8 text-center">
                <div className="mb-3 flex justify-center">
                  <img src="/images/9448047941553668332.svg" alt="Sapi" className="w-12 h-12 opacity-40" />
                </div>
                <div className="text-[11px] font-semibold text-[hsl(var(--forest))]">Belum ada Dokumentasi</div>
                <p className="mt-1 text-[9px] text-[hsl(var(--forest))/50]">
                  Dokumentasi foto dan video akan muncul setelah ada yang diupload.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
