import EditableBlock from "../editor/EditableBlock";
import EditableText from "../editor/EditableText";
import { FiArrowUpRight } from "react-icons/fi";

export default function Opportunities() {
  return (
    <div className="container inner-page">
      <header className="page-intro">
        <span className="eyebrow"><EditableText contentKey="Opportunities.text001" /></span>
        <EditableBlock as="h1" blockKey="Opportunities.Opportunities.text002"><EditableText contentKey="Opportunities.text002" /><br /><EditableText contentKey="Opportunities.text003" /></EditableBlock>
        <EditableBlock as="p" blockKey="Opportunities.Opportunities.text004"><EditableText contentKey="Opportunities.text004" /></EditableBlock>
      </header>
      <div className="split">
        <section>
          <span className="eyebrow"><EditableText contentKey="Opportunities.text005" /></span>
          <EditableBlock as="h2" blockKey="Opportunities.Opportunities.text006"><EditableText contentKey="Opportunities.text006" /><br /><EditableText contentKey="Opportunities.text007" /></EditableBlock>
          <EditableBlock as="p" blockKey="Opportunities.Opportunities.text008"><EditableText contentKey="Opportunities.text008" /></EditableBlock>
          <EditableBlock as="p" blockKey="Opportunities.Opportunities.text009"><EditableText contentKey="Opportunities.text009" /></EditableBlock>
          <EditableBlock as="p" blockKey="Opportunities.Opportunities.text010" className="note"><EditableText contentKey="Opportunities.text010" /></EditableBlock>
        </section>
        <section>
          <span className="eyebrow"><EditableText contentKey="Opportunities.text011" /></span>
          <EditableBlock as="h2" blockKey="Opportunities.Opportunities.text012"><EditableText contentKey="Opportunities.text012" /><br /><EditableText contentKey="Opportunities.text013" /></EditableBlock>
          <EditableBlock as="p" blockKey="Opportunities.Opportunities.text014"><EditableText contentKey="Opportunities.text014" /></EditableBlock>
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
          <EditableBlock as="h2" blockKey="Opportunities.Opportunities.text019"><EditableText contentKey="Opportunities.text019" /></EditableBlock>
          <EditableBlock as="p" blockKey="Opportunities.Opportunities.text020"><EditableText contentKey="Opportunities.text020" /></EditableBlock>
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
