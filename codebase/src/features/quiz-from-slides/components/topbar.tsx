import { ArrowLeft, Moon, Sun } from "@phosphor-icons/react";
import { lesson } from "../data/lesson-fixture";
import type { DemoState } from "../model/types";

type TopbarProps = {
  state: DemoState;
  materialName: string;
  lectureId: string;
  onBack: () => void;
  onToggleLanguage: () => void;
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
  onToggleTheme,
  onToggleProfile,
  onCloseProfile,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-leading">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Quay lại" title="Quay lại">
          <ArrowLeft size={18} />
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
        <button
          className="locale-button"
          type="button"
          onClick={onToggleLanguage}
          aria-label={state.language === "vi" ? "Chuyển sang tiếng Anh" : "Switch to Vietnamese"}
          title={state.language === "vi" ? "Chuyển sang tiếng Anh" : "Switch to Vietnamese"}
        >
          {state.language === "vi" ? "VI" : "EN"}
        </button>
        <button className="icon-button" type="button" onClick={onToggleTheme} aria-label="Đổi giao diện">
          {state.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
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
