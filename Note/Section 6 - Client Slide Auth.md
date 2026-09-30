# Section 6: Client Side Auth

## 128. Basics of Redux Thunk

- **`dispatch`** là function của Redux: nhận một action object → đưa qua toàn bộ middleware → tới reducers → cập nhật state. Có thể hình dung như một "cái phễu" mà mọi action đều phải đi qua. Bình thường action creator trả về object, Redux tự đưa object đó vào `dispatch`.
- Đặt tên type chung là `AUTH_USER` (không phải `SIGNUP_USER`) vì cùng một type sẽ dùng lại cho sign up, sign in và sign out (bài 140).
- **Redux Thunk** là middleware cho phép action creator trả về **function** thay vì object. Function đó được gọi với tham số **`dispatch`**:
  ```js
  export const signup = (formProps) => (dispatch) => {
      // gọi API, chờ kết quả...
      dispatch({ type: AUTH_USER, payload: token });
  };
  ```
- Nhờ tự nắm `dispatch`, trong một action creator có thể:
  - dispatch **nhiều** action, không giới hạn;
  - dispatch **bất kỳ lúc nào**, VD sau khi request async hoàn tất.
- **Redux Thunk vs Redux Promise:**
  - Redux Promise: chỉ trả về **một** action, và payload phải là Promise → đơn giản nhưng hạn chế.
  - Redux Thunk: toàn quyền kiểm soát việc dispatch → gọi nhiều request, chờ bao lâu tuỳ ý, validate… rồi mới dispatch.
- Cú pháp rút gọn giống middleware (Section 4): `function` trả về `function` → viết thành 2 arrow function nối nhau `(args) => (dispatch) => { ... }`. Mọi logic nằm trong thân function trong cùng.
- Hiện đại: `redux-thunk` v3 dùng named export `import { thunk } from "redux-thunk"`. Redux Toolkit (`configureStore`) có sẵn thunk, không cần cài thêm.

## 129. Calling the API

- Server phải đang chạy (VD `npm run dev` ở port 3090) thì client mới gọi được.
- Gọi API đăng ký bằng axios:
  ```js
  export const signup = (formProps) => (dispatch) => {
      axios.post("http://localhost:3090/signup", formProps);
  };
  ```
- Mẹo: thay vì destructure `{ email, password }` rồi gom lại thành object mới, nhận thẳng cả object `formProps` (giá trị các ô trong form) rồi gửi đi → code gọn hơn.
- Muốn component gọi được action creator → nối bằng `connect(null, actions)`. Khi đã có HOC khác (VD `reduxForm`), lồng nhiều HOC sinh ra rất nhiều dấu ngoặc → dùng helper `compose` của Redux để viết gọn (bài 130).

## 131. CORS in a Nutshell

- Lỗi thường gặp: `No 'Access-Control-Allow-Origin' header is present on the requested resource.`
- **CORS** (Cross-Origin Resource Sharing) là cơ chế bảo mật **do browser thực thi**.
- **Vấn đề nó giải quyết:** trang độc hại `malicious-site.com` lừa user bấm nút, chạy JavaScript gửi request chuyển tiền tới API `my-bank.com`. Cần cách để API chỉ nhận request từ trang của chính mình.
- **Cách hoạt động:**
  1. JavaScript trên trang hiện tại gửi request tới **origin khác**.
  2. Browser thấy đáng ngờ → trước khi gửi request thật, tự gửi một **preflight request** hỏi server: "Có request từ origin X, có cho phép không?"
  3. Server trả lời cho phép hay không.
  4. Không được phép → browser chặn và báo lỗi cho JavaScript; được phép → gửi request thật.
- **Origin khác nhau** khi khác **domain**, **subdomain** hoặc **port**. VD `localhost:3000` → `localhost:3090` là khác origin (khác port) → CORS có hiệu lực.
- Express **mặc định không cho phép** request cross-origin.
- **Ý hay bị hỏi khi phỏng vấn:**
  - CORS là giới hạn của **browser**, developer **không thể** tắt hay vượt qua nó từ phía client.
  - Postman, curl… **không** áp dụng CORS → cùng request đó chạy được trên Postman nhưng lỗi trên browser.

## 132. Solution to CORS Errors

- Vì browser luôn kiểm tra CORS và không thể tắt → **sửa ở server**: cấu hình server trả lời preflight là "cho phép".
- Cài package `cors` **vào server** (không phải client) rồi gắn như một Express middleware:
  ```js
  const cors = require("cors");
  app.use(cors());
  ```
- `cors()` mặc định cho phép request từ **mọi origin** → phù hợp khi phát triển. Có thể giới hạn chỉ một số origin, VD `cors({ origin: "http://localhost:3000" })`.
- Chỉ sửa server, không cần reload client. Sau khi sửa, request đăng ký thành công và trả về JWT trong `token`.

## 134. Displaying Auth Errors

- Vấn đề: đăng ký lần 2 với cùng email → server trả lỗi, nhưng UI không báo gì cho user.
- Với `async/await`, bắt lỗi request bằng **`try/catch`**; lỗi thì dispatch một action lỗi:
  ```js
  export const signup = (formProps, callback) => async (dispatch) => {
      try {
          const response = await axios.post("http://localhost:3090/signup", formProps);
          dispatch({ type: AUTH_USER, payload: response.data.token });
      } catch (e) {
          dispatch({ type: AUTH_ERROR, payload: "Email in use" });
      }
  };
  ```
