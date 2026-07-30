import { AppHeader } from "@/components/shell/app-header";
import { CourseSidebar } from "@/components/shell/course-sidebar";
import { PdfViewer } from "@/components/shell/pdf-viewer";
import { TutorChat } from "@/features/quiz-from-slides/components/tutor-chat";

export default function StudyWorkspacePage() {
  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden">
      <AppHeader />
      <div className="flex min-h-0 flex-1">
        <CourseSidebar />
        <PdfViewer />
        <TutorChat />
      </div>
    </div>
  );
}
