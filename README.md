# Cách chạy dự án
> **Lưu ý:** Workspace root nằm trong thư mục **`src/`**. Tất cả lệnh dưới đây chạy từ **`src/`**.

## 0) Yêu cầu
- Node 20+, pnpm 10+
- Python 3.10+

## 1) Cài dependencies Javascript

```bash
cd src
pnpm install
```

```bash
cd server/core
pnpm prisma generate
```

## 2) Cài dependencies Python

```bash
cd server/ml
python -m venv .venv

# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# macOS/Linux (GitBash):
source .venv/Scripts/activate

pip install -r requirements.txt 
cd ../..
```

## 3) Chạy các services

### Chạy tất cả

```bash
pnpm dev:all
```

### Chỉ server (Core + ML)

```bash
pnpm dev:server
```

### Chạy từng services

```bash
pnpm dev:web
pnpm dev:core
pnpm dev:ml
```

## 4) Kết quả

Web: http://localhost:5173
API express: http://localhost:5000/api/health
ML services: http://localhost:8000/api/health