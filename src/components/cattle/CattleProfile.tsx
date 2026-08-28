'use client'

import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { CattleStats } from './CattleStats'
import { CattleGallery } from './CattleGallery'
import { WeightHistory } from '@/components/weight/WeightHistory'
import { WeightChart } from '@/components/weight/WeightChart'
import { HealthTimeline } from '@/components/health/HealthTimeline'
import { FeedHistory } from '@/components/feed/FeedHistory'
import { DocumentationGallery } from '@/components/media/DocumentationGallery'
import { QRCodeCard } from './QRCodeCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { StatusBadge } from '@/components/catalog/CattleStatusBadge'
import { formatCurrency, formatWeight, formatHeight, formatDate } from '@/lib/utils/formatters'
import { calculateWeightStats, estimateTargetCompletion } from '@/lib/utils/calculations'
import { ArrowRight, Phone } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CattleWithRelations } from '@/types'

interface CattleProfileProps {
  cattle: CattleWithRelations
}

export function CattleProfile({ cattle }: CattleProfileProps) {
  const weightData = cattle.weights?.map((w) => ({
    weight: w.weight,
    measurementDate: w.measurementDate,
  })) || []

  const weightStats = calculateWeightStats(weightData)
  const targetEstimation = cattle.targetWeight && weightStats.lastWeight
    ? estimateTargetCompletion(cattle.targetWeight, weightStats.lastWeight, weightStats.adg)
    : null

  const breadcrumbItems = [
    { label: 'Katalog', href: '/' },
    { label: cattle.code },
  ]

  return (
    <div className="container py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mt-6 space-y-8">
        {/* Profile Header */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CattleGallery
            mainImage={cattle.mainImage}
            media={cattle.media || []}
          />

          <div className="space-y-6">
            <div>
              <StatusBadge status={cattle.status} className="mb-3" />
              <h1 className="text-3xl md:text-4xl font-bold">{cattle.name}</h1>
              <p className="text-xl text-muted-foreground">{cattle.code}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Jenis" value={cattle.breed} />
              <InfoItem label="Tanggal Lahir" value={formatDate(cattle.birthDate)} />
              <InfoItem label="Tinggi Badan" value={cattle.height ? formatHeight(cattle.height) : '-'} />
              <InfoItem label="Bobot Terakhir" value={weightStats.lastWeight ? formatWeight(weightStats.lastWeight) : '-'} />
              <div className="col-span-2">
                <InfoItem label="Harga" value={formatCurrency(Number(cattle.price))} highlight />
              </div>
            </div>

            {cattle.description && (
              <p className="text-muted-foreground">{cattle.description}</p>
            )}

            {cattle.status === 'AVAILABLE' && (
              <Button size="lg" className="w-full md:w-auto">
                <Phone className="mr-2 h-5 w-5" />
                Hubungi Kami
              </Button>
            )}
          </div>
        </section>

        {/* Quick Stats */}
        {weightStats.lastWeight > 0 && (
          <CattleStats
            lastWeight={weightStats.lastWeight}
            adg={weightStats.adg}
            targetWeight={cattle.targetWeight || null}
            progressPercentage={targetEstimation?.progressPercentage || 0}
          />
        )}

        {/* Tabs / Accordion for Detail Sections */}
        <div className="block lg:hidden">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="summary">
              <AccordionTrigger>Ringkasan</AccordionTrigger>
              <AccordionContent>
                <SummaryContent weightStats={weightStats} targetEstimation={targetEstimation} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="weights">
              <AccordionTrigger>Riwayat Timbang</AccordionTrigger>
              <AccordionContent>
                <WeightHistory weights={cattle.weights || []} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="health">
              <AccordionTrigger>Kesehatan</AccordionTrigger>
              <AccordionContent>
                <HealthTimeline records={cattle.healthRecords || []} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="feed">
              <AccordionTrigger>Pakan</AccordionTrigger>
              <AccordionContent>
                <FeedHistory records={cattle.feedRecords || []} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="media">
              <AccordionTrigger>Dokumentasi</AccordionTrigger>
              <AccordionContent>
                <DocumentationGallery media={cattle.media || []} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="hidden lg:block">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="summary">Ringkasan</TabsTrigger>
              <TabsTrigger value="weights">Riwayat Timbang</TabsTrigger>
              <TabsTrigger value="health">Kesehatan</TabsTrigger>
              <TabsTrigger value="feed">Pakan</TabsTrigger>
              <TabsTrigger value="media">Dokumentasi</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-6">
              <SummaryContent weightStats={weightStats} targetEstimation={targetEstimation} />
            </TabsContent>
            <TabsContent value="weights" className="mt-6">
              <WeightChart weights={cattle.weights || []} />
              <div className="mt-6">
                <WeightHistory weights={cattle.weights || []} />
              </div>
            </TabsContent>
            <TabsContent value="health" className="mt-6">
              <HealthTimeline records={cattle.healthRecords || []} />
            </TabsContent>
            <TabsContent value="feed" className="mt-6">
              <FeedHistory records={cattle.feedRecords || []} />
            </TabsContent>
            <TabsContent value="media" className="mt-6">
              <DocumentationGallery media={cattle.media || []} />
            </TabsContent>
          </Tabs>
        </div>

        {/* QR Code Section */}
        <QRCodeCard code={cattle.code} name={cattle.name} />

        {/* Related Cattle */}
        <RelatedCattleSection breed={cattle.breed} excludeCode={cattle.code} />
      </div>
    </div>
  )
}

function InfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-medium ${highlight ? 'text-primary text-lg' : ''}`}>{value}</p>
    </div>
  )
}

function SummaryContent({
  weightStats,
  targetEstimation,
}: {
  weightStats: ReturnType<typeof calculateWeightStats>
  targetEstimation: ReturnType<typeof estimateTargetCompletion> | null
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <SummaryCard label="Bobot Awal" value={formatWeight(weightStats.initialWeight)} />
      <SummaryCard label="Bobot Terakhir" value={formatWeight(weightStats.lastWeight)} />
      <SummaryCard label="Kenaikan Bobot" value={formatWeight(weightStats.weightGain)} />
      <SummaryCard label="ADG" value={weightStats.adg ? `${weightStats.adg} Kg/Hari` : '-'} />
      {targetEstimation && (
        <>
          <SummaryCard label="Estimasi Target" value={targetEstimation.estimatedDate?.toLocaleDateString('id-ID') || '-'} />
          <SummaryCard label="Sisa Hari" value={targetEstimation.estimatedDays?.toString() || '-'} />
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  )
}

function RelatedCattleSection({ breed, excludeCode }: { breed: string; excludeCode: string }) {
  return (
    <section className="border-t pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Sapi Lainnya</h2>
        <Link href={`/?breed=${breed}`} className="text-primary hover:underline flex items-center gap-1">
          Lihat Semua <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="text-muted-foreground">Sapi sejenis lainnya dapat dilihat di katalog.</p>
    </section>
  )
}
