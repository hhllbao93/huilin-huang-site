import EditableGroup from "../editor/EditableGroup";
import EditableBlock from "../editor/EditableBlock";
import EditableText from "../editor/EditableText";
import { useSyncExternalStore } from "react";
import { getSnapshot, subscribe } from "../editor/content-store";
import { useSearchParams } from "react-router-dom";
import { FiArrowUpRight, FiSearch } from "react-icons/fi";
import { publications as originalPublications } from "../data/publications";
import cv from "../assets/Huilin_Huang_CV.pdf";
import "./Publications.css";

export default function Publications() {
  const { content } = useSyncExternalStore(subscribe, getSnapshot);
  const publications = originalPublications.map((p, index) => ({
    ...p,
    editKey: `publications.${index}`,
    title: content[`publications.${index}.title`] ?? p.title,
    authors: content[`publications.${index}.authors`] ?? p.authors,
    journal: content[`publications.${index}.journal`] ?? p.journal,
  }));
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const status = params.get("status") || "All";
  const year = params.get("year") || "All";
  const years = [
    ...new Set(publications.map((p) => p.year).filter(Boolean)),
  ].sort((a, b) => b - a);
  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === "All") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };
  const statusGroups = {
  Published: ["Published"],
  "In Press": ["Accepted", "In press", "In Press"],
  "In Review": ["Submitted", "In review", "In Review", "Preprint"],
  };
  const filtered = publications
    .filter(
      (p) =>
        (status === "All" || statusGroups[status]?.includes(p.status)) &&
        (year === "All" || String(p.year) === year) &&
        (p.title + p.authors + p.journal)
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => (b.year || 0) - (a.year || 0));
  return (
    <div className="container inner-page">
      <header className="page-intro">
        <span className="eyebrow"><EditableText contentKey="Publications.text001" /></span>
        <EditableGroup groupKey="Publications.group19">
<EditableBlock as="h1" blockKey="Publications.Publications.text002"><EditableText contentKey="Publications.text002" /><br /><EditableText contentKey="Publications.text003" /></EditableBlock>
        <EditableBlock as="p" blockKey="Publications.Publications.text004"><EditableText contentKey="Publications.text004" /></EditableBlock>
</EditableGroup>
      </header>
      <div className="publication-toolbar">
        <label className="search-field">
          <FiSearch aria-hidden="true" />
          <span className="sr-only"><EditableText contentKey="Publications.text005" /></span>
          <input
            type="search"
            value={query}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Search title, author, or journal…"
          />
        </label>
        <label className="year-filter"><EditableText contentKey="Publications.text006" /><select
            aria-label="Publication year"
            value={year}
            onChange={(e) => update("year", e.target.value)}
          >
            <option value="All">All years</option>
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </label>
        <a
          className="text-link"
          href={cv}
          download="Huilin_Huang_CV_Dec2025.pdf"
        ><EditableText contentKey="Publications.text008" /></a>
      </div>
      <div
        className="publication-filters"
        role="group"
        aria-label="Filter by publication status"
      >
        {["All", "Published", "In Press", "In Review"].map((s) => (
          <button
            key={s}
            aria-pressed={status === s}
            className={status === s ? "filter active" : "filter"}
            onClick={() => update("status", s)}
          >
            {s}
          </button>
        ))}
      </div>
      <p className="results-count" role="status">
        {filtered.length}{" "}
        {filtered.length === 1 ? "publication" : "publications"}
      </p>
      <div className="publication-list">
        {filtered.map((p) => (
          <article className="publication" key={p.editKey}>
            <div className="publication-year">
              {p.year || "Manuscript"}
              <span className="tag">
                {["Accepted", "In press", "In Press"].includes(p.status)
                  ? "In Press"
                  : ["Submitted", "In review", "In Review", "Preprint"].includes(p.status)
                    ? "In Review"
                    : p.status}
              </span>
            </div>
            <div>
              <span className="publication-journal">
                <EditableText contentKey={`${p.editKey}.journal`}>{p.journal || "Work in progress"}</EditableText>
              </span>
              <EditableBlock as="h2" blockKey={`Publications.${p.editKey}.title`}>
                {p.doi ? (
                  <a
                    href={"https://doi.org/" + p.doi}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {<EditableText contentKey={`${p.editKey}.title`}>{p.title}</EditableText>}{" "}
                    <FiArrowUpRight aria-label="Opens article in a new tab" />
                  </a>
                ) : (
                  <EditableText contentKey={`${p.editKey}.title`}>{p.title}</EditableText>
                )}
              </EditableBlock>
              <EditableBlock as="p" blockKey={`Publications.${p.editKey}.authors`}>{<EditableText contentKey={`${p.editKey}.authors`}>{p.authors}</EditableText>}</EditableBlock>
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="empty-state">
          <EditableGroup groupKey="Publications.group20">
<EditableBlock as="h2" blockKey="Publications.Publications.text009"><EditableText contentKey="Publications.text009" /></EditableBlock>
          <EditableBlock as="p" blockKey="Publications.Publications.text010"><EditableText contentKey="Publications.text010" /></EditableBlock>
</EditableGroup>
          <button className="button" onClick={() => setParams({})}><EditableText contentKey="Publications.text011" /></button>
        </div>
      )}
    </div>
  );
}
