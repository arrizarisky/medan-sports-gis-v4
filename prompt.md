Perbaiki behavior map polygon pada aplikasi web ini.

Saat ini semua batas wilayah polygon kecamatan di Kota Medan selalu tampil di map sejak halaman pertama dibuka. Saya ingin behavior diubah menjadi lazy interactive polygon rendering.

Kebutuhan utama:

1. Default State
- Saat map pertama dibuka:
  - JANGAN tampilkan seluruh polygon kecamatan
  - JANGAN tampilkan border wilayah
  - Map harus clean seperti map biasa
  - Hanya tampilkan basemap

2. Interaction Behavior
- Polygon dan warna wilayah hanya muncul ketika:
  - user klik salah satu kecamatan di map
  ATAU
  - user memilih kecamatan dari sidebar/dropdown/search

3. Scope Wilayah
- Hanya berlaku untuk kecamatan yang berada di Kota Medan
- Kecamatan lain jangan otomatis render

4. Selected State
Ketika user memilih kecamatan:
- tampilkan polygon boundary kecamatan tersebut
- tampilkan fill color transparan
- tampilkan border lebih tegas
- zoom/flyTo ke area kecamatan
- highlight hanya 1 wilayah aktif

Contoh:
- user klik "Medan Labuhan"
→ hanya polygon Medan Labuhan yang muncul
→ polygon kecamatan lain tetap hidden

5. Deselection Behavior
Ketika:
- user klik area kosong map
ATAU
- user menutup detail kecamatan
MAKA:
- hapus polygon aktif
- map kembali clean

6. Technical Requirements
Lihat dan Refactor file untuk perubahan:
- src/components/Map.tsx
- src/lib/geoUtils.ts

Yang harus diperbaiki:
- jangan render semua GeoJSON polygon di initial load
- simpan selectedKecamatan state
- render polygon secara conditional
- gunakan event click pada layer
- gunakan dynamic styling untuk active polygon
- optimasi agar tidak re-render semua layer

7. Expected Architecture

Contoh state:
```tsx
const [selectedKecamatan, setSelectedKecamatan] = useState(null)

Contoh behavior:

{selectedKecamatan && (
  <GeoJSON
    data={selectedKecamatan.geometry}
    style={activeStyle}
  />
)}
```

8. Styling
Gunakan style modern:
- fillOpacity: 0.25
- border weight: 2
- smooth transition
- hover effect optional
9. Tambahan penting
Pastikan:
- polygon tidak flickering
- tidak duplicate layer
- cleanup layer lama sebelum render baru
- performa tetap ringan walaupun GeoJSON besar
10. Output yang saya inginkan
Berikan:
- refactor lengkap Map.tsx
- refactor geoUtils.ts
- state management yang benar
- event handling click polygon
- conditional rendering terbaik
- optimasi performa React map rendering
- penjelasan singkat kenapa pendekatan ini lebih optimal dibanding render semua polygon sekaligus