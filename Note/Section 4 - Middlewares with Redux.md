# Section 4: Middlewares with Redux

## 78. Introduction to Middlewares

- Middleware được gắn khi tạo store, qua tham số thứ 3 của `createStore`: `createStore(reducers, initialState, applyMiddleware(...))`.
- Luồng dữ liệu Redux có middleware:
  `React component -> gọi action creator -> trả về action -> **middlewares** -> reducers -> state mới -> React re-render`
- **Middleware** là các function nhận mọi action **trước khi** action đến reducer. Middleware có thể:
  - **log** action (debug),
  - **modify** action (thay đổi payload…),
  - **stop** action (không cho đến reducer),
  - hoặc **delay** action (chờ xử lý async xong mới cho đi tiếp).
- Có thể hình dung middleware như một "trạm kiểm tra" mà action đi qua trước khi vào reducer.

## 79. The Purpose of Redux Promise

- Action creator async kiểu này trả về payload là một **Promise**, không phải dữ liệu:
  ```js
  export function fetchComments() {
      const response = axios.get("https://jsonplaceholder.typicode.com/comments");
      return { type: FETCH_COMMENTS, payload: response };
  }
  ```
- **Vấn đề timing:**
  - Từ lúc gửi request đến lúc `return` action: gần như tức thì.
  - Từ lúc gửi request đến lúc API trả response: vài chục ms đến vài giây.
  - -> Action được return **trước rất lâu** so với lúc có dữ liệu.
- **Không có middleware:** action đến reducer ngay lập tức, `action.payload` là **Promise đang pending** -> reducer không có dữ liệu để xử lý (`action.payload.data` là `undefined`).
- **Có `redux-promise`:** middleware thấy payload là Promise -> **giữ action lại**, chờ Promise resolve, rồi mới cho action (với payload là response thật) đến reducer. Nhờ vậy reducer luôn nhận được dữ liệu, dù API chậm bao lâu.
- Mẹo debug: đặt `debugger` trong reducer, mở DevTools rồi xem giá trị `action` để thấy payload là dữ liệu hay Promise.
- Kết luận: Redux mặc định chỉ xử lý action đồng bộ. Muốn làm việc async (gọi API…), phải thông qua middleware.
- Hiện đại: Redux Toolkit có sẵn `redux-thunk` (action creator trả về function nhận `dispatch`) và `createAsyncThunk`. `redux-promise` hầu như không còn được dùng.

## 80. How Async Middlewares Work

- **Middleware stack:** không giới hạn số middleware. Mọi middleware nối thành chuỗi, action đi qua **lần lượt từng cái** theo thứ tự khai báo trong `applyMiddleware`, cuối chuỗi là reducers.
- Mỗi middleware nhận action và tự quyết định:
  - Không quan tâm -> **chuyển tiếp** cho middleware kế tiếp.
  - Quan tâm -> xử lý (log, sửa, chặn…) rồi chuyển tiếp hoặc không.
- **Logic của async middleware (tự viết lại `redux-promise`):**
  1. Action có Promise trong `payload` không?
  2. **Không** -> chuyển tiếp cho middleware kế tiếp.
  3. **Có** -> chờ Promise resolve -> tạo **action mới** (cùng `type`, `payload` = response) -> gửi action mới **đi lại từ đầu** qua toàn bộ middleware.
  4. Lần này payload không còn là Promise -> rơi vào nhánh "Không" -> đến reducers.
- **Tại sao gửi action mới đi lại từ đầu chuỗi** thay vì đẩy thẳng xuống reducer?
  - Để middleware **không phụ thuộc vào thứ tự sắp xếp**.
  - VD: middleware #1 cần xem action có danh sách comment, async middleware đứng ở vị trí #3. Nếu #3 đẩy thẳng xuống reducer thì #1 không bao giờ thấy action có dữ liệu.
  - Quy tắc chung: middleware nào **thay đổi** action thì gửi action mới qua lại toàn bộ chuỗi, để mọi middleware đều có cơ hội thấy phiên bản mới.

## 81. Crazy Middleware Syntax

- Middleware là **3 function lồng nhau**, mỗi function trả về function tiếp theo:
  ```js
  export default function ({ dispatch }) {
      return function (next) {
          return function (action) {
              // logic middleware
          };
      };
  }
  ```
