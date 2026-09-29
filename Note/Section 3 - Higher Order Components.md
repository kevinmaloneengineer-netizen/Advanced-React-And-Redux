# Section 3: Higher Order Components

## 64. An Introduction to Higher Order Components

- **Higher Order Component (HOC)** là một React component bình thường, được tạo ra với mục đích **tái sử dụng code** giữa các component.
- Dấu hiệu nên dùng HOC: copy-paste cùng một đoạn logic qua nhiều component -> code bị duplicate.
- Công thức: `Component thường + HOC = Enhanced (Composed) Component`.
  - Component thường: VD `App`, `CommentBox`, `CommentList`.
  - Enhanced component: có thêm chức năng hoặc dữ liệu do HOC "cho" thêm, component gốc không phải tự viết logic đó.

## 65. Connect - A Higher Order Component

- `connect()` của `react-redux` chính là một HOC. Dùng Redux với `connect` tức là đã dùng HOC.
- Việc `connect` làm hộ: kết nối lên `Provider`, lấy state từ Redux store và bind action creators, rồi truyền xuống component dưới dạng props.
- Nếu không có HOC, mỗi component (`CommentBox`, `CommentList`…) phải tự viết code truy cập store -> lặp code. `connect` gom toàn bộ logic đó vào một chỗ, đã viết sẵn trong thư viện, và mọi component đều dùng lại được.

## 73. Steps for Building a HOC

- Quy trình 4 bước để tạo HOC, dùng được cho mọi project:
  1. Viết logic cần tái sử dụng vào **một component có sẵn** trước (cho chạy đúng ở đó đã).
  2. Tạo file HOC và thêm **HOC scaffold** (boilerplate, xem bài 75).
  3. Chuyển logic ở bước 1 từ component gốc sang HOC.
  4. **Pass props xuống ChildComponent** (bước quan trọng nhất, hay bị quên, xem bài 77).
- Ví dụ trong app: HOC `requireAuth` chặn trang `/post` (`CommentBox`) khi chưa đăng nhập, tự chuyển về `/`.
- Bước 1 áp dụng vào `CommentBox`:
  - Thêm `mapStateToProps` trả về `{ auth: state.auth }` để component đọc được trạng thái đăng nhập.
  - Kiểm tra auth ở **2 thời điểm**, bằng 2 lifecycle method:
    - `componentDidMount`: component vừa render lần đầu (user vào thẳng `/post`).
    - `componentDidUpdate`: component nhận props mới (user đang ở `/post` rồi bấm Sign Out -> `auth` đổi).
  - Logic giống nhau nên gom vào một helper method, gọi từ cả 2 lifecycle:
    ```js
    componentDidMount() { this.shouldNavigateAway(); }
    componentDidUpdate() { this.shouldNavigateAway(); }

    shouldNavigateAway() {
        if (!this.props.auth) {
            // điều hướng user đi (bài 74)
        }
    }
    ```

## 74. Forced Navigation with React Router

- Chỉ kiểm tra ở `componentDidMount` là **không đủ**: bỏ sót trường hợp user đang ở trang được bảo vệ rồi sign out. Lúc đó component không mount lại mà chỉ re-render với `props.auth` mới -> cần `componentDidUpdate`.
- **Programmatic navigation** (chuyển trang bằng code, không phải user bấm `Link`): component được render qua `Route` sẽ tự nhận prop `this.props.history`. Gọi `history.push(path)` để chuyển trang:
  ```js
  if (!this.props.auth) {
      this.props.history.push("/");
  }
  ```
- Khi chưa đăng nhập mà vào `/post`: URL đổi sang `/post` trong chốc lát, rồi `componentDidMount` chạy và đẩy user về `/`.
- Hiện đại (React Router v6/v7): không còn `props.history`. Dùng hook `useNavigate()` -> `navigate("/")`, hoặc render `<Navigate to="/" />`. Hook chỉ dùng được trong function component; thay 2 lifecycle bằng `useEffect(..., [auth])` (chạy khi mount và mỗi lần `auth` đổi).

## 75. Creating the HOC

