# Section 2: Testing

## 5. Introduction to Jest

- **Jest** là một automated test runner: tìm tất cả file test trong project, chạy các test trong đó, rồi in kết quả ra terminal.
- Create React App cài sẵn Jest (cùng với React, Webpack, Babel), không cần setup thêm.
- `npm run test` -> khởi động Jest, Jest quét thư mục `src/` và chạy mọi file có đuôi `.test.js`.
- Kết quả hiển thị theo từng file và từng test; tên test in ra chính là chuỗi mô tả truyền vào `it(...)`. Dấu ✓ xanh nghĩa là toàn bộ code trong test chạy không lỗi.
- **Watch mode:** sau khi chạy xong, Jest không thoát mà chờ file thay đổi; mỗi lần save file, Jest tự chạy lại test và in kết quả mới.

## 9. What Do We Test?

- Vấn đề hay gặp khi mới viết test: không biết nên test cái gì.
- **Framework chọn test:** với mỗi phần của app (component, reducer, action creator), tưởng tượng giải thích cho một người bạn "phần này dùng để làm gì". Mỗi câu mô tả đó = một test cần viết.
- Test **hành vi/mục đích** của từng phần, không test chi tiết cài đặt.
- Ví dụ áp dụng cho app comment:
  - `App`: hiển thị `CommentBox` -> 1 test; hiển thị `CommentList` -> 1 test.
  - `CommentBox`: có textarea và button -> 1 test; user nhập text rồi submit thì textarea bị xoá trống -> 1 test.
  - `CommentList`: mỗi comment trong state tạo ra đúng 1 phần tử trên màn hình -> 1 test.
  - Comments reducer, `saveComment` action creator: mỗi cái có test riêng.

## 14. Test Structure

- Mỗi test được khai báo bằng hàm **`it(description, fn)`**.
- `it` là **global function** của Jest: không cần import.
- Mỗi test gọi `it` đúng một lần; một file có thể có nhiều `it`.
- Tham số 1 — `description` (string): mô tả mục đích test, chỉ để giao tiếp với người đọc sau này. Jest không dùng chuỗi này cho logic test, chỉ in ra trong kết quả.
- Tham số 2 — function chứa logic test thật sự.
- **Quy ước đặt tên:** viết sao cho đọc liền với chữ "it" thành một câu, chủ ngữ ngầm là component tên file.
  - File `App.test.js` + `it("shows a comment box", ...)` -> đọc là "App — it shows a comment box".
  - Không viết thừa kiểu `"the App shows a comment box"`.

## 15. Tricking React with JSDOM

- Jest chạy trong **terminal (Node.js)**, không có browser. Nhưng React cần môi trường browser (`document`, DOM element…) để render.
- **JSDOM** (CRA cài sẵn) là bản cài đặt browser bằng JavaScript: giả lập `document`, DOM element trong memory -> "đánh lừa" React rằng nó đang chạy trong browser.
- `document.createElement("div")` trong test tạo ra một div **giả**, chỉ tồn tại trong memory, không gắn với Chrome/Firefox nào.
- Cách test thủ công kiểu cũ:
  ```js
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);        // React render HTML của App vào div giả
  // ...kiểm tra nội dung div ở đây
  ReactDOM.unmountComponentAtNode(div); // cleanup
  ```
- Chỉ render mà không có expectation thì test chỉ chứng minh được "component không crash", chưa chứng minh được hành vi.
- **Cleanup:** sau mỗi test nên unmount component / huỷ object đã tạo. Nếu không, component nằm lại trong memory suốt quá trình chạy test suite -> tốn memory, test chạy ngày càng chậm khi có hàng trăm, hàng nghìn test.
- Hiện đại: `render()` của RTL tự tạo container trong JSDOM và **tự cleanup sau mỗi test**; `ReactDOM.render` đã bị xoá trong React 19.

## 17. Test Expectations

- **Expectation** là lõi của test: dòng code chứng minh app chạy đúng như mong đợi.
- Mỗi `it` có thể chứa từ 0 đến nhiều expectation; thường là 1–2.
- Cấu trúc: `expect(subject).matcher(expectedValue)`
  - `expect` — global function, không cần import.
  - `subject` — giá trị cần kiểm tra (object, array, HTML…), VD `div.innerHTML`.
  - `matcher` — cách so sánh/kiểm tra, VD `toContain`, `toEqual`, `toBeTruthy`.
  - `expectedValue` — giá trị mong đợi. Một số matcher không cần tham số (VD `toBeTruthy()` chỉ kiểm tra truthy/falsy).
- Quy ước: bên trái (`expect(...)`) là thứ đang kiểm tra, bên phải (tham số của matcher) là kết quả lý tưởng.
- VD: `expect(div.innerHTML).toContain("Comment Box")`. Cách này **không tốt**: test phụ thuộc vào nội dung HTML bên trong component con (xem bài 18).

## 25. Code Reuse with BeforeEach

