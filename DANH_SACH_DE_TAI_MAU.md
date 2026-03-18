# 📚 DANH SÁCH ĐỀ TÀI MẪU (Dùng để Giảng viên Copy/Paste khi Test)

Dưới đây là 5 mẫu đề tài với phần mô tả được viết cực kỳ chi tiết, chuẩn format của một đồ án tốt nghiệp cấp Đại học. Bạn có thể dùng các tài khoản Giảng viên (từ `gv001` đến `gv010`) để copy thông tin này dán vào form "Tạo đề tài mới".

---

## 💻 ĐỀ TÀI 1: Lĩnh vực Web & Hệ thống
**Tên đề tài:** Xây dựng Hệ thống Quản lý Tour Du lịch và Đặt vé trực tuyến (TravelBooking)
**Danh mục:** Ứng dụng Web
**Số lượng SV:** 2
**Mô tả chi tiết:**
> **1. Mục tiêu đề tài:**
> Thiết kế và xây dựng một nền tảng website cho phép người dùng tìm kiếm, so sánh và đặt các tour du lịch trong và ngoài nước. Hệ thống tích hợp cổng thanh toán trực tuyến và cung cấp công cụ quản trị (CMS) cho các đại lý du lịch.
> 
> **2. Yêu cầu chức năng:**
> - **Module Khách hàng:** Đăng ký/đăng nhập, tìm kiếm tour theo bộ lọc (địa điểm, giá cả, thời gian), xem chi tiết lịch trình, đặt tour, thanh toán online (VNPay/Momo), đánh giá và bình luận.
> - **Module Đại lý/Admin:** Quản lý danh mục tour, quản lý booking, thống kê doanh thu theo tháng/quý, quản lý mã giảm giá (voucher), quản lý phản hồi của khách hàng.
> - **Hệ thống cảnh báo:** Gửi email xác nhận tự động khi đặt tour thành công và nhắc nhở lịch trình trước 24h.
> 
> **3. Yêu cầu công nghệ (Gợi ý):**
> - Frontend: ReactJS, TailwindCSS.
> - Backend: Node.js (Express) hoặc Spring Boot.
> - Database: MongoDB hoặc PostgreSQL.
> - Khác: Redis (Cache), Docker.
> 
> **4. Kết quả cần đạt:**
> Báo cáo đồ án tối thiểu 60 trang. Website hoạt động trơn tru trên cả Desktop và Mobile. Source code được quản lý trên GitHub/GitLab.

---

## 🤖 ĐỀ TÀI 2: Lĩnh vực Trí tuệ nhân tạo (AI)
**Tên đề tài:** Nghiên cứu và ứng dụng Deep Learning trong nhận diện bệnh lý sưng viêm qua ảnh nội soi dạ dày
**Danh mục:** Trí tuệ nhân tạo (AI) / Y tế
**Số lượng SV:** 1
**Mô tả chi tiết:**
> **1. Mục tiêu đề tài:**
> Xây dựng một mô hình Trí tuệ nhân tạo có khả năng phân tích hình ảnh nội soi dạ dày để phát hiện tự động các vùng bị viêm, loét hoặc có khối u bất thường, hỗ trợ bác sĩ trong việc chẩn đoán nhanh và chính xác.
> 
> **2. Yêu cầu chuyên môn:**
> - Thu thập và tiền xử lý (tiền lọc, gán nhãn, augmentation) tập dữ liệu ảnh y tế (khoảng 5000+ ảnh, sử dụng dataset public như Kvasir).
> - Xây dựng và tinh chỉnh mô hình mạng nơ-ron tích chập (CNN), thử nghiệm các kiến trúc như ResNet50, YOLOv8 hoặc EfficientNet.
> - Xây dựng một giao diện Web đơn giản (Python Flask/Streamlit) để bác sĩ upload ảnh nội soi lên và nhận kết quả dự đoán kèm bounding-box khoanh vùng bệnh lý.
> 
> **3. Chỉ tiêu đánh giá:**
> - Độ chính xác (Accuracy), F1-Score của mô hình phải đạt trên 85%.
> - Báo cáo chỉ rõ quá trình training, validation và các đồ thị loss/accuracy.
> 
> **4. Kiến thức yêu cầu:**
> Sinh viên có nền tảng vững về Python, PyTorch/TensorFlow, xử lý ảnh (OpenCV) và Machine Learning.

---

