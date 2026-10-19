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
        <h1><EditableText contentKey="Research.text002" /><br /><EditableText contentKey="Research.text003" /></h1>
        <p><EditableText contentKey="Research.text004" /></p>
      </header>
      <div className="research-methods">
        <span className="eyebrow"><EditableText contentKey="Research.text005" /></span>
        <p><EditableText contentKey="Research.text006" /><br /><EditableText contentKey="Research.text007" /><br />
          <em><EditableText contentKey="Research.text008" /></em>
        </p>
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
            <h2>{<EditableText contentKey={`themes.${theme.id}.title`}>{theme.title}</EditableText>}</h2>
            <p>{<EditableText contentKey={`themes.${theme.id}.description`}>{theme.description}</EditableText>}</p>
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
            <p>{<EditableText contentKey={`themes.${theme.id}.example`}>{theme.example}</EditableText>}</p>
            <Link className="text-link" to="/publications"><EditableText contentKey="Research.text013" /><FiArrowUpRight />
            </Link>
          </aside>
        </section>
      ))}
      <section className="research-projects">
        <span className="eyebrow"><EditableText contentKey="Research.text014" /></span>
        <h2><EditableText contentKey="Research.text015" /></h2>
        <p className="note"><EditableText contentKey="Research.text016" /></p>
        <div className="row-list">
          <div className="detail-row">
            <span className="detail-year">2026–2028</span>
            <div>
              <h3><EditableText contentKey="Research.text017" /></h3>
              <p><EditableText contentKey="Research.text018" /></p>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-year">2026–2028</span>
            <div>
              <h3><EditableText contentKey="Research.text019" /></h3>
              <p><EditableText contentKey="Research.text020" /></p>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-year"><EditableText contentKey="Research.text021" /></span>
            <div>
              <h3><EditableText contentKey="Research.text022" /></h3>
              <p><EditableText contentKey="Research.text023" /></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
