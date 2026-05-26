# 🔌 Kết nối Notion → Dashboard tự động

Sau khi setup, mỗi khi anh edit topic trong Notion, dashboard **tự cập nhật trong 1 giờ** (hoặc anh trigger manual ngay).

**Anh KHÔNG cần đụng vào code.**

---

## ✅ CHECKLIST (5 bước, tổng ~5 phút)

### Bước 1 · Tạo Notion Integration
1. Mở https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Đặt tên: `Shadow English Dashboard Sync`
4. Associated workspace: chọn **Ngoại Ngữ Shadowing | 2026**
5. Type: **Internal**
6. Click **Save**
7. Tab **"Configuration"** → copy **Internal Integration Secret** (bắt đầu bằng `secret_...`)

### Bước 2 · Cho Integration quyền đọc Topics Database
1. Mở **📚 TOPICS DATABASE** trong Notion: https://www.notion.so/37aafd9415a940e4a9c054794fcd0ec5
2. Click `···` góc trên phải → **"Connect to"** (hoặc "Add connections")
3. Tìm `Shadow English Dashboard Sync` → Click để connect
4. Confirm

### Bước 3 · Lấy Database ID
1. URL của Topics Database là: `https://www.notion.so/37aafd9415a940e4a9c054794fcd0ec5`
2. Database ID = phần sau dấu `/` cuối cùng → **`37aafd9415a940e4a9c054794fcd0ec5`**
3. Copy lại

### Bước 4 · Lưu Secrets vào GitHub
1. Mở https://github.com/TruongCRM/shadow-english-dashboard/settings/secrets/actions
2. Click **"New repository secret"**
3. **Secret 1:**
   - Name: `NOTION_TOKEN`
   - Value: paste token từ Bước 1 (`secret_...`)
   - Save
4. Click **"New repository secret"** lần 2:
   - Name: `NOTION_TOPICS_DB`
   - Value: `37aafd9415a940e4a9c054794fcd0ec5`
   - Save

### Bước 5 · Trigger sync lần đầu
1. Mở https://github.com/TruongCRM/shadow-english-dashboard/actions
2. Click workflow **"Sync content from Notion"**
3. Click **"Run workflow"** (góc phải) → **Run workflow**
4. Đợi ~30 giây
5. Refresh dashboard → content giờ pull từ Notion ✨

---

## 📝 CÁCH EDIT CONTENT TRONG NOTION

Mở 1 topic page trong **📚 TOPICS DATABASE** (vd: "Ordering Food & Drinks"). Anh sẽ thấy các fields:

| Field | Format |
|---|---|
| **Topic ID** | Code riêng (vd: `L1-01`). Bắt buộc — dashboard dùng cái này làm key |
| **Topic Name** | Tên hiển thị (vd: "Ordering Food & Drinks") |
| **Why** | 1-2 câu lý do học topic này |
| **Scene** | Bối cảnh sử dụng (ở đâu, ai nói) |
| **Phrases Before** | Cụm dùng trước action. Format mỗi dòng: `English — Vietnamese` |
| **Phrases During** | Cụm dùng trong action |
| **Phrases After** | Cụm dùng sau action |
| **Dialogues** | Hội thoại mẫu. Dòng đầu = title, các dòng sau là `Speaker: line`. Cách giữa các dialogue bằng dòng trống |
| **Shadow Script** | Đoạn script để shadow ×3 lần |
| **Real Life Missions** | Mỗi dòng = 1 mission đời thật |
| **Active Recall** | Mỗi dòng = 1 câu hỏi recall (kiểm tra phản xạ) |
| **Real English** | Native shortcuts, slang, biến thể câu (mỗi dòng 1 cái) |

### Ví dụ điền **Phrases Before** cho topic Restaurant:
```
Can we see the menu, please? — Cho tôi xem menu
We'd like a table for two. — Cho chúng tôi bàn 2 người
Do you have any recommendations? — Có món gì gợi ý không?
```

### Ví dụ điền **Dialogues**:
```
Gọi món cơ bản
You: Can we see the menu, please?
Staff: Of course, here you are.
You: I'd like the grilled salmon.

Phàn nàn món ăn
You: Excuse me, this is a little too salty.
Staff: I'm sorry, I'll bring you another one.
```

---

## 🔄 KHI NÀO DASHBOARD CẬP NHẬT?

- **Tự động:** mỗi giờ (qua GitHub Action `cron`)
- **Manual ngay:** vào tab **Actions** trên GitHub → Click "Run workflow"
- **Cách commit thủ công content.json:** anh không cần, GitHub Action lo

---

## 🧪 TEST NHANH

Sau khi setup xong:
1. Vào Notion, mở topic **Ordering Food & Drinks**
2. Sửa text trong field **Why** (vd: thêm 1 câu)
3. Vào GitHub Actions → trigger **Run workflow**
4. Đợi 30 giây
5. Mở https://truongcrm.github.io/shadow-english-dashboard/?v=5
6. Click vào topic Ordering Food → thấy text Why đã đổi ✅

---

## ❓ TROUBLESHOOT

**Workflow chạy fail với "Missing NOTION_TOKEN"?**
→ Quay lại Bước 4, kiểm tra tên Secret đúng chưa: `NOTION_TOKEN` (không phải `NOTION_API_KEY`).

**Workflow chạy fail với "Notion API 404"?**
→ Integration chưa được connect tới Topics Database. Quay lại Bước 2.

**Dashboard hiện content cũ?**
→ Hard refresh (Ctrl+Shift+R hoặc Cmd+Shift+R). Service Worker cache.

**Topic mới thêm vào Notion không hiện?**
→ Đảm bảo field **Topic ID** đã điền (vd: `L1-13`, `L2-11`).

---

## 🏗 KIẾN TRÚC ĐỂ ANH HIỂU

```
[Anh edit Notion]
      ↓
[Notion API]
      ↓
[GitHub Action mỗi giờ]
      ↓
[content.json trong repo]
      ↓
[Dashboard fetch + render]
      ↓
[Anh thấy update]
```

**Code KHÔNG đụng vào.** Dashboard là **render engine**, Notion là **CMS**.

Anh muốn thêm 300 topics? Cứ thêm trong Notion. Không cần code dev. Hệ thống tự scale.
