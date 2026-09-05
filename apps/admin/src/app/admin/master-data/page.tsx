'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@samadya/shared/components/ui/button'
import { Input } from '@samadya/shared/components/ui/input'
import { Label } from '@samadya/shared/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@samadya/shared/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@samadya/shared/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@samadya/shared/components/ui/table'

interface MasterDataItem {
  id: string
  key: string
  value: string
}

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState('jenis-sapi')
  const [data, setData] = useState<Record<string, MasterDataItem[]>>({
    'jenis-sapi': [
      { id: '1', key: 'LIMOSIN', value: 'Limousin' },
      { id: '2', key: 'SIMENTAL', value: 'Simental' },
      { id: '3', key: 'BRAHMAN', value: 'Brahman' },
      { id: '4', key: 'ANGUS', value: 'Angus' },
    ],
    'status-sapi': [
      { id: '1', key: 'AVAILABLE', value: 'Tersedia' },
      { id: '2', key: 'BOOKED', value: 'Dibooking' },
      { id: '3', key: 'SOLD', value: 'Terjual' },
    ],
    'jenis-pakan': [
      { id: '1', key: 'RUMPUT_GAJAH', value: 'Rumput Gajah' },
      { id: '2', key: 'KONSENTRAT', value: 'Konsentrat' },
    ],
    'testimonials': [],
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null)
  const [form, setForm] = useState({ key: '', value: '' })

  const tabLabels: Record<string, string> = {
    'jenis-sapi': 'Jenis Sapi',
    'status-sapi': 'Status Sapi',
    'jenis-pakan': 'Jenis Pakan',
    'testimonials': 'Testimonial',
  }

  const handleOpenAdd = () => {
    setEditingItem(null)
    setForm({ key: '', value: '' })
    setModalOpen(true)
  }

  const handleOpenEdit = (item: MasterDataItem) => {
    setEditingItem(item)
    setForm({ key: item.key, value: item.value })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.key || !form.value) return

    if (editingItem) {
      setData(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(item =>
          item.id === editingItem.id ? { ...item, key: form.key.toUpperCase(), value: form.value } : item
        )
      }))
    } else {
      const newItem: MasterDataItem = {
        id: Date.now().toString(),
        key: form.key.toUpperCase(),
        value: form.value,
      }
      setData(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], newItem]
      }))
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Hapus data ini?')) return
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(item => item.id !== id)
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Master Data</h2>
        <p className="text-gray-500 mt-1">Kelola data referensi sistem</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="jenis-sapi"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 rounded-md transition-all hover:bg-gray-200"
          >
            Jenis Sapi
          </TabsTrigger>
          <TabsTrigger
            value="status-sapi"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 rounded-md transition-all hover:bg-gray-200"
          >
            Status Sapi
          </TabsTrigger>
          <TabsTrigger
            value="jenis-pakan"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 rounded-md transition-all hover:bg-gray-200"
          >
            Jenis Pakan
          </TabsTrigger>
          <TabsTrigger
            value="testimonials"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 rounded-md transition-all hover:bg-gray-200"
          >
            Testimonial
          </TabsTrigger>
        </TabsList>

        {Object.entries(data).map(([key, items]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 border-b border-gray-100">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800">{tabLabels[key]}</CardTitle>
                  <CardDescription className="text-gray-500 text-sm">
                    {items.length} data
                  </CardDescription>
                </div>
                <Button
                  onClick={handleOpenAdd}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:shadow-md active:scale-95"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {items.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                        <TableHead className="font-semibold text-gray-600 w-1/4">Key</TableHead>
                        <TableHead className="font-semibold text-gray-600">Value</TableHead>
                        <TableHead className="text-right w-32 font-semibold text-gray-600">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                          <TableCell className="font-mono text-sm text-gray-600">{item.key}</TableCell>
                          <TableCell className="font-medium text-gray-800">{item.value}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(item)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-gray-400 mb-3">Belum ada data</p>
                    <Button
                      onClick={handleOpenAdd}
                      variant="outline"
                      className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Data Pertama
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4 shadow-xl border-0">
            <CardHeader className="flex flex-row items-center justify-between bg-emerald-600 text-white rounded-t-lg">
              <CardTitle className="text-white">
                {editingItem ? 'Edit Data' : 'Tambah Data Baru'}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  value={form.key}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, key: e.target.value })}
                  placeholder="Contoh: LIMOSIN"
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-500">Huruf kapital, tanpa spasi</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={form.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, value: e.target.value })}
                  placeholder="Contoh: Limousin"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="border-gray-300"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!form.key || !form.value}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Simpan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
