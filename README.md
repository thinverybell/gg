# ZenCheap Client – Rebuild modular

Đây là project web mới được dựng dựa trên 20 bộ capture F12 mà bạn cung cấp. Không để 20 website HTML tách rời; DOM chính của từng trang được tách thành view EJS riêng, header/footer dùng partial chung, route/backend/admin được tổ chức thành module.

## Client routes
- `/` – Khu vực khách hàng
- `/store_game/minecraft`
- `/bot-server`
- `/client/product/cloud-vps-hosting`
- `/client/services` và `/client/services/manage`
- `/server`
- `/client/cart`
- `/client/recharge`, `/client/recharge/card`, `/client/recharge/stripe`
- `/client/profile`
- `/client/log-balance`
- `/client/logs`
- `/client/notifications`
- `/client/change-password`
- `/client/tickets`, `/client/tickets/new`
- `/client/history-vps`
- `/client/hosting/config`

## Admin
`/admin` + users, products, services, orders, tickets, transactions, notifications, activity, settings.

## Demo
Client: `demo@zencheap.local` / `ChangeMe123!`
Admin: `admin@zencheap.local` / `Admin@12345`

## Chạy
`npm install && npm start`

Các backend thật như provisioning VPS/Hosting hoặc cổng thanh toán không xuất hiện trong capture F12, nên project cung cấp API/luồng mới cho phần quản trị cơ bản thay vì giả lập kết nối vào hệ thống bên thứ ba.