- Ý nghĩa tham số từng lớp:
  - Lớp 1: object chứa các hàm của store (`dispatch`, `getState`). Destructure lấy phần cần dùng.
  - Lớp 2: `next` là function, tham chiếu đến **middleware kế tiếp** trong chuỗi (hoặc reducers nếu là middleware cuối).
  - Lớp 3: `action` là action object thật được trả về từ action creator (`type`, `payload`…).
- Cấu trúc lồng nhau này là **quyết định thiết kế của tác giả Redux**, về mặt chức năng có thể gộp thành một function `(dispatch, next, action)`.
- Refactor sang arrow function, **hoàn toàn tương đương** bản trên:
  - Bỏ `function`, đặt `=>` sau danh sách tham số.
  - Body chỉ có một expression (`return` một function) -> bỏ `{}` và `return`.
  - Một tham số -> có thể bỏ `()`.
  - Gộp lại trên một dòng:
  ```js
  export default ({ dispatch }) => (next) => (action) => {
      // logic middleware
  };
  ```
- Đây là **boilerplate** cho mọi middleware.

## 82. Forwarding Actions

- Tạo file middleware trong thư mục riêng, VD `src/middlewares/async.js`.
- JavaScript không có cách chắc chắn để kiểm tra một giá trị có phải Promise không -> kiểm tra **có hàm `.then` không** (duck typing):
  ```js
  export default ({ dispatch }) => (next) => (action) => {
      // Không có payload hoặc payload không phải Promise -> chuyển tiếp
      if (!action.payload || !action.payload.then) {
          return next(action);
      }
      // ...xử lý Promise (bài 83)
  };
  ```
- `next(action)` chuyển action cho middleware kế tiếp (hoặc reducers).
- `return` ở đây để **dừng** hàm, không chạy tiếp code phía dưới, chứ không nhằm trả về giá trị.

## 83. Waiting for Promise Resolution

- **`dispatch`** là hàm trung tâm của Redux: nhận action -> cho đi qua **toàn bộ** middleware từ đầu -> đến reducers. Mọi lần gọi action creator (qua `connect`), action đều được đưa vào `dispatch`.
- **`dispatch` vs `next`:**
  - `next(action)`: đi tiếp từ **vị trí hiện tại** sang middleware kế tiếp.
  - `dispatch(action)`: đi lại **từ đầu** chuỗi middleware.
- Xử lý nhánh có Promise:
  ```js
  action.payload.then((response) => {
      const newAction = { ...action, payload: response };
      dispatch(newAction);
  });
  ```
  - `.then(cb)`: `cb` chạy khi Promise resolve, nhận dữ liệu trả về từ API.
  - `{ ...action, payload: response }`: copy **mọi** property của action cũ (không chỉ `type`, phòng khi action có thêm property khác), rồi ghi đè `payload` bằng dữ liệu thật.
  - `dispatch(newAction)`: action mới đi lại từ đầu qua mọi middleware (lý do ở bài 80). Tới async middleware lần nữa, payload không còn `.then` -> rơi vào `next(action)` -> đến reducers.
- Cuối cùng thay `reduxPromise` bằng middleware tự viết trong `applyMiddleware(...)`.

## 88. Middleware Creation

- Middleware kiểm tra state (`src/middlewares/stateValidator.js`): sau mỗi action, kiểm tra state có đúng cấu trúc mô tả trong JSON Schema không.
- Khác async middleware: middleware này gọi **`next(action)` ngay đầu tiên**, để action đi hết các middleware còn lại và reducers **trước**, rồi mới validate state **đã cập nhật**.
- Object ở lớp 1 ngoài `dispatch` còn có **`getState()`**: trả về toàn bộ state hiện tại của Redux store.
- Schema lưu trong file riêng (VD `stateSchema.js` với `export default { ...schema }`); JSON Schema là object JS thường nên không bắt buộc phải là file `.json`.
- Validate bằng thư viện `tv4`: `tv4.validate(data, schema)` trả về `true` / `false`.
  ```js
  import tv4 from "tv4";
  import stateSchema from "middlewares/stateSchema";

  export default ({ dispatch, getState }) => (next) => (action) => {
      next(action);

      if (!tv4.validate(getState(), stateSchema)) {
          console.warn("Invalid state schema detected");
      }
  };
  ```
- Hiện đại: `tv4` đã ngừng phát triển, dùng **`ajv`**. Compile schema một lần rồi dùng lại, `validate.errors` cho biết field nào sai:
  ```js
  const validate = new Ajv().compile(stateSchema);
  if (!validate(getState())) console.warn("Invalid state schema detected", validate.errors);
  ```
