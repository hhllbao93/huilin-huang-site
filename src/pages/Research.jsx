import EditableBlock from "../editor/EditableBlock";
import EditableText from "../editor/EditableText";
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { themes } from "../data/research";
import "./Research.css";

export default function Research() {
  return (
    <div className="container inner-page">
      <header className="page-intro">
        <span className="eyebrow"><EditableText contentKey="Research.text001" /></span>
        <EditableBlock as="h1" blockKey="Research.Research.text002"><EditableText contentKey="Research.text002" /><br /><EditableText contentKey="Research.text003" /></EditableBlock>
        <EditableBlock as="p" blockKey="Research.Research.text004"><EditableText contentKey="Research.text004" /></EditableBlock>
      </header>
      <div className="research-methods">
        <span className="eyebrow"><EditableText contentKey="Research.text005" /></span>
        <EditableBlock as="p" blockKey="Research.Research.text006"><EditableText contentKey="Research.text006" /><br /><EditableText contentKey="Research.text007" /><br />
          <em><EditableText contentKey="Research.text008" /></em>
        </EditableBlock>
        <div className="tags">
          <span className="tag"><EditableText contentKey="Research.text009" /></span>
          <span className="tag"><EditableText contentKey="Research.text010" /></span>
          <span className="tag"><EditableText contentKey="Research.text011" /></span>
        </div>
      </div>
      {themes.map((theme, index) => (
        <section id={theme.id} className="research-detail" key={theme.id}>
          <span className="research-number">0{index + 1}</span>
          <div>
            <EditableBlock as="h2" blockKey={`Research.themes.${theme.id}.title`}>{<EditableText contentKey={`themes.${theme.id}.title`}>{theme.title}</EditableText>}</EditableBlock>
            <EditableBlock as="p" blockKey={`Research.themes.${theme.id}.description`}>{<EditableText contentKey={`themes.${theme.id}.description`}>{theme.description}</EditableText>}</EditableBlock>
            <div className="tags">
              {theme.methods.map((method, methodIndex) => (
                <span className="tag" key={methodIndex}>
                  {<EditableText contentKey={`themes.${theme.id}.methods.${methodIndex}`}>{method}</EditableText>}
                </span>
              ))}
            </div>
          </div>
          <aside>
            <span className="eyebrow"><EditableText contentKey="Research.text012" /></span>
            <EditableBlock as="p" blockKey={`Research.themes.${theme.id}.example`}>{<EditableText contentKey={`themes.${theme.id}.example`}>{theme.example}</EditableText>}</EditableBlock>
            <Link className="text-link" to="/publications"><EditableText contentKey="Research.text013" /><FiArrowUpRight />
            </Link>
          </aside>
        </section>
      ))}
      <section className="research-projects">
        <span className="eyebrow"><EditableText contentKey="Research.text014" /></span>
        <EditableBlock as="h2" blockKey="Research.Research.text015"><EditableText contentKey="Research.text015" /></EditableBlock>
        <EditableBlock as="p" blockKey="Research.Research.text016" className="note"><EditableText contentKey="Research.text016" /></EditableBlock>
        <div className="row-list">
          <div className="detail-row">
            <span className="detail-year">2026–2028</span>
            <div>
              <EditableBlock as="h3" blockKey="Research.Research.text017"><EditableText contentKey="Research.text017" /></EditableBlock>
              <EditableBlock as="p" blockKey="Research.Research.text018"><EditableText contentKey="Research.text018" /></EditableBlock>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-year">2026–2028</span>
            <div>
              <EditableBlock as="h3" blockKey="Research.Research.text019"><EditableText contentKey="Research.text019" /></EditableBlock>
              <EditableBlock as="p" blockKey="Research.Research.text020"><EditableText contentKey="Research.text020" /></EditableBlock>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-year"><EditableText contentKey="Research.text021" /></span>
            <div>
              <EditableBlock as="h3" blockKey="Research.Research.text022"><EditableText contentKey="Research.text022" /></EditableBlock>
              <EditableBlock as="p" blockKey="Research.Research.text023"><EditableText contentKey="Research.text023" /></EditableBlock>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
