'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { CattleStats } from './CattleStats'
import { QRCodeCard } from './QRCodeCard'
import { StatusBadge } from '@/components/catalog/CattleStatusBadge'
import { WeightChart } from '@/components/weight/WeightChart'
import { WeightHistoryTab } from './WeightHistoryTab'
import { HealthHistoryTab } from './HealthHistoryTab'
import { FeedHistoryTab } from './FeedHistoryTab'
import { MediaTab } from './MediaTab'
import { CommentSection } from './CommentSection'
import { formatCurrency, formatWeight, formatHeight, formatDate, formatADG } from '@/lib/utils/formatters'
import { calculateWeightStats, estimateTargetCompletion } from '@/lib/utils/calculations'
import { MessageCircle, Share2, ChevronLeft, ChevronRight, X, Check } from 'lucide-react'
import { CattleWithRelations } from '@/types'
import { BookingModal } from './BookingModal'

interface CattleProfileProps {
  cattle: CattleWithRelations
}

type TabKey = 'summary' | 'weights' | 'health' | 'feed' | 'media'

export function CattleProfile({ cattle }: CattleProfileProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('summary')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()
  const [showBookingModal, setShowBookingModal] = useState(false)

  const weightData = cattle.weights?.map((w) => ({
    id: w.id,
    weight: w.weight,
    measurementDate: w.measurementDate,
    notes: w.notes,
  })) || []

  const weightStats = calculateWeightStats(weightData)
  const targetEstimation = cattle.targetWeight && weightStats.lastWeight
    ? estimateTargetCompletion(cattle.targetWeight, weightStats.lastWeight, weightStats.adg)
    : null

  const breadcrumbItems = [
    { label: 'Katalog', href: '/' },
    { label: cattle.code },
  ]

  const isAvailable = cattle.status === 'AVAILABLE'
  const isBooked = cattle.status === 'BOOKED'
  const isSold = cattle.status === 'SOLD'

  // Collect all images
  const allImages = [
    cattle.mainImage,
    ...(cattle.media?.filter(m => m.fileType === 'IMAGE').map(m => m.fileUrl) || [])
  ].filter(Boolean) as string[]

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const nextImage = () => {
    setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => setCurrentUserId(data?.user?.id))
      .catch(() => {})
  }, [])

  const tabs = [
    { key: 'summary', label: 'Ringkasan' },
    { key: 'weights', label: 'Riwayat Timbang' },
    { key: 'health', label: 'Kesehatan' },
    { key: 'feed', label: 'Pakan' },
    { key: 'media', label: 'Dokumentasi' },
  ] as const

  const handleShare = async () => {
    const url = window.location.href
    const text = `Lihat sapi ${cattle.name} (${cattle.code}) di samadyafarm.id`

    if (navigator.share) {
      try {
        await navigator.share({ title: cattle.name, text, url })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  const handleBookingClick = () => {
    if (!currentUserId) {
      window.dispatchEvent(new CustomEvent('openAuthModal'))
    } else {
      setShowBookingModal(true)
    }
  }

  return (
    <div className="mx-auto my-2 max-w-[1500px] overflow-hidden border border-black/30 bg-[hsl(var(--cream2))] shadow-2xl">
      <div className="container py-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Main Content Card */}
        <div className="mt-6 rounded-lg border border-[hsl(var(--line))] bg-white shadow-card">
          <div className="grid lg:grid-cols-[360px_1fr]">
            {/* Left Sidebar - Photo & Info */}
            <aside className="border-b border-[hsl(var(--line))] p-4 lg:border-b-0 lg:border-r">
              {/* Image Gallery with Pagination */}
              <div className="space-y-3">
                {/* Main Image */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[hsl(var(--cream))]">
                  {allImages[currentImageIndex] ? (
                    <>
                      <Image
                        src={allImages[currentImageIndex]}
                        alt={cattle.name}
                        fill
                        className="object-cover cursor-pointer"
                        onClick={() => openLightbox(currentImageIndex)}
                        sizes="(max-width: 1024px) 100vw, 360px"
                      />
                      {/* Navigation Arrows */}
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                          >
                            <ChevronLeft className="h-5 w-5 text-[hsl(var(--forest))]" />
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                          >
                            <ChevronRight className="h-5 w-5 text-[hsl(var(--forest))]" />
                          </button>
                        </>
                      )}
                      {/* Image Counter */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[10px] text-white font-medium">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[hsl(var(--forest))/50]">
                      Tidak ada foto
                    </div>
                  )}
                </div>

                {/* Pagination Dots */}
                {allImages.length > 1 && (
                  <div className="flex justify-center gap-2">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-2.5 w-2.5 rounded-full transition-all ${
                          idx === currentImageIndex
                            ? 'bg-[hsl(var(--forest))] w-6'
                            : 'bg-[hsl(var(--line))] hover:bg-[hsl(var(--forest))/50'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Thumbnail Strip */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          idx === currentImageIndex
                            ? 'border-[hsl(var(--forest))]'
                            : 'border-transparent hover:border-[hsl(var(--forest))/50'
                        }`}
                      >
                        <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Details */}
              <div className="mt-4 rounded-xl border border-[hsl(var(--line))] bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-[hsl(var(--forest))/55]">Harga</span>
                  <strong className="text-[20px] font-extrabold text-[hsl(var(--forest))]">
                    {formatCurrency(Number(cattle.price))}
                  </strong>
                </div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[hsl(var(--forest))/55]">Stok:</span>
                  <span className="rounded-full bg-[hsl(var(--forest))] px-3 py-0.5 text-[11px] font-bold text-white">
                    {cattle.quantity || 1}
                  </span>
                </div>
                <dl className="space-y-2 text-[12px]">
                  <div className="flex justify-between"><dt className="text-[hsl(var(--forest))/55]">Jenis</dt><dd className="font-semibold text-[hsl(var(--forest))]">{cattle.breed}</dd></div>
                  <div className="flex justify-between"><dt className="text-[hsl(var(--forest))/55]">Bobot Awal</dt><dd className="font-semibold text-[hsl(var(--forest))]">{formatWeight(weightStats.initialWeight)}</dd></div>
                  <div className="flex justify-between"><dt className="text-[hsl(var(--forest))/55]">Bobot Terakhir</dt><dd className="font-semibold text-[hsl(var(--forest))]">{formatWeight(weightStats.lastWeight)}</dd></div>
                  <div className="flex justify-between"><dt className="text-[hsl(var(--forest))/55]">ADG</dt><dd className="font-semibold text-[hsl(var(--forest))]">{formatADG(weightStats.adg ?? 0)}</dd></div>
                  <div className="flex justify-between"><dt className="text-[hsl(var(--forest))/55]">Target Bobot</dt><dd className="font-semibold text-[hsl(var(--forest))]">{formatWeight(cattle.targetWeight)}</dd></div>
                  {targetEstimation?.estimatedDate && (
                    <div className="flex justify-between"><dt className="text-[hsl(var(--forest))/55]">Est. Selesai</dt><dd className="font-semibold text-[hsl(var(--forest))]">{targetEstimation.estimatedDate.toLocaleDateString('id-ID')}</dd></div>
                  )}
                </dl>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/6281234567890?text=Halo,%20saya%20tertarik%20dengan%20sapi%20${cattle.name}%20(${cattle.code})`}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--forest))] px-3 py-3 text-[12px] font-semibold text-white hover:bg-[hsl(var(--forest2))] transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--line))] bg-white px-3 py-3 text-[12px] font-semibold text-[hsl(var(--forest))] hover:bg-[hsl(var(--cream))] transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Bagikan
                </button>
                {(isAvailable) && (
                  <button
                    onClick={handleBookingClick}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--gold))] px-3 py-3 text-[12px] font-semibold text-[hsl(var(--forest))] hover:bg-[hsl(var(--gold))/90] transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    Booking Sekarang
                  </button>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="p-4">
              {/* Header */}
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-[30px] font-bold text-[hsl(var(--forest))]">{cattle.name}</h1>
                  <StatusBadge status={cattle.status} />
                </div>
                <p className="text-[12px] text-[hsl(var(--forest))/55]">{cattle.code}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[hsl(var(--forest))/70]">
                  <span>Jenis: <strong>{cattle.breed}</strong></span>
                  <span>Tgl Lahir: <strong>{formatDate(cattle.birthDate)}</strong></span>
                  {cattle.height && <span>Tinggi: <strong>{formatHeight(cattle.height)}</strong></span>}
                </div>
                {cattle.description && (
                  <p className="mt-3 text-[12px] text-[hsl(var(--forest))/70]">{cattle.description}</p>
                )}
              </div>

              {/* Quick Stats */}
              {weightStats.lastWeight > 0 && (
                <div className="mb-4">
                  <CattleStats
                    lastWeight={weightStats.lastWeight}
                    adg={weightStats.adg}
                    targetWeight={cattle.targetWeight || null}
                    progressPercentage={targetEstimation?.progressPercentage || 0}
                  />
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-[hsl(var(--line))]">
                <div className="scroll-thin flex gap-1 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`whitespace-nowrap rounded-t-md px-4 py-2.5 text-[11px] font-semibold transition-colors ${
                        activeTab === tab.key
                          ? 'bg-[hsl(var(--forest))] text-white'
                          : 'text-[hsl(var(--forest))/70] hover:bg-[hsl(var(--cream))] hover:text-[hsl(var(--forest))]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="pt-4">
                {activeTab === 'summary' && (
                  <SummaryTab weightStats={weightStats} targetEstimation={targetEstimation} cattle={cattle} />
                )}
                {activeTab === 'weights' && (
                  <WeightHistoryTab weights={cattle.weights || []} />
                )}
                {activeTab === 'health' && (
                  <HealthHistoryTab records={cattle.healthRecords || []} />
                )}
                {activeTab === 'feed' && (
                  <FeedHistoryTab records={cattle.feedRecords || []} />
                )}
                {activeTab === 'media' && (
                  <MediaTab media={cattle.media || []} />
                )}
              </div>

              <CommentSection
                cattleId={cattle.id}
                cattleCode={cattle.code}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="mt-4">
          <QRCodeCard code={cattle.code} name={cattle.name} />
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95">
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 z-10"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <div className="relative h-[80vh] w-[80vw] max-w-5xl">
            <Image
              src={allImages[lightboxIndex]}
              alt={`${cattle.name} - Image ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="80vw"
            />
          </div>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  idx === lightboxIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          <div className="absolute bottom-4 right-4 text-white text-[12px]">
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          cattle={{
            id: cattle.id,
            name: cattle.name,
            code: cattle.code,
            price: Number(cattle.price),
            quantity: cattle.quantity || 1,
          }}
          onSuccess={() => alert('Booking berhasil! Anda akan dihubungi oleh admin.')}
        />
      )}
    </div>
  )
}

function SummaryTab({
  weightStats,
  targetEstimation,
  cattle,
}: {
  weightStats: ReturnType<typeof calculateWeightStats>
  targetEstimation: ReturnType<typeof estimateTargetCompletion> | null
  cattle: CattleWithRelations
}) {
  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Bobot Awal" value={formatWeight(weightStats.initialWeight)} />
        <StatCard label="Bobot Terakhir" value={formatWeight(weightStats.lastWeight)} />
        <StatCard label="Kenaikan" value={`+${formatWeight(weightStats.weightGain)}`} />
        <StatCard label="ADG" value={formatADG(weightStats.adg ?? 0)} />
        <StatCard label="Target" value={formatWeight(cattle.targetWeight)} />
        <StatCard label="Progress" value={`${targetEstimation?.progressPercentage.toFixed(0) || 0}%`} />
      </div>

      {/* Progress Bar */}
      {cattle.targetWeight && weightStats.lastWeight > 0 && (
        <div className="rounded-lg border border-[hsl(var(--line))] bg-white p-4">
          <div className="flex justify-between text-[12px] mb-2">
            <span className="text-[hsl(var(--forest))/70]">Bobot Saat Ini</span>
            <span className="font-semibold text-[hsl(var(--forest))]">{formatWeight(weightStats.lastWeight)}</span>
          </div>
          <div className="h-4 bg-[hsl(var(--cream))] rounded-full overflow-hidden">
            <div
              className="h-full bg-[hsl(var(--olive))] transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(targetEstimation?.progressPercentage || 0, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[12px] mt-2">
            <span className="text-[hsl(var(--forest))/70]">Target</span>
            <span className="font-semibold text-[hsl(var(--forest))]">{formatWeight(cattle.targetWeight)}</span>
          </div>
          {targetEstimation?.remainingWeight && targetEstimation.remainingWeight > 0 && (
            <p className="mt-2 text-[11px] text-[hsl(var(--forest))/60]">
              Sisa: {formatWeight(targetEstimation.remainingWeight)} ({targetEstimation.estimatedDays} hari)
            </p>
          )}
        </div>
      )}

      {/* Chart */}
      {cattle.weights && cattle.weights.length > 0 && (
        <div className="rounded-lg border border-[hsl(var(--line))] bg-white p-4">
          <div className="text-[13px] font-bold text-[hsl(var(--forest))] mb-3">Grafik Perkembangan Bobot</div>
          <WeightChart weights={cattle.weights} />
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[hsl(var(--line))] bg-white p-3">
      <div className="text-[10px] text-[hsl(var(--forest))/55]">{label}</div>
      <div className="mt-1 text-[16px] font-bold text-[hsl(var(--forest))]">{value}</div>
    </div>
  )
}

function WeightsTab({ weights }: { weights: any[] }) {
  if (weights.length === 0) {
    return (
      <div className="text-center py-12 text-[hsl(var(--forest))/60]">
        <div className="mb-2 text-4xl">📋</div>
        <p className="text-[14px]">Belum ada data penimbangan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="rounded-lg border border-[hsl(var(--line))] bg-white p-4">
        <WeightChart weights={weights} />
      </div>

      {/* History by Month */}
      <div className="rounded-lg border border-[hsl(var(--line))] bg-white p-4">
        <div className="text-[13px] font-bold text-[hsl(var(--forest))] mb-3">Riwayat Penimbangan</div>
        <WeightHistoryTab weights={weights} />
      </div>
    </div>
  )
}
