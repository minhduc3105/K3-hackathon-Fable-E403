import type { SlideCatalogEntry } from "../model/types";

type SourceCatalogProps = {
  files: SlideCatalogEntry[];
  onSelect: (fileName: string) => void;
  activeFileName?: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${kilobytes.toFixed(1)} KB`;
  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

export function SourceCatalog({ files, onSelect, activeFileName }: SourceCatalogProps) {
  if (!files.length) return null;

  return (
    <section className="source-catalog" aria-label="Nguồn dữ liệu thật">
      <div className="source-catalog-header">
        <strong>Nguồn dữ liệu thật</strong>
        <span>{files.length} file trong data/vlearn-pack/slides</span>
      </div>
      <div className="source-catalog-list">
        {files.map((file) => (
          <button
            key={file.relativePath}
            type="button"
            className={`source-catalog-item ${activeFileName === file.fileName ? "is-current" : ""}`}
            onClick={() => onSelect(file.fileName)}
          >
            <span className="source-catalog-dot" aria-hidden="true" />
            <span>
              <strong>{file.fileName}</strong>
              <small>
                {file.pageCount} trang · {formatBytes(file.sizeBytes)}
              </small>
            </span>
            {activeFileName === file.fileName ? <span>✓</span> : null}
          </button>
        ))}
      </div>
    </section>
  );
}
