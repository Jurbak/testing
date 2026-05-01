-- Seeder data testing untuk aplikasi Kas Santri
-- Jalankan di SQL Editor Supabase setelah setup.sql

-- 1. Update setting
UPDATE setting SET 
  jumlah_kas_per_bulan = 50000,
  nama_organisasi = 'Pondok Pesantbar Al-Barakah'
WHERE id = 1;

-- 2. Insert data santri (10 santri)
INSERT INTO santri (nama, tanggal_masuk, keterangan) VALUES
  ('Ahmad Fauzi', '2024-01-15', 'Kelas 1'),
  ('Budi Santoso', '2024-02-10', 'Kelas 1'),
  ('Citra Dewi', '2024-01-15', 'Kelas 2'),
  ('Dewi Lestari', '2023-07-20', 'Kelas 3'),
  ('Eko Prasetyo', '2024-03-01', 'Kelas 1'),
  ('Farhan Maulana', '2023-07-20', 'Kelas 3'),
  ('Gita Nirmala', '2024-01-15', 'Kelas 2'),
  ('Hendra Wijaya', '2023-12-01', 'Kelas 2'),
  ('Indah Permata', '2024-04-10', 'Kelas 1'),
  ('Joko Susilo', '2023-07-20', 'Kelas 3');

-- 3. Ambil ID santri untuk insert pembayaran
-- Note: Anda perlu menyesuaikan ID berikut setelah insert, atau gunakan CTE

-- Insert pembayaran (beberapa sudah bayar, beberapa belum)
-- Gunakan subquery untuk mendapatkan ID yang benar
INSERT INTO pembayaran (santri_id, bulan, tahun, jumlah, tanggal_bayar, keterangan)
SELECT id, 1, 2025, 50000, '2025-01-05', 'Dibayar tepat waktu' FROM santri WHERE nama = 'Ahmad Fauzi';

INSERT INTO pembayaran (santri_id, bulan, tahun, jumlah, tanggal_bayar, keterangan)
SELECT id, 1, 2025, 50000, '2025-01-08', '' FROM santri WHERE nama = 'Budi Santoso';

INSERT INTO pembayaran (santri_id, bulan, tahun, jumlah, tanggal_bayar, keterangan)
SELECT id, 1, 2025, 50000, '2025-01-10', '' FROM santri WHERE nama = 'Citra Dewi';

INSERT INTO pembayaran (santri_id, bulan, tahun, jumlah, tanggal_bayar, keterangan)
SELECT id, 1, 2025, 50000, '2025-01-03', '' FROM santri WHERE nama = 'Dewi Lestari';

INSERT INTO pembayaran (santri_id, bulan, tahun, jumlah, tanggal_bayar, keterangan)
SELECT id, 1, 2025, 50000, '2025-01-12', '' FROM santri WHERE nama = 'Farhan Maulana';

INSERT INTO pembayaran (santri_id, bulan, tahun, jumlah, tanggal_bayar, keterangan)
SELECT id, 1, 2025, 50000, '2025-01-07', '' FROM santri WHERE nama = 'Hendra Wijaya';

INSERT INTO pembayaran (santri_id, bulan, tahun, jumlah, tanggal_bayar, keterangan)
SELECT id, 1, 2025, 50000, '2025-01-15', '' FROM santri WHERE nama = 'Joko Susilo';

-- Pembayaran bulan Februari 2025 (sebagian sudah bayar)
INSERT INTO pembayaran (santri_id, bulan, tahun, jumlah, tanggal_bayar, keterangan)
SELECT id, 2, 2025, 50000, '2025-02-05', '' FROM santri WHERE nama = 'Ahmad Fauzi';

INSERT INTO pembayaran (santri_id, bulan, tahun, jumlah, tanggal_bayar, keterangan)
SELECT id, 2, 2025, 50000, '2025-02-03', '' FROM santri WHERE nama = 'Dewi Lestari';

INSERT INTO pembayaran (santri_id, bulan, tahun, jumlah, tanggal_bayar, keterangan)
SELECT id, 2, 2025, 50000, '2025-02-07', '' FROM santri WHERE nama = 'Farhan Maulana';

INSERT INTO pembayaran (santri_id, bulan, tahun, jumlah, tanggal_bayar, keterangan)
SELECT id, 2, 2025, 50000, '2025-02-10', '' FROM santri WHERE nama = 'Joko Susilo';

-- 4. Insert data pengeluaran
INSERT INTO pengeluaran (kategori, jumlah, tanggal, keterangan) VALUES
  ('Listrik & Air', 350000, '2025-01-10', 'Bayar listrik bulan Januari'),
  ('Makanan', 500000, '2025-01-15', 'Belanja bulanan beras dan lauk'),
  ('Perlengkapan', 150000, '2025-01-20', 'Beli sapu, pel, dan sabun'),
  ('Perbaikan', 200000, '2025-02-05', 'Perbaikan keran air kamar mandi'),
  ('Kebutuhan Pondok', 100000, '2025-02-12', 'Beli obat-obatan P3K');

-- Verifikasi data
SELECT 'Data santri:' as info, count(*) as jumlah FROM santri
UNION ALL
SELECT 'Pembayaran Jan 2025:', count(*) FROM pembayaran WHERE bulan = 1 AND tahun = 2025
UNION ALL
SELECT 'Pembayaran Feb 2025:', count(*) FROM pembayaran WHERE bulan = 2 AND tahun = 2025
UNION ALL
SELECT 'Pengeluaran:', count(*) FROM pengeluaran;