## 📱 ĐỀ TÀI 3: Lĩnh vực Mobile App
**Tên đề tài:** Ứng dụng dọn dẹp nhà cửa theo nhu cầu (Uber for Home Cleaning)
**Danh mục:** Ứng dụng Di động
**Số lượng SV:** 2
**Mô tả chi tiết:**
> **1. Mục tiêu đề tài:**
> Xây dựng một ứng dụng di động kết nối giữa người có nhu cầu dọn dẹp nhà cửa (Khách hàng) và người cung cấp dịch vụ (Cộng tác viên/Người giúp việc). Mô hình hoạt động tương tự ứng dụng gọi xe công nghệ.
> 
> **2. Yêu cầu chức năng:**
> - **App Khách hàng:** Đăng yêu cầu dọn dẹp (chọn theo giờ, diện tích, loại dịch vụ), định vị GPS để tìm CTV gần nhất, thanh toán, đánh giá 5 sao cho CTV.
> - **App Cộng tác viên:** Nhận thông báo "nổ cuốc", xem lộ trình đường đi (Google Maps API), xác nhận hoàn thành công việc, ví điện tử nội bộ để xem thu nhập.
> - **Trang Admin (Web):** Quản lý tỷ lệ chiết khấu, duyệt hồ sơ CTV (CMND/CCCD), giải quyết khiếu nại.
> 
> **3. Yêu cầu công nghệ:**
> - Mobile: Flutter hoặc React Native (code 1 lần chạy cả iOS/Android).
> - Backend: Firebase (Authentication, Realtime Database, Cloud Messaging) hoặc Node.js + Socket.io gán tọa độ thời gian thực.
> 
> **4. Khối lượng công việc:**
> SV1 phụ trách App Khách hàng & Backend. SV2 phụ trách App CTV & Admin Web. Phải Demo được tính năng Real-time (Tài xế nhận cuốc ngay khi khách đặt).

---

## 🔒 ĐỀ TÀI 4: Lĩnh vực An toàn thông tin
**Tên đề tài:** Triển khai hệ thống phát hiện rò rỉ dữ liệu (DLP) và Cảnh báo xâm nhập (IDS) cho mạng nội bộ doanh nghiệp
**Danh mục:** Bảo mật & Mạng
**Số lượng SV:** 1
**Mô tả chi tiết:**
> **1. Mục tiêu đề tài:**
> Nghiên cứu và mô phỏng một môi trường mạng doanh nghiệp nhỏ, thiết lập các giải pháp đánh hơi gói tin, phát hiện các cuộc tấn công mạng và ngăn chặn nhân viên nội bộ rò rỉ dữ liệu nhạy cảm ra ngoài (qua USB, Email, Cloud).
> 
> **2. Yêu cầu chuyên môn:**
> - Giả lập hạ tầng mạng trên VMware/GNS3 gồm các phân vùng VLAN: Server, HR, IT.
> - Cài đặt và cấu hình Snort/Suricata làm hệ thống IDS/IPS.
> - Viết các luật (Rules) tùy biến để phát hiện các cuộc tấn công cơ bản: DDoS, SQL Injection, Port Scan.
> - Thiết lập Wazuh (SIEM) để thu thập log từ thẻ các máy trạm và vẽ biểu đồ cảnh báo.
> 
> **3. Kịch bản Demo khi bảo vệ:**
> Sinh viên sẽ đóng vai Hacker thực hiện tấn công (dùng Kali Linux) và chứng minh hệ thống IDS ngay lập tức bắt được gói tin, phát chuông cảnh báo tới Telegram của Quản trị viên.
> 
> **4. Yêu cầu đối với sinh viên:**
> Am hiểu về mạng máy tính (TCP/IP), hệ điều hành Linux và có kiến thức về SOC/Blue Team.

---

