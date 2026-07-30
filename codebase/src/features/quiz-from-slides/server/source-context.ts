type SourceContext = {
  title: string;
  text: string;
  extractionMode: "controlled_excerpt";
};

const dayOneContext = `
[slide 7] Attention giúp mô hình xác định những token nào liên quan với nhau trong ngữ cảnh đang xử lý.
[slide 11] Context window giới hạn lượng token mô hình có thể tiếp nhận trong một lượt.
[slide 15] Với output có cost-of-error cao, cần thêm bước kiểm tra hoặc phê duyệt của con người.
[slide 17] Grounding cho phép truy ngược một nội dung về nguồn mà hệ thống đã sử dụng.
[slide 20] LLM tạo output theo xác suất nên câu trả lời nghe hợp lý chưa chắc đã đúng.
[slide 24] Tool phù hợp với phép tính hoặc thao tác cần kết quả xác định, thay vì để LLM tự đoán.
`.trim();

const dayTwoContext = `
[slide 4] Công nghệ nên bắt đầu từ một vấn đề cụ thể, không bắt đầu từ áp lực phải có AI.
[slide 6] Khi yêu cầu còn mơ hồ, hãy bóc tách thành vài lựa chọn cụ thể và xác minh lại với stakeholder.
[slide 9] Product manager tìm bài toán và cơ hội đáng làm; project manager tập trung tiến độ, nguồn lực và ngân sách.
[slide 12] Product thinking luôn hỏi sản phẩm được xây cho ai và họ có thực sự cần nó hay không.
[slide 18] Core job phải mô tả tiến bộ người dùng muốn đạt được, không gắn sẵn tên giải pháp.
[slide 23] Nên so sánh các ứng viên theo số người gặp, tần suất, tổn thất mỗi lần và tính khả thi.
`.trim();

export function getControlledSourceContext(fileName: string): SourceContext | null {
  if (fileName === "d1-slide-hackathon.pdf") {
    return {
      title: "Day 1 - AI và LLM Foundation",
      text: dayOneContext,
      extractionMode: "controlled_excerpt",
    };
  }

  if (fileName === "d2-slide-hackathon.pdf") {
    return {
      title: "Day 2 - Xác định bài toán cho AI",
      text: dayTwoContext,
      extractionMode: "controlled_excerpt",
    };
  }

  return null;
}
