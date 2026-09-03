'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@samadya/shared/components/ui/card'
import { Settings, Database, Mail, HardDrive, Info } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Konfigurasi aplikasi</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-[hsl(var(--forest))]" />
              <CardTitle>Informasi Aplikasi</CardTitle>
            </div>
            <CardDescription>Informasi umum aplikasi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama Aplikasi</span>
                <span className="font-medium">samadyafarm.id</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Versi</span>
                <span className="font-medium">1.0.0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-[hsl(var(--forest))]" />
              <CardTitle>Database</CardTitle>
            </div>
            <CardDescription>Konfigurasi database PostgreSQL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium">PostgreSQL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ORM</span>
                <span className="font-medium">Prisma</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[hsl(var(--forest))]" />
              <CardTitle>Email Service</CardTitle>
            </div>
            <CardDescription>Konfigurasi layanan email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium">Resend</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Konfigurasi</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-[hsl(var(--forest))]" />
              <CardTitle>Storage</CardTitle>
            </div>
            <CardDescription>Konfigurasi penyimpanan file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium">iDrive E2 (S3)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bucket</span>
                <span className="font-medium">farm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Region</span>
                <span className="font-medium">ap-northeast-1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
