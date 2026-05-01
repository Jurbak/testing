-- Kosongkan semua tabel data
DELETE FROM pembayaran;
DELETE FROM pengeluaran;
DELETE FROM santri;

-- Reset setting ke default
UPDATE setting SET jumlah_kas_per_bulan = 0, nama_organisasi = 'Organisasi Santri' WHERE id = 1;

-- Verifikasi
SELECT 'santri' as tabel, count(*) as jumlah FROM santri
UNION ALL
SELECT 'pembayaran', count(*) FROM pembayaran
UNION ALL
SELECT 'pengeluaran', count(*) FROM pengeluaran
UNION ALL
SELECT 'setting', count(*) FROM setting;
