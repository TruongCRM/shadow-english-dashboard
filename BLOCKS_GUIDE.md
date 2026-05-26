# 🧱 Custom Content Blocks Guide

Anh có thể chèn **15+ loại block** vào bất kỳ topic nào trong Notion mà KHÔNG cần đụng code.

## 📋 Cách dùng

1. Mở topic page trong **📚 TOPICS DATABASE**
2. Tìm field **"Custom Blocks"**
3. Paste JSON theo format dưới
4. Save · Đợi GitHub Action sync (~1 giờ) hoặc trigger manual
5. Dashboard tự render blocks trong Topic Detail page

## 🧱 15+ BLOCK TYPES

### 1. YouTube Video
```json
[
  {
    "type": "youtube",
    "url": "https://youtu.be/dQw4w9WgXcQ",
    "title": "Native conversation",
    "caption": "Xem ×3 lần, focus intonation"
  }
]
```

### 2. Vimeo Video
```json
[{ "type": "vimeo", "url": "https://vimeo.com/123456", "title": "Demo" }]
```

### 3. Image
```json
[{ "type": "image", "src": "https://example.com/menu.jpg", "caption": "Menu mẫu", "alt": "Restaurant menu" }]
```

### 4. Audio
```json
[{ "type": "audio", "src": "https://example.com/audio.mp3", "title": "Listening practice" }]
```

### 5. PDF
```json
[{ "type": "pdf", "src": "https://example.com/file.pdf", "title": "Menu PDF" }]
```

### 6. Quote
```json
[{ "type": "quote", "text": "Practice makes permanent.", "author": "Vince Lombardi" }]
```

### 7. Callout (with icon + color)
```json
[{ "type": "callout", "icon": "💡", "color": "yellow", "title": "Pro tip", "text": "Tip 15-20% là chuẩn ở Mỹ" }]
```
Colors: `purple` · `blue` · `green` · `yellow` · `orange` · `red` · `pink`

### 8. Tips List
```json
[{ "type": "tips", "title": "5 lưu ý", "items": ["Tip 1", "Tip 2", "Tip 3"] }]
```

### 9. AI Prompt (with copy button)
```json
[{
  "type": "ai-prompt",
  "title": "Practice with AI",
  "prompt": "You're a waiter at an upscale restaurant. Take my order...",
  "tools": [
    {"name": "ChatGPT", "url": "https://chat.openai.com"},
    {"name": "Claude", "url": "https://claude.ai"}
  ]
}]
```

### 10. Note
```json
[{ "type": "note", "title": "Bonus", "text": "Native speakers often drop 'h' in 'her', 'him', 'his'." }]
```

### 11. Checklist (state persist trong browser)
```json
[{
  "type": "checklist",
  "title": "Missions tuần này",
  "items": ["Order món bằng tiếng Anh", "Hỏi recommend", "Pay bill + tip"]
}]
```

### 12. Mini Exercise (with reveal answer)
```json
[{
  "type": "exercise",
  "title": "Quick test",
  "question": "Cách lịch sự nhất để gọi món?",
  "options": ["A. Give me...", "B. I'll have...", "C. I want..."],
  "answer": "B — \"I'll have...\" tự nhiên nhất với native speakers"
}]
```

### 13. Generic Embed (CodePen, Figma, Tweet, etc.)
```json
[{ "type": "embed", "url": "https://codepen.io/...", "title": "Demo", "height": 500 }]
```

### 14. Link Card
```json
[{
  "type": "link",
  "url": "https://www.bbc.co.uk/learningenglish",
  "title": "BBC Learning English",
  "description": "Free English lessons from beginner to advanced",
  "image": "https://example.com/preview.jpg"
}]
```

### 15. Heading + Divider + Spacer
```json
[
  { "type": "heading", "text": "Phần 1: Cơ bản", "level": 2 },
  { "type": "divider" },
  { "type": "spacer", "height": 30 }
]
```

### 16. HTML escape hatch (advanced)
```json
[{ "type": "html", "html": "<div style='color:red'>Custom HTML</div>" }]
```

---

## 📝 FULL EXAMPLE — 1 topic với 5 blocks

Paste tất cả block vào field **"Custom Blocks"** của 1 topic:

```json
[
  {
    "type": "callout",
    "icon": "💡",
    "color": "yellow",
    "title": "Tip về tipping",
    "text": "Ở Mỹ: tip 15-20%. Ở Anh: 10-12.5%. Châu Âu: thường gồm sẵn."
  },
  {
    "type": "youtube",
    "title": "Native restaurant conversation",
    "url": "https://www.youtube.com/watch?v=...",
    "caption": "Xem ×3 lần"
  },
  {
    "type": "tips",
    "title": "5 lưu ý khi gọi món",
    "items": [
      "Could I have... lịch sự hơn Give me...",
      "Native nói I'll have thay vì I want",
      "Pronounce the trước nguyên âm là thee"
    ]
  },
  {
    "type": "exercise",
    "title": "Quick test",
    "question": "Bạn muốn bớt cay — câu nào natural?",
    "options": ["A. Don't put spice", "B. Can you make it less spicy?", "C. No spicy"],
    "answer": "B — natural nhất. A và C nghe ra lệnh"
  },
  {
    "type": "checklist",
    "title": "Missions tuần này",
    "items": [
      "Order món tại quán Việt có English menu",
      "Hỏi recommend bằng tiếng Anh",
      "Phàn nàn lịch sự nếu món sai"
    ]
  }
]
```

---

## 🎨 Một số mẹo

- **Reorder block**: chỉ cần đổi thứ tự trong array
- **Tạm tắt block** không xóa: thêm `"visible": false`
- **Validate JSON**: copy vào https://jsonlint.com kiểm tra trước khi paste
- **Format đẹp trong Notion**: paste với Ctrl+Shift+V (no formatting) để tránh Notion auto-format JSON

## 🆘 Khi gặp lỗi

| Vấn đề | Sửa |
|---|---|
| Block không hiện | Kiểm tra JSON syntax đúng — phải có `[...]` ngoài cùng |
| Hiện "Unknown block type" | Sai `type` (phải đúng tên: youtube, image, audio...) |
| YouTube không play | URL phải có ID video chuẩn (sau `?v=` hoặc `youtu.be/`) |
| Image không load | URL phải public (không phải Google Drive share private) |
| Sync không update | Vào GitHub Actions → trigger Run workflow manual |

---

## 🔮 Coming next (v10)

- Notion **/embed** block tự convert sang block trong dashboard
- Block reorder bằng drag-drop trong app
- Audio recording attach trực tiếp vào checklist mission
- Block templates (preset combos)