- **Quy ước đặt tên file:** chữ thường đầu (`requireAuth.js`) -> file export default một **function**; chữ hoa đầu (`CommentBox.js`) -> export default một **component/class**.
- **HOC scaffold** (boilerplate gần như mọi HOC đều có):
  ```js
  import React, { Component } from "react";

  export default (ChildComponent) => {
      class ComposedComponent extends Component {
          render() {
              return <ChildComponent />;
          }
      }

      return ComposedComponent;
  };
  ```
  - HOC là một **function**: nhận vào một component (`ChildComponent`), tạo class mới `ComposedComponent` render `ChildComponent`, rồi trả về class mới đó.
- Cách dùng: `export default requireAuth(CommentBox);`
  - File khác `import CommentBox from "components/CommentBox"` sẽ nhận **`ComposedComponent`** (bên trong render `CommentBox`), không phải `CommentBox` gốc.
- Bản chất: HOC **chèn thêm một component cha** ngay phía trên component được bọc trong cây component, giống cách `connect` chèn vào giữa `Route` và `CommentBox`.
- Scaffold một mình chưa tái sử dụng được gì; nó chỉ tạo ra "component cha giả". Giá trị nằm ở việc đặt logic dùng chung vào component cha này (bài 76).
- Một số HOC (như `connect`) có signature khác: gọi 2 lần `connect(config)(Component)`. Cả hai cách đều hợp lệ.

## 76. Placing Reusable Logic

- Bước 3: chuyển **toàn bộ** logic dùng chung từ `CommentBox` sang `ComposedComponent`:
  - `componentDidMount`, `componentDidUpdate`, `shouldNavigateAway`.
  - Cả `mapStateToProps` (cần để biết `auth`). Dễ quên phần này.
- Sau khi cắt `mapStateToProps` khỏi `CommentBox`, đổi tham số đầu của `connect` thành `null`: `connect(null, actions)(...)`.
- Trong file HOC: import `connect`, khai báo `mapStateToProps` sau class, rồi **trả về bản đã connect** của `ComposedComponent`:
  ```js
  function mapStateToProps(state) {
      return { auth: state.auth };
  }

  return connect(mapStateToProps)(ComposedComponent);
  ```
- Kết quả: `ComposedComponent` tự biết đủ mọi thứ (đọc `auth`, kiểm tra khi mount/update, điều hướng) để quyết định có cho xem component con hay không. Component nào cần bảo vệ chỉ việc bọc `requireAuth(...)`, không phải copy code.

## 77. Passing Through Props

- **Vấn đề:** sau khi chèn HOC vào giữa, component con **mất props** từ các component cha phía trên.
  - Cây component: `App` -> `Route` -> `connect` -> **`requireAuth`** -> `CommentBox`.
  - `Route` truyền `history`, `connect` truyền action creators (`saveComment`…) -> tất cả đến `ComposedComponent` chứ **không** tự đến `CommentBox`.
  - Hậu quả: submit comment -> lỗi `saveComment is not a function`.
- **Nguyên nhân gốc:** `ComposedComponent` render `<ChildComponent />` không kèm props nào -> "đứt chuỗi" truyền props.
- **Cách fix:** spread toàn bộ props nhận được xuống component con:
  ```js
  render() {
      return <ChildComponent {...this.props} />;
  }
  ```
  - Vì HOC là component "trung gian" chèn vào, nó có trách nhiệm chuyển nguyên vẹn props từ cha xuống con. Gần như mọi HOC đều có dòng `{...this.props}`.
- Cách bọc khi có cả `connect`: `export default connect(null, actions)(requireAuth(CommentBox));` (chú ý kỹ dấu ngoặc).
- Tổng kết quy trình HOC (bài 73): viết logic vào 1 component -> tạo file + scaffold -> chuyển logic sang HOC -> **luôn pass props xuống**.
- Hiện đại (function component + hook), tương đương bản đang dùng trong project:
  ```js
  const requireAuth = (ChildComponent) => {
      const ComposedComponent = (props) => {
          const navigate = useNavigate();

          useEffect(() => {
              if (!props.auth) navigate("/");
          }, [props.auth, navigate]);

          return <ChildComponent {...props} />;
      };

      return connect((state) => ({ auth: state.auth }))(ComposedComponent);
  };
  ```
