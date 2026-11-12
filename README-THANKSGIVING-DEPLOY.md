# DMI Thanksgiving 2026: hướng dẫn deploy (cho IT)

Trang Thanksgiving chạy thành **một Worker riêng**, tên `dmi-thanksgiving-2026`, trong tài khoản Cloudflare của DMI.
Worker Black Friday `dmi-blackfriday` và tên miền `blackfriday2026.detailersmovement.com` **giữ nguyên, không đụng tới**.

- Repo: https://github.com/Arthur-VN/dmi-blackfriday-2026-staging, branch `staging/thanksgiving-2026`
- Bản xem trước (tài khoản Arthur): https://dmi-thanksgiving-staging.arthur-fef.workers.dev
- Tên miền đề xuất: `thanksgiving2026.detailersmovement.com` (đổi tuỳ DMI)

## Deploy (khoảng 10 phút)

```bash
git clone -b staging/thanksgiving-2026 https://github.com/Arthur-VN/dmi-blackfriday-2026-staging.git
cd dmi-blackfriday-2026-staging
npx wrangler login
npx wrangler deploy -c wrangler.thanksgiving.jsonc
npx wrangler secret put GHL_TOKEN -c wrangler.thanksgiving.jsonc
```

- Bắt buộc có `-c wrangler.thanksgiving.jsonc`. Nếu chạy `npx wrangler deploy` không kèm tham số này, wrangler sẽ dùng `wrangler.jsonc` và **ghi đè Worker Black Friday**.
- `GHL_TOKEN`: dùng cùng token với bản Black Friday (Private Integration Token của location `yqROQIaNeeK0xIpi4n67`).

## Gắn tên miền

Cloudflare dashboard → Workers & Pages → `dmi-thanksgiving-2026` → Settings → Domains & Routes → Add → **Custom Domain** → nhập `thanksgiving2026.detailersmovement.com`.
Cloudflare tự tạo bản ghi DNS và SSL, vài phút là chạy.

## Kiểm tra

- `https://<tên miền>/`: ra trang **Thanksgiving Website Sale 2026** (không phải Black Friday).
- `https://<tên miền>/thanksgiving-checkout/?pkg=standard`: trang đặt cọc $99.
- `https://<tên miền>/api/spots`: trả `{"ok":true,...}`. Nếu trả `ok:false` thì `GHL_TOKEN` chưa đúng.

## Khác với bản Black Friday

- `HOME_PATH=/thanksgiving`: trang gốc hiển thị landing Thanksgiving, URL vẫn giữ nguyên.
- Không có KV `FEEDBACK`. Bảng góp ý `/review` chỉ có trên bản Black Friday.
