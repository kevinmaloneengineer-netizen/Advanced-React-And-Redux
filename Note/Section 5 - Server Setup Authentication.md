# Section 5: Server Setup - Authentication

## 90. Introduction to Authentication

- **Không có "backend tốt nhất" cho React.** React/Redux chỉ cần nhận **JSON**; backend nào trả được JSON đều dùng được. Server auth xây trong section này là một API độc lập, dùng được cho mọi loại client (web, mobile…).
- **Luồng authentication:**
  1. Client gửi credentials (email/username + password).
  2. Server kiểm tra: sai → từ chối; đúng → user được xác thực.
  3. Server trả về một **identifying piece of information** (token/cookie) đại diện cho user.
  4. Các request sau, client gửi kèm thông tin đó thay vì gửi lại mật khẩu → server nhận ra user → trả protected resource.
- Bản chất: **đổi username + password lấy một thứ định danh**, rồi dùng thứ đó cho mọi request cần xác thực.
- Phần khó nhất là thiết kế và xử lý "identifying piece of information" này.

## 91. Cookies vs Tokens

- HTTP là giao thức **stateless**: mỗi request độc lập, server không tự nhớ ai vừa gửi. Cần gửi kèm thông tin định danh ở mỗi request.
- **Cookies:**
  - Browser **tự động** gửi kèm cookie trong header của mọi request tới domain tương ứng.
  - Server có thể ghi thông tin định danh vào cookie (VD user id) để nhận ra user ở các request sau.
  - **Gắn với từng domain:** cookie của `google.com` không được gửi tới `ebay.com`. Đây là cơ chế bảo mật, chống trang khác lấy cookie để chiếm phiên đăng nhập (session hijacking).
- **Tokens:**
  - Là quy ước, không phải cơ chế có sẵn của browser → phải **tự gắn thủ công** vào header mỗi request.
  - Gửi được tới **bất kỳ domain nào**.
  - Phù hợp với hệ thống phân tán nhiều server/nhiều domain nhưng vẫn cần cùng một phiên đăng nhập.
- **Khác biệt cốt lõi:** cookie tự động nhưng bị giới hạn trong một domain; token phải gắn thủ công nhưng dùng được cross-domain.
- Xu hướng hiện nay (và cách khoá chọn): **token-based authentication**, vì dễ scale cho ứng dụng lớn (bài 92).

## 92. Scalable Architecture

- Tách ứng dụng thành 2 server độc lập:
  - **Content server:** chỉ trả `index.html` + `bundle.js`. Không có business logic, không biết user hay auth → nhẹ, đơn giản, dễ nhân bản ra nhiều vị trí địa lý.
  - **API server:** xử lý dữ liệu và authentication, nằm ở **domain khác** content server.
- Vì API ở domain khác → cookie không dùng được → dùng **token** (đi được cross-domain).
- **Lợi ích:**
  - **Nhiều client dùng chung một API:** web app và mobile app gọi cùng API server, API không bị gắn chặt vào client nào.
  - **Deploy độc lập:** team frontend chỉ cần đẩy `bundle.js`/`index.html` mới lên content server, không gây downtime cho backend và ngược lại.
  - **Scale độc lập:** VD web app chỉ 1.000 user nhưng mobile app 5 triệu user → chỉ cần scale API server, không đụng tới content server.

## 95. Express Middleware

- **Express middleware:** function mà **mọi request** đi vào server đều phải đi qua trước khi tới route handler. Đăng ký bằng `app.use(...)`.
  ```js
  app.use(morgan("combined"));
  app.use(bodyParser.json({ type: "*/*" }));
  ```
- **`morgan`**: logging framework, in ra log mỗi request (method, path, status code…) → dùng để debug.
- **`bodyParser.json({ type: "*/*" })`**: parse body của request thành JSON, gán vào `req.body`.
  - `type: "*/*"`: parse như JSON với **mọi** content type → tiện khi học, nhưng có thể gây lỗi nếu sau này cần nhận file upload hoặc loại dữ liệu khác.
- **`nodemon`**: theo dõi file trong project, tự **restart server** mỗi khi có file thay đổi → không phải tự tắt/mở server sau mỗi lần sửa code.
  - Thêm script vào `package.json`: `"dev": "nodemon index.js"`, chạy bằng `npm run dev`.
- Hiện đại:
  - `body-parser` đã được tích hợp vào Express: dùng `app.use(express.json({ type: "*/*" }))`.
  - Node 18+ có sẵn `node --watch index.js` thay cho `nodemon`.

## 97. Mongoose Models

