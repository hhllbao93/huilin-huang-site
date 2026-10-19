import EditableBlock from "../editor/EditableBlock";
import EditableText from "../editor/EditableText";
import { Link } from "react-router-dom";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import portrait from "../assets/Huilin.jpeg";
import cv from "../assets/Huilin_Huang_CV.pdf";
import { themes } from "../data/research";
import "./Home.css";

export default function Home() {
  return (
    <>
      <section className="container hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" /><EditableText contentKey="Home.text001" /></span>
          <EditableBlock as="h1" blockKey="Home.Home.text002"><EditableText contentKey="Home.text002" /><br /><EditableText contentKey="Home.text003" /><br /><EditableText contentKey="Home.text004" /><em><EditableText contentKey="Home.text005" /></em>.
            <br />
          </EditableBlock>
          <EditableBlock as="p" blockKey="Home.Home.text006"><EditableText contentKey="Home.text006" /></EditableBlock>
          <Link to="/research" className="button"><EditableText contentKey="Home.text007" /><FiArrowUpRight />
          </Link>
          <div className="hero-footnote">
            <span><EditableText contentKey="Home.text008" /></span>
            <span><EditableText contentKey="Home.text009" /></span>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="/fire-landscape.jpg"
            alt="Flames illuminating a landscape at night"
            fetchPriority="high"
          />
          <div className="image-topline">
            <span><EditableText contentKey="Home.text010" /></span>
            <span aria-hidden="true">↗</span>
          </div>
          <div className="image-caption">
            <span className="image-caption-line" />
            <EditableBlock as="p" blockKey="Home.Home.text011"><EditableText contentKey="Home.text011" /><br /><EditableText contentKey="Home.text012" /></EditableBlock>
            <span><EditableText contentKey="Home.text013" /></span>
          </div>
        </div>
      </section>
      <div className="research-strip">
        <div className="container">
          <span><EditableText contentKey="Home.text014" /></span>
          <span><EditableText contentKey="Home.text015" /></span>
          <span className="strip-star" aria-hidden="true">
            ✳
          </span>
          <span><EditableText contentKey="Home.text016" /></span>
          <span className="strip-star" aria-hidden="true">
            ✳
          </span>
          <span><EditableText contentKey="Home.text017" /></span>
        </div>
      </div>
      <section className="container section research-overview">
        <div className="section-heading">
          <div>
            <span className="eyebrow"><EditableText contentKey="Home.text018" /></span>
            <EditableBlock as="h2" blockKey="Home.Home.text019"><EditableText contentKey="Home.text019" /><br /><EditableText contentKey="Home.text020" /></EditableBlock>
          </div>
          <EditableBlock as="p" blockKey="Home.Home.text021"><EditableText contentKey="Home.text021" /></EditableBlock>
        </div>
        <div className="theme-grid">
          {themes.map((theme, index) => (
            <Link
              to={"/research#" + theme.id}
              className="theme-card"
              key={theme.id}
            >
              <div className="theme-top">
                <span>0{index + 1}</span>
                <FiArrowUpRight />
              </div>
              <EditableBlock as="h3" blockKey={`Home.themes.${theme.id}.title`}>{<EditableText contentKey={`themes.${theme.id}.title`}>{theme.title}</EditableText>}</EditableBlock>
              <EditableBlock as="p" blockKey={`Home.themes.${theme.id}.short`}>{<EditableText contentKey={`themes.${theme.id}.short`}>{theme.short}</EditableText>}</EditableBlock>
              <span className="theme-bottom"><EditableText contentKey="Home.text022" /><FiArrowRight />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="profile-section">
        <div className="container profile-grid">
          <div className="profile-image">
            <img src={portrait} alt="Dr. Huilin Huang" loading="lazy" />
            <span><EditableText contentKey="Home.text023" /></span>
          </div>
          <div className="profile-copy">
            <span className="eyebrow"><EditableText contentKey="Home.text024" /></span>
            <EditableBlock as="h2" blockKey="Home.Home.text025"><EditableText contentKey="Home.text025" /><br /><EditableText contentKey="Home.text026" /></EditableBlock>
            <EditableBlock as="p" blockKey="Home.Home.text027" className="profile-role">
              Dr. Huilin Huang{" "}
              <span><EditableText contentKey="Home.text027" /></span>
            </EditableBlock>
            <EditableBlock as="p" blockKey="Home.Home.text028"><EditableText contentKey="Home.text028" /></EditableBlock>
            <EditableBlock as="p" blockKey="Home.Home.text029"><EditableText contentKey="Home.text029" /></EditableBlock>
            <div className="profile-actions">
              <Link className="text-link" to="/ourteam"><EditableText contentKey="Home.text030" /><FiArrowUpRight />
              </Link>
              <a
                className="text-link"
                href={cv}
                download="Huilin_Huang_CV_Dec2025.pdf"
              ><EditableText contentKey="Home.text031" /><span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow"><EditableText contentKey="Home.text032" /></span>
            <EditableBlock as="h2" blockKey="Home.Home.text033"><EditableText contentKey="Home.text033" /></EditableBlock>
          </div>
          <Link className="text-link" to="/publications"><EditableText contentKey="Home.text034" /><FiArrowUpRight />
          </Link>
        </div>
        <Link to="/publications?q=canopy" className="featured-paper">
          <span className="paper-meta"><EditableText contentKey="Home.text035" /><span>2025</span>
          </span>
          <EditableBlock as="h3" blockKey="Home.Home.text036"><EditableText contentKey="Home.text036" /></EditableBlock>
          <FiArrowUpRight aria-hidden="true" />
        </Link>
        <Link to="/publications?q=ML4Fire" className="featured-paper">
          <span className="paper-meta"><EditableText contentKey="Home.text037" /><span>2025</span>
          </span>
          <EditableBlock as="h3" blockKey="Home.Home.text038"><EditableText contentKey="Home.text038" /></EditableBlock>
          <FiArrowUpRight aria-hidden="true" />
        </Link>
        <div className="join-band">
          <div>
            <span className="eyebrow"><EditableText contentKey="Home.text039" /></span>
            <EditableBlock as="h2" blockKey="Home.Home.text040"><EditableText contentKey="Home.text040" /></EditableBlock>
            <EditableBlock as="p" blockKey="Home.Home.text041"><EditableText contentKey="Home.text041" /></EditableBlock>
          </div>
          <Link className="button" to="/opportunities"><EditableText contentKey="Home.text042" /><FiArrowUpRight />
          </Link>
        </div>
      </section>
    </>
  );
}
