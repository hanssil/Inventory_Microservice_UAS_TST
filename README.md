# Inventory Microservice (E-Commerce)

Layanan backend untuk mengelola katalog produk, stok, dan berat barang untuk keperluan integrasi dengan sistem logistik. Microservice ini dibangun seminimalis mungkin menggunakan Node.js Native (tanpa framework eksternal) untuk mencapai **Low Memory Footprint** yang ideal untuk deployment di STB (Set-Top Box).

---

## 📋 Teknologi yang Digunakan

- **Node.js** - Runtime JavaScript
  - Native Modules: `http`, `fs`, `url`, `path`
  - Tanpa framework eksternal (Express, Fastify, dll)
- **Docker** - Containerization
  - Base Image: `node:alpine` (minimal size)
- **Database** - JSON File Based
  - File: `data/products.json`
  - In-Memory caching untuk performa optimal

---

## 🚀 Cara Menjalankan (Local Development)

### Prasyarat
- Node.js sudah terinstall (versi 14.x atau lebih baru)

### Menjalankan Server
Karena menggunakan Node.js Native Modules, **tidak perlu `npm install`** atau dependency eksternal.

```bash
node server.js
```

Server akan berjalan di **port 3000**.

**Output:**
```
==================================================
🚀 Inventory Service running on port 3000
📦 Total products: 22
🌐 API endpoint: http://localhost:3000
==================================================
```

---

## 🐳 Cara Menjalankan dengan Docker (Deployment)

### Build Docker Image
```bash
docker build -t hans_inventory .
```

### Run Container dengan Memory Limit
```bash
docker run -d -p 3000:3000 --name hans_container --memory="40m" hans_inventory
```

**Penjelasan Parameter:**
- `-d` : Detached mode (background)
- `-p 3000:3000` : Port mapping (host:container)
- `--name hans_container` : Nama container
- `--memory="40m"` : Limit RAM maksimal 40MB
- `hans_inventory` : Nama image

### Perintah Docker Berguna Lainnya

```bash
# Melihat log container
docker logs hans_container

# Menghentikan container
docker stop hans_container

# Menjalankan ulang container
docker start hans_container

# Menghapus container
docker rm -f hans_container

# Melihat penggunaan resource
docker stats hans_container
```

---

## 📚 Dokumentasi API (Endpoints)

Base URL (Production): `https://hans.tugastst.my.id`  
Base URL (Local): `http://localhost:3000`

### 1. Get All Products
Menampilkan semua produk yang tersedia dalam katalog.

**Endpoint:**
```
GET /products
```

**Response (200 OK):**
```json
{
  "success": true,
  "total": 22,
  "data": [
    {
      "id": "PROD-001",
      "name": "Laptop ASUS ROG Strix G15",
      "category": "Laptop",
      "price": 18500000,
      "stock": 15,
      "weight_kg": 2.5
    },
    {
      "id": "PROD-002",
      "name": "Smartphone Samsung Galaxy S23",
      "category": "Smartphone",
      "price": 12000000,
      "stock": 30,
      "weight_kg": 0.3
    }
    // ... produk lainnya
  ]
}
```

---

### 2. Get Product by ID
Menampilkan detail 1 produk berdasarkan ID. **Penting untuk sistem logistik** agar dapat mengecek berat produk untuk perhitungan ongkir.

**Endpoint:**
```
GET /products?id=PROD-001
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "PROD-001",
    "name": "Laptop ASUS ROG Strix G15",
    "category": "Laptop",
    "price": 18500000,
    "stock": 15,
    "weight_kg": 2.5
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Product with id 'PROD-999' not found"
}
```

---

### 3. Add New Product
Menambahkan produk baru ke dalam katalog. Data akan otomatis disimpan ke file `data/products.json`.

**Endpoint:**
```
POST /products
```

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "PROD-023",
  "name": "Laptop Dell XPS 13",
  "category": "Laptop",
  "price": 22000000,
  "stock": 10,
  "weight_kg": 1.2
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product added successfully",
  "data": {
    "id": "PROD-023",
    "name": "Laptop Dell XPS 13",
    "category": "Laptop",
    "price": 22000000,
    "stock": 10,
    "weight_kg": 1.2
  }
}
```

**Response (409 Conflict):**
```json
{
  "success": false,
  "message": "Product with id 'PROD-023' already exists"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Missing required fields: id, name, category, price, stock, weight_kg"
}
```

---

### 4. Root Endpoint (API Info)
Menampilkan informasi dasar tentang API.

**Endpoint:**
```
GET /
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Inventory Service API",
  "version": "1.0.0",
  "endpoints": {
    "GET /products": "Get all products",
    "GET /products?id=PROD-xx": "Get product by ID",
    "POST /products": "Add new product"
  }
}
```

---

## 🌐 Akses Layanan (Deployment Info)

### IP Internal (Tailscale VPN)
```
http://100.114.117.49:3000
```

### Public URL
```
https://hans.tugastst.my.id
```

---

## 📊 Struktur Data Produk

Setiap produk memiliki field berikut:

| Field | Type | Required | Deskripsi |
|-------|------|----------|-----------|
| `id` | String | ✅ | ID unik produk (contoh: "PROD-001") |
| `name` | String | ✅ | Nama produk |
| `category` | String | ✅ | Kategori produk |
| `price` | Number | ✅ | Harga dalam Rupiah |
| `stock` | Number | ✅ | Jumlah stok tersedia |
| `weight_kg` | Number | ✅ | Berat produk dalam kilogram (untuk integrasi logistik) |

**Catatan Penting:**
- Field `weight_kg` **sangat penting** untuk integrasi dengan microservice logistik dalam menghitung biaya pengiriman.

---

## 🔗 Integrasi dengan Microservice Logistik

Microservice ini dirancang untuk berintegrasi dengan sistem logistik. Flow integrasi:

1. **Frontend** memanggil endpoint `GET /products` untuk menampilkan daftar produk.
2. User memilih produk dan memasukkan alamat pengiriman.
3. **Frontend** memanggil endpoint `GET /products?id=PROD-xxx` untuk mendapatkan `weight_kg` produk.
4. **Frontend** mengirim data `weight_kg` + alamat ke **Microservice Logistik** untuk perhitungan ongkir.
5. Sistem logistik mengembalikan estimasi biaya dan waktu pengiriman.

---

## 📂 Struktur Project

```
.
├── data/
│   └── products.json      # Database JSON (22 produk elektronik)
├── server.js              # HTTP Server (Node.js Native)
├── Dockerfile             # Docker configuration
└── README.md              # Dokumentasi ini
```

---

## 🎯 Fitur Utama

- ✅ **Zero Dependencies** - Hanya menggunakan Node.js native modules
- ✅ **Low Memory** - Berjalan stabil dengan RAM < 40MB
- ✅ **CORS Enabled** - Siap diakses dari frontend berbeda origin
- ✅ **Auto-Save** - Perubahan data langsung tersimpan ke file
- ✅ **Docker Ready** - Containerized untuk easy deployment
- ✅ **Lightweight** - Image Docker ~50MB (node:alpine)

---

## 👨‍💻 Developer

**Hans** - Inventory Service Developer  
Tugas Besar Teknologi Sistem Terintegrasi  
E-Commerce & Logistik Integration Project

---

## 📝 License

Developed for academic purposes - TST Final Project 2025
