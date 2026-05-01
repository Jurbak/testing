-- Setup tabel untuk aplikasi Kas Santri
-- Jalankan SQL ini di SQL Editor Supabase Anda

-- 1. Tabel Santri
CREATE TABLE santri (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  tanggal_masuk DATE NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Pembayaran Kas
CREATE TABLE pembayaran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
  bulan INTEGER NOT NULL CHECK (bulan BETWEEN 1 AND 12),
  tahun INTEGER NOT NULL,
  jumlah DECIMAL(10, 2) NOT NULL,
  tanggal_bayar DATE NOT NULL,
  bukti_gambar_nama TEXT,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(santri_id, bulan, tahun)
);

-- 3. Tabel Pengeluaran
CREATE TABLE pengeluaran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kategori VARCHAR(50) NOT NULL,
  jumlah DECIMAL(10, 2) NOT NULL,
  tanggal DATE NOT NULL,
  bukti_gambar_nama TEXT,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Setting Aplikasi (untuk menyimpan jumlah kas per bulan)
CREATE TABLE setting (
  id INTEGER PRIMARY KEY DEFAULT 1,
  jumlah_kas_per_bulan DECIMAL(10, 2) NOT NULL DEFAULT 0,
  nama_organisasi VARCHAR(100) DEFAULT 'Organisasi Santri'
);

-- Insert default setting
INSERT INTO setting (id, jumlah_kas_per_bulan, nama_organisasi) 
VALUES (1, 0, 'Organisasi Santri');

-- Row Level Security (RLS) Policies
-- Aktifkan RLS untuk semua tabel
ALTER TABLE santri ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembayaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengeluaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE setting ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa membaca data santri (untuk halaman publik)
CREATE POLICY "Santri bisa dibaca semua orang" 
  ON santri FOR SELECT 
  USING (true);

-- Policy: Semua orang bisa membaca data pembayaran (untuk halaman publik)
CREATE POLICY "Pembayaran bisa dibaca semua orang" 
  ON pembayaran FOR SELECT 
  USING (true);

-- Policy: Hanya authenticated user yang bisa insert/update/delete santri
CREATE POLICY "Santri bisa dikelola authenticated user" 
  ON santri FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Hanya authenticated user yang bisa insert/update/delete pembayaran
CREATE POLICY "Pembayaran bisa dikelola authenticated user" 
  ON pembayaran FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Hanya authenticated user yang bisa insert/update/delete pengeluaran
CREATE POLICY "Pengeluaran bisa dikelola authenticated user" 
  ON pengeluaran FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Semua orang bisa membaca setting
CREATE POLICY "Setting bisa dibaca semua orang" 
  ON setting FOR SELECT 
  USING (true);

-- Policy: Hanya authenticated user yang bisa update setting
CREATE POLICY "Setting bisa dikelola authenticated user" 
  ON setting FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Index untuk performa
CREATE INDEX idx_pembayaran_santri_id ON pembayaran(santri_id);
CREATE INDEX idx_pembayaran_bulan_tahun ON pembayaran(bulan, tahun);
CREATE INDEX idx_pengeluaran_tanggal ON pengeluaran(tanggal);
CREATE INDEX idx_santri_nama ON santri(nama);