## 🏢 ĐỀ TÀI 5: Lĩnh vực Quản trị doanh nghiệp (ERP)
**Tên đề tài:** Xây dựng phần mềm Quản lý Kho bãi và Chuỗi cung ứng tích hợp QR Code
**Danh mục:** Hệ thống thông tin / Web
**Số lượng SV:** 2
**Mô tả chi tiết:**
> **1. Mục tiêu đề tài:**
> Chuyển đổi số quy trình quản lý kho thủ công của một xưởng sản xuất. Thay vì ghi chép sổ sách, hệ thống sử dụng camera điện thoại/máy quét để scan mã QR khi nhập/xuất kho.
> 
> **2. Yêu cầu chức năng:**
> - **Quản lý Hàng hóa:** Tự động sinh mã QR cho mỗi lô hàng mới. Quản lý hạn sử dụng (cảnh báo hàng sắp hết hạn/tồn kho lâu ngày).
> - **Nghiệp vụ Kho:** Quét QR để làm phiếu Nhập kho, Xuất kho, Chuyển kho nội bộ. Tự động cộng trừ số lượng tồn kho theo thời gian thực.
> - **Báo cáo:** Biểu đồ xuất-nhập-tồn theo tuần/tháng. Xuất báo cáo ra định dạng Excel/PDF.
> 
> **3. Yêu cầu công nghệ:**
> - Frontend: Vue.js hoặc Angular. Có giao diện Responsive tốt trên trình duyệt Mobile để thủ kho dễ cầm điện thoại đi scan quét mã.
> - Backend: C# .NET Core hoặc Node.js.
> - Thư viện: Sử dụng các thư viện tạo/đọc mã QR code ở Frontend.
> 
> **4. Kết quả cần đạt:**
> Sản phẩm phải hoạt động được nghiệp vụ quét camera thực tế. Đồ án đánh giá cao tư duy thiết kế Database (chuẩn hóa dữ liệu) và kiến trúc phần mềm.

---

## 🏛️ ĐỀ TÀI HỆ THỐNG (ADMIN) 1: Lĩnh vực Giáo dục trực tuyến
**Tên đề tài:** Xây dựng nền tảng học trực tuyến (E-Learning) tích hợp Trợ lý ảo AI giải đáp thắc mắc
**Danh mục:** Phát triển Ứng dụng Web
**Số lượng SV:** 2
**Mô tả chi tiết:**
> **1. Mục tiêu đề tài:**
> Xây dựng một hệ thống E-Learning toàn diện cho phép trường học quản lý các khoá học, sinh viên và bài giảng. Điểm nổi bật là việc tích hợp một trợ lý ảo (Chatbot) AI dựa trên mô hình ngôn ngữ lớn (LLM) để tự động trả lời câu hỏi của sinh viên dựa trên tài liệu học tập.
> 
> **2. Yêu cầu chức năng:**
> - **Sinh viên:** Đăng ký khoá học, xem video bài giảng, làm bài trắc nghiệm, nhận chứng chỉ. Chat với AI Assistant để hỏi bài ngay trong lớp học.
> - **Giảng viên:** Upload tài liệu (PDF, Video), tạo ngân hàng câu hỏi, chấm điểm tự luận.
> - **Quản trị viên (Admin):** Quản lý thu chi, cấp phát tài khoản, kiểm duyệt khoá học xuất bản.
>
> **3. Yêu cầu công nghệ:**
> - Frontend: Next.js/React.
> - Backend: Node.js/Express, Python (FastAPI cho AI).
> - Database: MongoDB hoặc MySQL.
> - AI Model: OpenAI API hoặc mô hình mã nguồn mở như LLaMA tích hợp RAG (Retrieval-Augmented Generation) để đọc file PDF.

---

## 🏛️ ĐỀ TÀI HỆ THỐNG (ADMIN) 2: Lĩnh vực Blockchain & Fintech
**Tên đề tài:** Hệ thống quản lý và cấp phát văn bằng đại học sử dụng công nghệ Blockchain
**Danh mục:** Blockchain & Mật mã học
**Số lượng SV:** 2
**Mô tả chi tiết:**
> **1. Mục tiêu đề tài:**
> Đề xuất giải pháp chống làm giả bằng cấp đại học bằng cách lưu trữ mã băm (hash) của văn bằng trên mạng lưới Blockchain. Công ty tuyển dụng có thể tự quét mã QR trên bằng để kiểm chứng độ xác thực 100%.
> 
> **2. Yêu cầu chức năng:**
> - **Trường đại học:** Ký số và phát hành bằng cấp, bảng điểm lên mạng lưới IPFS và Smart Contract.
> - **Sinh viên:** Nhận bằng dưới dạng số (NFT/Soulbound Token), quản lý ví điện tử cá nhân (Metamask).
> - **Nhà tuyển dụng/Bên thứ 3:** Upload file ảnh quét bằng cấp hoặc nhập mã số định danh để hệ thống Blockchain đối chiếu tính hợp lệ.
>
> **3. Yêu cầu công nghệ:**
> - Ngôn ngữ Hợp đồng thông minh: Solidity.
> - Mạng lưới (Network): Ethereum (Testnet Sepolia) hoặc Binance Smart Chain (BSC).
> - Web App: ReactJS kết hợp thư viện Web3.js / Ethers.js.
> - Database truyền thống: PostgreSQL (lưu chi tiết sinh viên không cần đưa lên chuỗi).
