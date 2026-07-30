import { lesson } from "../data/lesson-fixture";
import type { DemoState } from "../model/types";

type TopbarProps = {
  state: DemoState;
  materialName: string;
  lectureId: string;
  onBack: () => void;
  onToggleLanguage: () => void;
  onSelectLanguage: () => void;
  onToggleTheme: () => void;
  onToggleProfile: () => void;
  onCloseProfile: () => void;
};

export function Topbar({
  state,
  materialName,
  lectureId,
  onBack,
  onToggleLanguage,
  onSelectLanguage,
  onToggleTheme,
  onToggleProfile,
  onCloseProfile,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-leading">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Quay lại">
          ‹
        </button>
        <div className="brand-lockup">
          <span className="brand-mark">V</span>
          <span>VLearn</span>
        </div>
        <div className="file-context">
          <strong>{materialName}</strong>
          <span>
            {lesson.courseCode} · {lectureId}
          </span>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="popover-anchor">
          <button className="locale-button" type="button" onClick={onToggleLanguage} aria-expanded={state.languageMenuOpen}>
            VI
          </button>
          {state.languageMenuOpen ? (
            <div className="topbar-popover language-popover">
              <button type="button" onClick={onSelectLanguage}>
                Tiếng Việt <span>Đang dùng</span>
              </button>
            </div>
          ) : null}
        </div>
        <button className="icon-button" type="button" onClick={onToggleTheme} aria-label="Đổi giao diện">
          {state.theme === "dark" ? "☀" : "◐"}
        </button>
        <div className="popover-anchor">
          <button className="avatar-label" type="button" onClick={onToggleProfile} aria-expanded={state.profileOpen}>
            <span className="avatar" aria-hidden="true">
              AN
            </span>
            <span>Sinh viên ẩn danh</span>
          </button>
          {state.profileOpen ? (
            <div className="topbar-popover profile-popover">
              <strong>Sinh viên ẩn danh</strong>
              <span>
                {lesson.courseCode} · Đang học
              </span>
              <button type="button" onClick={onCloseProfile}>
                Đóng
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
