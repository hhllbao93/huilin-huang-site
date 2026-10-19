import EditableGroup from "../editor/EditableGroup";
import EditableBlock from "../editor/EditableBlock";
import EditableText from "../editor/EditableText";
import "./Teaching.css";

const courses = [
  [
    "2026",
    "Climate Extremes and Natural Hazards",
  ],
  [
    "2026",
    "Regional Climate and Land Surface Processes",
  ],
  [
    "2026",
    "Scientific Writing: From Craft to Practice",
  ],
];

const mentoring = [
  {
    title: "Graduate student mentoring",
    students: "Zeyu Xia (CS) · Jingfan Xia · Kejian Shi",
  },
  {
    title: "Undergraduate research mentoring",
    students: "Lexie Chen (CS)",
  },
  {
    title: "Graduate student committees",
    students:
      "Ginny Henderson · Jagdish Desai · Zejun Cui · Estel Valeanu (CEE) · Farzana Yasmin Ahmad (CS) · Nicholas Hanna · Michelle Nguyen",
  },
  {
    title: "Undergraduate advising",
    students: "Astrid Kaczmarzewski · Amilyn Estes · Elijah Hall",
  },
];

export default function Teaching() {
  return (
    <div className="container inner-page">
      <header className="page-intro">
        <span className="eyebrow"><EditableText contentKey="Teaching.text001" /></span>
        <EditableGroup groupKey="Teaching.group6">
<EditableBlock as="h1" blockKey="Teaching.Teaching.text002"><EditableText contentKey="Teaching.text002" /><br /><EditableText contentKey="Teaching.text003" /></EditableBlock>
        <EditableBlock as="p" blockKey="Teaching.Teaching.text004"><EditableText contentKey="Teaching.text004" /></EditableBlock>
</EditableGroup>
      </header>

      <section>
        <span className="eyebrow"><EditableText contentKey="Teaching.text005" /></span>
        <EditableBlock as="h2" blockKey="Teaching.Teaching.text006"><EditableText contentKey="Teaching.text006" /></EditableBlock>
        <div className="row-list">
          {courses.map(([year, title, institution], courseIndex) => (
            <article
              className="detail-row course-row"
              key={title}
            >
              <span className="detail-year"><EditableText contentKey={`courses.${courseIndex}.year`}>{year}</EditableText></span>
              <div>
                <EditableBlock as="h3" blockKey={`Teaching.courses.${courseIndex}.title`}><EditableText contentKey={`courses.${courseIndex}.title`}>{title}</EditableText></EditableBlock>
                <EditableBlock as="p" blockKey={`Teaching.courses.${courseIndex}.institution`}><EditableText contentKey={`courses.${courseIndex}.institution`}>{institution}</EditableText></EditableBlock>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mentoring-block split">
        <div>
          <span className="eyebrow"><EditableText contentKey="Teaching.text007" /></span>
          <EditableGroup groupKey="Teaching.group7">
<EditableBlock as="h2" blockKey="Teaching.Teaching.text008"><EditableText contentKey="Teaching.text008" /><br /><EditableText contentKey="Teaching.text009" /></EditableBlock>
          <EditableBlock as="p" blockKey="Teaching.Teaching.text010"><EditableText contentKey="Teaching.text010" /></EditableBlock>
</EditableGroup>
        </div>

        <div>
          <EditableBlock as="h3" blockKey="Teaching.Teaching.text011"><EditableText contentKey="Teaching.text011" /></EditableBlock>
          {mentoring.map(({ title, students }, mentoringIndex) => (
            <div className="detail-row" key={title}>
              <span className="detail-year"><EditableText contentKey="Teaching.text012" /></span>
              <div>
                <EditableBlock as="h3" blockKey={`Teaching.mentoring.${mentoringIndex}.title`}><EditableText contentKey={`mentoring.${mentoringIndex}.title`}>{title}</EditableText></EditableBlock>
                <EditableBlock as="p" blockKey={`Teaching.mentoring.${mentoringIndex}.students`}><EditableText contentKey={`mentoring.${mentoringIndex}.students`}>{students}</EditableText></EditableBlock>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