- **Mongoose** là thư viện đứng giữa code và MongoDB (ODM, trong video gọi là ORM): làm việc với database qua model/object thay vì thao tác trực tiếp.
- Tạo model gồm 3 bước (file `models/user.js`):
  1. **Định nghĩa schema** (`mongoose.Schema`): mô tả các field và kiểu dữ liệu của model.
  2. **Tạo model class** từ schema.
  3. **Export** để file khác dùng.
  ```js
  const mongoose = require("mongoose");
  const Schema = mongoose.Schema;

  const userSchema = new Schema({
      email: { type: String, unique: true, lowercase: true },
      password: String,
  });

  const ModelClass = mongoose.model("user", userSchema);

  module.exports = ModelClass;
  ```
- `String` là constructor `String` có sẵn của JavaScript, không cần import.
- Muốn thêm option cho field → đổi giá trị từ `String` sang object `{ type: String, ...options }`.
- **`unique: true`**: không cho 2 user trùng email. MongoDB báo lỗi khi lưu email đã tồn tại.
- **Cạm bẫy:** unique check **phân biệt hoa thường** → `steven@gmail.com` và `Steven@gmail.com` bị coi là 2 email khác nhau. Fix bằng **`lowercase: true`**: tự chuyển email về chữ thường trước khi lưu → trùng thì unique check bắt được.
- `mongoose.model("user", userSchema)`: đăng ký schema với Mongoose, gắn với collection `users` (Mongoose tự thêm "s").
- **Model class** đại diện cho **toàn bộ** user (dùng để tạo, tìm user), không phải một user cụ thể. Một user cụ thể là **instance** của model class.
- Node (CommonJS) dùng `module.exports` / `require` thay cho `export` / `import`.

## 103. Encrypting Passwords with Bcrypt

- **Validate input:** thiếu `email` hoặc `password` thì dừng sớm, không tạo record:
  ```js
  if (!email || !password) {
      return res.status(422).send({ error: "You must provide email and password" });
  }
  ```
  Có thể validate thêm định dạng email (có `@`, có domain…).
- **Không bao giờ lưu mật khẩu dạng plain text.** Nếu database bị lộ, kẻ tấn công lấy được cả email lẫn mật khẩu thật của mọi user (và user thường dùng lại mật khẩu ở nơi khác).
- Luôn lưu mật khẩu **đã được hash**, dùng thư viện **bcrypt**.
- Hash mật khẩu trong **pre-save hook** của Mongoose để mọi lần lưu user đều tự động hash:
  ```js
  const bcrypt = require("bcrypt-nodejs");

  userSchema.pre("save", function (next) {
      const user = this;

      bcrypt.genSalt(10, function (err, salt) {
          if (err) return next(err);

          bcrypt.hash(user.password, salt, null, function (err, hash) {
              if (err) return next(err);

              user.password = hash;
              next();
          });
      });
  });
  ```
  (Giải thích chi tiết ở bài 104.)
- Hiện đại: `bcrypt-nodejs` đã ngừng phát triển, dùng `bcryptjs` hoặc `bcrypt`. Mongoose 9 hỗ trợ hook dạng `async`, không cần `next` và callback:
  ```js
  userSchema.pre("save", async function () {
      if (!this.isModified("password")) return; // chỉ hash khi password thay đổi
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
  });
  ```

## 104. Salting a Password

> Transcript bị cắt ngay trước phần giải thích salt bằng diagram; phần dưới chỉ gồm đoạn đã có. Bổ sung khi có transcript đầy đủ.

- `userSchema.pre("save", fn)`: **pre-save hook**, chạy `fn` **trước khi** model được lưu vào database.
- Bên trong hook, **`this` là instance của user** đang được lưu → truy cập được `this.email`, `this.password`.
  - Vì cần `this` → phải dùng `function`, **không dùng arrow function** (arrow function không có `this` riêng).
- Luồng xử lý:
  1. `bcrypt.genSalt(10, cb)`: tạo **salt**. Mất một khoảng thời gian → kết quả nhận qua callback.
  2. `bcrypt.hash(password, salt, null, cb)`: hash mật khẩu với salt. Cũng async → nhận `hash` qua callback.
  3. Ghi đè mật khẩu plain text bằng `hash`.
  4. Gọi `next()` → cho phép Mongoose tiếp tục lưu model. Có lỗi thì `next(err)` để dừng việc lưu.
- Kết quả trong database: `password` là một chuỗi dài khó đọc thay vì `123`.
- bcrypt dùng ở **2 thời điểm**: khi **lưu** mật khẩu (sign up, bài này) và khi **so sánh** mật khẩu (sign in, bài 113).
