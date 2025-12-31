const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'products.json');

// Variable memory untuk menyimpan data produk
let products = [];

// Fungsi untuk load data dari file JSON ke memory saat server start
function loadData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    products = JSON.parse(data);
    console.log(`✓ Data loaded: ${products.length} products`);
  } catch (error) {
    console.error('Error loading data:', error.message);
    products = [];
  }
}

// Fungsi untuk save data dari memory ke file JSON (auto-save)
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf8');
    console.log('✓ Data saved to file');
  } catch (error) {
    console.error('Error saving data:', error.message);
  }
}

// Fungsi untuk membaca body dari request POST
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', err => {
      reject(err);
    });
  });
}

// Fungsi untuk mengirim response JSON dengan CORS headers
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Server HTTP
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  const method = req.method;

  // Handle preflight request untuk CORS
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Routing manual
  if (pathname === '/products' && method === 'GET') {
    // GET /products - Return semua data
    if (query.id) {
      // GET /products?id=PROD-xx - Return 1 produk saja
      const product = products.find(p => p.id === query.id);
      if (product) {
        sendJSON(res, 200, {
          success: true,
          data: product
        });
      } else {
        sendJSON(res, 404, {
          success: false,
          message: `Product with id '${query.id}' not found`
        });
      }
    } else {
      // Return semua produk
      sendJSON(res, 200, {
        success: true,
        total: products.length,
        data: products
      });
    }
  } 
  else if (pathname === '/products' && method === 'POST') {
    // POST /products - Tambah produk baru
    try {
      const body = await getRequestBody(req);
      const newProduct = JSON.parse(body);

      // Validasi field wajib
      if (!newProduct.id || !newProduct.name || !newProduct.category || 
          newProduct.price === undefined || newProduct.stock === undefined || 
          newProduct.weight_kg === undefined) {
        sendJSON(res, 400, {
          success: false,
          message: 'Missing required fields: id, name, category, price, stock, weight_kg'
        });
        return;
      }

      // Cek apakah ID sudah ada
      const exists = products.find(p => p.id === newProduct.id);
      if (exists) {
        sendJSON(res, 409, {
          success: false,
          message: `Product with id '${newProduct.id}' already exists`
        });
        return;
      }

      // Tambahkan ke array memory
      products.push(newProduct);

      // Auto-save ke file
      saveData();

      sendJSON(res, 201, {
        success: true,
        message: 'Product added successfully',
        data: newProduct
      });
    } catch (error) {
      sendJSON(res, 400, {
        success: false,
        message: 'Invalid JSON body: ' + error.message
      });
    }
  }
  else if (pathname === '/' && method === 'GET') {
    // Root endpoint - Info API
    sendJSON(res, 200, {
      success: true,
      message: 'Inventory Service API',
      version: '1.0.0',
      endpoints: {
        'GET /products': 'Get all products',
        'GET /products?id=PROD-xx': 'Get product by ID',
        'POST /products': 'Add new product'
      }
    });
  }
  else {
    // 404 - Route tidak ditemukan
    sendJSON(res, 404, {
      success: false,
      message: `Route '${method} ${pathname}' not found`
    });
  }
});

// Load data saat server start
loadData();

// Start server
server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Inventory Service running on port ${PORT}`);
  console.log(`📦 Total products: ${products.length}`);
  console.log(`🌐 API endpoint: http://localhost:${PORT}`);
  console.log('='.repeat(50));
});
