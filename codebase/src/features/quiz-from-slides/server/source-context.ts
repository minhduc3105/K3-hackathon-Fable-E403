type SourceContext = {
  title: string;
  text: string;
  extractionMode: "controlled_excerpt";
};

const dayOneContext = `
[slide 3] AI là chiếc ô lớn nhất; machine learning học từ dữ liệu, deep learning dùng mạng nơ-ron nhiều tầng, generative AI sinh nội dung mới và LLM là model nền chuyên ngôn ngữ.
[slide 4] Discriminative AI giỏi phân loại hoặc dự đoán; Generative AI sinh nội dung mới; Agentic AI nhận mục tiêu rồi lập kế hoạch, dùng công cụ và hành động.
[slide 5] Lịch sử AI 70 năm trải qua hai lần mùa đông AI và chuyển từ model đơn lẻ sang hệ thống có khả năng hành động như agent.
[slide 6] Lịch sử AI - 1980: hệ chuyên gia chuyển trọng tâm từ trí tuệ tổng quát sang giải thật tốt một miền chuyên môn hẹp.
[slide 6] Lịch sử AI - 1980: hệ chuyên gia mã hóa tri thức của chuyên gia thành các luật xử lý.
[slide 7] Lịch sử AI - 2009: Fei-Fei Li chọn xây dựng bộ dữ liệu lớn hơn thay vì chỉ chạy theo thuật toán thông minh hơn.
[slide 7] Lịch sử AI - 2009: ImageNet có 14 triệu ảnh được gán nhãn thủ công và hơn 20.000 loại vật.
[slide 7] Lịch sử AI - 2012: ImageNet trở thành sân khấu cho bước đột phá của AlexNet.
[slide 7] Lịch sử AI cho thấy đôi khi dữ liệu tốt hơn có thể đánh bại thuật toán khôn hơn.
[slide 8] Lịch sử AI - 2017: Transformer giúp mô hình hiểu ngôn ngữ linh hoạt hơn.
[slide 8] Lịch sử AI - 2017: Transformer cho phép mỗi từ nhìn sang những từ quan trọng khác trong cả câu thay vì chỉ xử lý tuần tự.
[slide 8] Lịch sử AI - 2017: Transformer trở thành nền móng kỹ thuật cho GPT, BERT và làn sóng LLM.
[slide 9] Lịch sử AI - 2022: ChatGPT lần đầu giúp đông đảo người dùng phổ thông trực tiếp tiếp cận một mô hình ngôn ngữ mạnh.
[slide 9] Lịch sử AI - 2022: giao diện đơn giản của ChatGPT giúp trải nghiệm sử dụng mô hình ngôn ngữ trở nên dễ tiếp cận.
[slide 10] LLM là mô hình ngôn ngữ lớn, thường dựa trên Transformer và được luyện để dự đoán token tiếp theo trong ngữ cảnh; chatbot chỉ là một sản phẩm đóng gói quanh model.
[slide 11] Với mỗi ngữ cảnh, Transformer chấm điểm các token trong từ vựng rồi chọn token tiếp theo theo phân bố xác suất.
[slide 12] Sinh văn bản là vòng lặp dự đoán token, nối token vào câu rồi chạy lại với ngữ cảnh mới.
[slide 13] Model không đọc từ nguyên vẹn mà đọc các mảnh chữ gọi là token; tiếng Việt, code và JSON thường tốn nhiều token hơn.
[slide 14] Context window giới hạn lượng token mô hình có thể tiếp nhận trong một lượt; context dài hơn vừa tốn tiền, vừa chậm và dễ bỏ sót thông tin ở giữa.
[slide 15] Attention cho phép mỗi token nhìn lại các token khác, chấm điểm mức độ liên quan và xác định nghĩa theo ngữ cảnh.
[slide 16] Quản lý context là quản lý sự chú ý: đặt điều quan trọng ở đầu hoặc cuối, giữ context sạch và chỉ đưa phần tài liệu liên quan vào.
[slide 18] LLM được tạo qua pre-training, supervised fine-tuning, RLHF hoặc DPO và các bước luyện suy luận có đáp án kiểm chứng.
[slide 20] LLM có knowledge cutoff, có thể tự tin nhưng sai và có giới hạn context; vì vậy cần prompt tốt, RAG, tools và kiểm chứng.
[slide 23] Agent không phải một loại model khác mà là LLM được đặt vào vòng làm việc có mục tiêu, công cụ, kế hoạch và khả năng hành động.
[slide 24] Một agent gồm Goal, Reasoning, Tools, Memory và Action, vận hành theo vòng lặp quan sát kết quả rồi tiếp tục.
[slide 27] Chi phí một lần gọi model gồm input token và output token; output thường đắt hơn vì model phải sinh từng token.
[slide 28] Một prompt đầy đủ gồm system instruction, user input, context bổ sung và định dạng output mong muốn.
[slide 29] Temperature và top_p thay đổi cách model chọn token nhưng không làm model thông minh hơn.
`.trim();

const dayTwoContext = `
[slide 4] Double Diamond phân kỳ để khám phá vấn đề rồi hội tụ để định nghĩa và lựa chọn dựa trên dữ liệu.
[slide 5] Lộ trình phù hợp là đi từ bài toán, quy trình vận hành và chỉ số đo lường đến giải pháp AI, không bắt đầu từ áp lực phải có AI.
[slide 6] Có thể tìm bài toán AI từ tác vụ lặp lại, phần việc tốn thời gian, lợi thế xử lý của AI và điểm đau của người dùng.
[slide 7] Các anti-pattern gồm ưu tiên giải pháp quá sớm, không có baseline, bỏ qua evaluation và không xác định ranh giới con người phê duyệt.
[slide 9] Product manager tìm bài toán và cơ hội đáng làm; project manager tập trung vào tiến độ, nguồn lực và ngân sách.
[slide 11] Điểm đau cần được định lượng bằng baseline, target và cách measurement cụ thể.
[slide 12] Product thinking luôn hỏi sản phẩm được xây cho ai và người đó có thực sự cần nó hay không.
[slide 15] AI không phù hợp khi cần tính dự đoán tuyệt đối, thông tin tĩnh, lỗi quá tốn kém, minh bạch tuyệt đối hoặc người dùng muốn tự làm.
[slide 16] Một hệ thống AI thực tế gồm Model, Context, Planning và Tools; model chỉ là một thành phần.
[slide 17] Automation để AI làm thay, còn Augmentation để AI hỗ trợ con người; lựa chọn phải dựa trên từng tác vụ.
[slide 18] Rule phù hợp với logic ổn định, LLM workflow phù hợp với đầu vào đa dạng và Agent phù hợp với quy trình nhiều bước có công cụ.
[slide 22] Reward function quyết định dự đoán nào là đúng hoặc sai và cần được thiết kế phối hợp giữa UX, Product và Engineering.
[slide 24] Tiêu chí thành công tốt phải có chỉ số cụ thể, ngưỡng có ý nghĩa và hành động cụ thể khi vượt ngưỡng.
[slide 25] Khoảng cách từ demo đến production đòi hỏi baseline, evaluation, controls và quy trình vận hành liên tục.
[slide 26] Problem Statement rõ ràng là đầu vào để xây test cases, chỉ số hiệu năng và điều kiện chuyển sang con người phê duyệt.
[slide 29] Sáu nguyên tắc cốt lõi nhấn mạnh Problem Statement rõ, workflow được mô hình hóa, pain point được lượng hóa và quyết định dựa trên lập luận thực tế.
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