- Khi nhiều test trong một file có chung code setup -> đưa vào **`beforeEach(fn)`**: chạy `fn` trước **mỗi** `it` trong file.
- Thứ tự: `beforeEach` -> test 1 -> `beforeEach` -> test 2 -> …, mỗi test nhận một bản setup mới, không dùng chung state với test trước.
- **Cạm bẫy scope:** khai báo biến bên trong `beforeEach` thì các `it` không truy cập được (khác scope) -> lỗi `undefined`.
- Cách đúng: khai báo biến ở scope ngoài bằng `let`, chỉ gán giá trị trong `beforeEach`:
  ```js
  let wrapped;

  beforeEach(() => {
      wrapped = shallow(<App />);
  });
  ```
- Dùng `let` thay `const` vì biến bị gán lại trước mỗi test.
- `beforeEach` chỉ áp dụng cho test **trong cùng file** (hoặc cùng `describe`, xem bài 37), không ảnh hưởng file test khác.
- Hiện đại: với RTL thường gọi `render(...)` trong `beforeEach` rồi truy vấn qua `screen`, không cần biến `wrapped`.

## 31. Simulating Change Events

- Khác với các test trước (chỉ render rồi kiểm tra có element), test này **tương tác** với component: giả lập user gõ vào textarea.
- Mục đích: xác nhận controlled component được nối đúng — `value` lấy từ state, `onChange` gọi `setState`. Nếu thiếu `onChange`, user gõ nhưng textarea không hiện chữ.
- Nhắc lại luồng controlled input: change event -> `handleChange` -> `setState({ comment: event.target.value })` -> re-render -> textarea hiện `this.state.comment`.
- Các bước test một tương tác (dùng lại cho mọi loại element):
  1. Render component, tìm element (textarea).
  2. **Simulate** change event trên element (test không có bàn phím thật).
  3. Truyền **fake event object** có `target.value` do mình chọn, để biết chắc giá trị đưa vào `setState`. Nếu không truyền, event mặc định không có value mong muốn.
  4. **Ép component re-render** (lý do ở bài 33).
  5. Expect `value` của textarea đã đổi thành giá trị vừa nhập.
- Hiện đại: `userEvent` gõ từng phím như user thật, event object là thật nên không cần fake event hay ép re-render:
  ```js
  await user.type(screen.getByRole("textbox"), "new comment");
  expect(screen.getByRole("textbox")).toHaveValue("new comment");
  ```

## 37. Describe Statements

- Vấn đề: 2 test có chung setup (VD nhập text vào textarea) nhưng test thứ 3 trong file thì không cần. Đưa setup đó lên `beforeEach` ở top-level sẽ chạy cả trước test thứ 3 -> side effect ngoài ý muốn (VD test cần textarea trống).
- **`describe(description, fn)`** nhóm các test có chung mục đích / setup.
- Lợi ích chính: **giới hạn scope của `beforeEach`**. `beforeEach` đặt trong `describe` chỉ chạy cho các `it` nằm trong `describe` đó.
  ```js
  beforeEach(() => { /* #1: render component */ });

  it("has a text area and a button", ...);   // chỉ chạy #1

  describe("the text area", () => {
      beforeEach(() => { /* #2: nhập text */ });

      it("users can type in", ...);           // chạy #1 rồi #2
      it("gets emptied on submit", ...);      // chạy #1 rồi #2
  });
  ```
- `beforeEach` **cộng dồn** từ ngoài vào trong: test trong `describe` chạy mọi `beforeEach` của scope ngoài trước, rồi mới đến `beforeEach` của `describe`, sau đó là test, cuối cùng là `afterEach`.
- Kết quả test in ra được nhóm theo tên `describe` -> report dễ đọc hơn.

## 42. Redux Test Errors

- Lỗi: `Could not find "store" in either the context or props of "Connect(CommentBox)"`.
- **Nguyên nhân gốc:** component bọc bởi `connect()` luôn tìm `<Provider store={...}>` ở một component cha trong cây. Trong app thật, `index.js` bọc `<App />` bằng `Provider` nên chạy bình thường. Trong test, component được import và render **riêng lẻ**, không có `Provider` phía trên -> lỗi.
- Lỗi chỉ xuất hiện trong môi trường test, không phải trong browser.
- Cách fix dễ nghĩ ra nhất (nhưng **tệ**): trong mỗi file test tự import `createStore`, `Provider`, `reducers` rồi bọc component.
  - Lặp code setup store ở mọi file test.
  - Khi đổi cách tạo store (VD thêm `applyMiddleware`), phải sửa tất cả file test cho khớp với `index.js` -> không scale.
- Cách tốt hơn: gom logic tạo store + `Provider` vào **một chỗ duy nhất**, nhận component bất kỳ làm children. Cả `index.js` và các file test đều dùng chung chỗ này (bài 43).

## 43. Adding a Root Component

> Transcript bị cắt giữa chừng; phần dưới dựa trên đoạn đã có + chiến lược ở bài 42.

- Tạo file `src/Root.js` export component `Root`: tạo Redux store, bọc `props.children` trong `Provider`.
  ```js
  const Root = ({ children }) => (
      <Provider store={createStore(reducers, {})}>{children}</Provider>
  );
  ```
- `index.js` dùng `<Root><App /></Root>`; file test dùng `<Root><CommentBox /></Root>`.
- Lợi ích: store chỉ được cấu hình ở **một nơi**; thêm middleware hay đổi reducer chỉ sửa `Root.js`, app và test tự đồng bộ.
- Tách ra file riêng (thay vì để helper trong `index.js`) giúp code rõ ràng, dễ import vào test.
