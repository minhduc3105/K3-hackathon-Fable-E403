import { loadSlideCatalog } from "@/features/quiz-from-slides/server/load-slide-catalog";
import { lesson } from "@/features/quiz-from-slides/data/lesson-fixture";
import { VLearnWorkbench } from "@/features/quiz-from-slides/components/workbench";

type ReaderPageProps = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

export default async function ReaderPage(props: ReaderPageProps) {
  const [params, searchParams, slideCatalog] = await Promise.all([
    props.params,
    props.searchParams,
    loadSlideCatalog(),
  ]);

  const lectureId = readParam(searchParams.lectureId, lesson.lectureId);
  const materialId = readParam(searchParams.materialId, "day05-requirements");

  return (
    <VLearnWorkbench
      courseId={params.courseId}
      lectureId={lectureId}
      materialId={materialId}
      slideCatalog={slideCatalog}
    />
  );
}
