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
        <h1><EditableText contentKey="Teaching.text002" /><br /><EditableText contentKey="Teaching.text003" /></h1>
        <p><EditableText contentKey="Teaching.text004" /></p>
      </header>

      <section>
        <span className="eyebrow"><EditableText contentKey="Teaching.text005" /></span>
        <h2><EditableText contentKey="Teaching.text006" /></h2>
        <div className="row-list">
          {courses.map(([year, title, institution], courseIndex) => (
            <article
              className="detail-row course-row"
              key={title}
            >
              <span className="detail-year"><EditableText contentKey={`courses.${courseIndex}.year`}>{year}</EditableText></span>
              <div>
                <h3><EditableText contentKey={`courses.${courseIndex}.title`}>{title}</EditableText></h3>
                <p><EditableText contentKey={`courses.${courseIndex}.institution`}>{institution}</EditableText></p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mentoring-block split">
        <div>
          <span className="eyebrow"><EditableText contentKey="Teaching.text007" /></span>
          <h2><EditableText contentKey="Teaching.text008" /><br /><EditableText contentKey="Teaching.text009" /></h2>
          <p><EditableText contentKey="Teaching.text010" /></p>
        </div>

        <div>
          <h3><EditableText contentKey="Teaching.text011" /></h3>
          {mentoring.map(({ title, students }, mentoringIndex) => (
            <div className="detail-row" key={title}>
              <span className="detail-year"><EditableText contentKey="Teaching.text012" /></span>
              <div>
                <h3><EditableText contentKey={`mentoring.${mentoringIndex}.title`}>{title}</EditableText></h3>
                <p><EditableText contentKey={`mentoring.${mentoringIndex}.students`}>{students}</EditableText></p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