- Reducer thêm case `AUTH_ERROR` → lưu vào `errorMessage`:
  ```js
  case AUTH_ERROR:
      return { ...state, errorMessage: action.payload };
  ```
- Component lấy `errorMessage` qua `mapStateToProps` (`state.auth.errorMessage`) và hiển thị ngay trên nút submit.
- Mẹo debug: thấy code đúng mà UI không đổi → thử refresh lại browser trước khi đi tìm lỗi.
- Hiện đại: có thể lấy thông báo lỗi thật từ server qua `e.response.data.error` thay vì chuỗi cố định. Với hook: `useSelector((state) => state.auth.errorMessage)`.

## 135. Redirect on Signup

- Yêu cầu: đăng ký thành công → tự chuyển sang trang `/feature`.
- Vấn đề: việc chuyển trang cần `history` (thuộc component), nhưng thời điểm "đăng ký xong" lại nằm trong action creator.
- Giải pháp: **truyền `callback` từ component vào action creator**; action creator gọi `callback()` khi request thành công:
  ```js
  // Component
  onSubmit = (formProps) => {
      this.props.signup(formProps, () => {
          this.props.history.push("/feature");
      });
  };

  // Action creator
  export const signup = (formProps, callback) => async (dispatch) => {
      try {
          const response = await axios.post(url, formProps);
          dispatch({ type: AUTH_USER, payload: response.data.token });
          callback();
      } catch (e) { /* ... */ }
  };
  ```
- `callback()` chỉ nằm trong `try` sau khi thành công → đăng ký lỗi thì không chuyển trang.
- Hiện đại (React Router v6/v7): không còn `props.history`, dùng `const navigate = useNavigate();` rồi truyền `() => navigate("/feature")` làm callback.

## 139. Persisting Login State

- **Vấn đề:** refresh trang → toàn bộ Redux state bị xoá → mất token → user bị coi là chưa đăng nhập (bị `requireAuth` đẩy về `/`).
- **Giải pháp:** lưu token vào **`localStorage`** của browser. Dữ liệu trong `localStorage` vẫn còn sau khi refresh.
  - Lưu: `localStorage.setItem("token", value)`
  - Đọc: `localStorage.getItem("token")`
- Hai bước:
  1. Sau khi nhận token từ API → lưu vào `localStorage`:
     ```js
     localStorage.setItem("token", response.data.token);
     ```
  2. Khi app khởi động → đọc token ra làm **initial state** của store:
     ```js
     const store = createStore(
         reducers,
         { auth: { authenticated: localStorage.getItem("token") } },
         applyMiddleware(reduxThunk)
     );
     ```
- Kết quả: refresh trang vẫn giữ được trạng thái đăng nhập.

## 140. Signing Out a User

- Đăng xuất gồm 2 bước:
  1. Xoá token khỏi `localStorage`.
  2. Đặt `authenticated` trong state về chuỗi rỗng (hoặc `false`).
- Với JWT, server **không lưu phiên đăng nhập** → đăng xuất chỉ là **xoá token ở phía client**.
- Action creator `signout` là action **đồng bộ** bình thường (không gọi API), nên không cần dùng thunk:
  ```js
  export const signout = () => {
      localStorage.removeItem("token");

      return { type: AUTH_USER, payload: "" };
  };
  ```
- **Dùng lại type `AUTH_USER`**: reducer chỉ gán `authenticated = action.payload` → truyền token để đăng nhập, truyền `""` để đăng xuất. Một type dùng cho nhiều mục đích.
- Tạo route `/signout` với component `Signout`, gọi `signout` khi component được hiển thị (`componentDidMount`) và hiện "Sorry to see you go".
- Lưu ý: hàm xoá đúng là `localStorage.removeItem("token")` (video đọc là `clearItem`, không tồn tại). `localStorage.clear()` xoá **toàn bộ** dữ liệu của trang.

## 146. Auth Wrapup

- **Redux Thunk:** `(args) => (dispatch) => { ... }`, function trong nhận `dispatch` để tự dispatch bao nhiêu action, lúc nào cũng được (bài 128).
- **Lưu JWT trong `localStorage`:** tiện nhưng **chưa hẳn an toàn**. Nếu web bị tấn công **XSS** (cross-site scripting), kẻ tấn công có thể đọc token và mạo danh user. Đây là vấn đề chưa có lời giải tuyệt đối.
  - Hiện đại: dự án thật thường lưu token trong cookie `httpOnly` (JavaScript không đọc được) để giảm rủi ro XSS.
- **Tái sử dụng HOC `requireAuth`** từ Section 3 cho project mới gần như không phải sửa gì → HOC là cách tốt để đóng gói chức năng dùng lại giữa nhiều project.
- **Import CSS trực tiếp trong file JS** (`import "./Header.css"`): Create React App có sẵn cấu hình Webpack để xử lý.
- Luồng auth hoàn chỉnh: sign up / sign in → nhận JWT → lưu `localStorage` + Redux → gửi token khi gọi API cần đăng nhập → sign out = xoá token.
