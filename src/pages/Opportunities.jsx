import EditableText from "../editor/EditableText";
import { FiArrowUpRight } from "react-icons/fi";

export default function Opportunities() {
  return (
    <div className="container inner-page">
      <header className="page-intro">
        <span className="eyebrow"><EditableText contentKey="Opportunities.text001" /></span>
        <h1><EditableText contentKey="Opportunities.text002" /><br /><EditableText contentKey="Opportunities.text003" /></h1>
        <p><EditableText contentKey="Opportunities.text004" /></p>
      </header>
      <div className="split">
        <section>
          <span className="eyebrow"><EditableText contentKey="Opportunities.text005" /></span>
          <h2><EditableText contentKey="Opportunities.text006" /><br /><EditableText contentKey="Opportunities.text007" /></h2>
          <p><EditableText contentKey="Opportunities.text008" /></p>
          <p><EditableText contentKey="Opportunities.text009" /></p>
          <p className="note"><EditableText contentKey="Opportunities.text010" /></p>
        </section>
        <section>
          <span className="eyebrow"><EditableText contentKey="Opportunities.text011" /></span>
          <h2><EditableText contentKey="Opportunities.text012" /><br /><EditableText contentKey="Opportunities.text013" /></h2>
          <p><EditableText contentKey="Opportunities.text014" /></p>
          <div className="tags">
            <span className="tag"><EditableText contentKey="Opportunities.text015" /></span>
            <span className="tag"><EditableText contentKey="Opportunities.text016" /></span>
            <span className="tag"><EditableText contentKey="Opportunities.text017" /></span>
          </div>
        </section>
      </div>
      <div className="join-band">
        <div>
          <span className="eyebrow"><EditableText contentKey="Opportunities.text018" /></span>
          <h2><EditableText contentKey="Opportunities.text019" /></h2>
          <p><EditableText contentKey="Opportunities.text020" /></p>
        </div>
        <a
          className="button"
          href="mailto:mgh4rc@virginia.edu?subject=Research%20inquiry"
        ><EditableText contentKey="Opportunities.text021" /><FiArrowUpRight />
        </a>
      </div>
    </div>
  );
}
