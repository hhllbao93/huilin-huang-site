import EditableBlock from "../editor/EditableBlock";
import EditableText from "../editor/EditableText";
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import huilin from "../assets/Huilin.jpeg";
import cv from "../assets/Huilin_Huang_CV.pdf";
import "./OurTeam.css";

const members = [
  { name: "Zeyu Xia", initials: "ZX" },
  { name: "Lexie Chen", image: "/lexie.jpg" },
  { name: "Ra", initials: "R" },
];

export default function Ourteam() {
  return (
    <div className="container inner-page">
      <header className="page-intro">
        <span className="eyebrow"><EditableText contentKey="Ourteam.text001" /></span>
        <EditableBlock as="h1" blockKey="Ourteam.Ourteam.text002"><EditableText contentKey="Ourteam.text002" /><br /><EditableText contentKey="Ourteam.text003" /></EditableBlock>
        <EditableBlock as="p" blockKey="Ourteam.Ourteam.text004"><EditableText contentKey="Ourteam.text004" /></EditableBlock>
      </header>
      <section className="pi-profile">
        <img className="pi-photo" src={huilin} alt="Dr. Huilin Huang" />
        <div>
          <span className="eyebrow"><EditableText contentKey="Ourteam.text005" /></span>
          <EditableBlock as="h2" blockKey="Ourteam.Ourteam.text006"><EditableText contentKey="Ourteam.text006" /></EditableBlock>
          <EditableBlock as="p" blockKey="Ourteam.Ourteam.text007" className="pi-role"><EditableText contentKey="Ourteam.text007" /><br /><EditableText contentKey="Ourteam.text008" /></EditableBlock>
          <EditableBlock as="p" blockKey="Ourteam.Ourteam.text009"><EditableText contentKey="Ourteam.text009" /></EditableBlock>
          <div className="profile-links">
            <a className="text-link" href="mailto:mgh4rc@virginia.edu"><EditableText contentKey="Ourteam.text010" /><FiArrowUpRight />
            </a>
            <a
              className="text-link"
              href={cv}
              download="Huilin_Huang_CV_Dec2025.pdf"
            ><EditableText contentKey="Ourteam.text011" /></a>
          </div>
          <div className="pi-education">
            <span className="eyebrow"><EditableText contentKey="Ourteam.text012" /></span>
            <EditableBlock as="p" blockKey="Ourteam.Ourteam.text013">
              <strong><EditableText contentKey="Ourteam.text013" /></strong><EditableText contentKey="Ourteam.text014" /><br />
              <strong><EditableText contentKey="Ourteam.text015" /></strong><EditableText contentKey="Ourteam.text016" /></EditableBlock>
          </div>
        </div>
      </section>
      <section className="people-section">
        <span className="eyebrow"><EditableText contentKey="Ourteam.text017" /></span>
        <EditableBlock as="h2" blockKey="Ourteam.Ourteam.text018"><EditableText contentKey="Ourteam.text018" /></EditableBlock>
        <div className="people-grid">
          {members.map((member, memberIndex) => (
            <article className="person" key={memberIndex}>
              {member.image ? (
                <img src={member.image} alt={member.name} loading="lazy" />
              ) : (
                <div className="person-initials" aria-hidden="true">
                  {member.initials}
                  <span><EditableText contentKey="Ourteam.text019" /></span>
                </div>
              )}
              <EditableBlock as="h3" blockKey={`Ourteam.members.${memberIndex}.name`}><EditableText contentKey={`members.${memberIndex}.name`}>{member.name}</EditableText></EditableBlock>
              <span className="person-role"><EditableText contentKey="Ourteam.text020" /></span>
              <EditableBlock as="p" blockKey="Ourteam.Ourteam.text021"><EditableText contentKey="Ourteam.text021" /></EditableBlock>
            </article>
          ))}
        </div>
      </section>
      <section className="split people-section">
        <div>
          <span className="eyebrow"><EditableText contentKey="Ourteam.text022" /></span>
          <EditableBlock as="h2" blockKey="Ourteam.Ourteam.text023"><EditableText contentKey="Ourteam.text023" /><br /><EditableText contentKey="Ourteam.text024" /></EditableBlock>
          <div className="row-list">
            {[
              ["2025–present", "Assistant Professor", "University of Virginia"],
              [
                "2024–2025",
                "Earth Scientist",
                "Pacific Northwest National Laboratory",
              ],
              [
                "2021–2024",
                "Postdoctoral Researcher",
                "Pacific Northwest National Laboratory",
              ],
            ].map(([date, role, place]) => (
              <div className="detail-row" key={role}>
                <span className="detail-year">{date}</span>
                <div>
                  <h3>{role}</h3>
                  <p>{place}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="eyebrow"><EditableText contentKey="Ourteam.text025" /></span>
          <EditableBlock as="h2" blockKey="Ourteam.Ourteam.text026"><EditableText contentKey="Ourteam.text026" /></EditableBlock>
          <EditableBlock as="p" blockKey="Ourteam.Ourteam.text027" className="note"><EditableText contentKey="Ourteam.text027" /></EditableBlock>
          <ul className="plain-list">
            <li><EditableText contentKey="Ourteam.text028" /><em><EditableText contentKey="Ourteam.text029" /></em><EditableText contentKey="Ourteam.text030" /></li>
            <li><EditableText contentKey="Ourteam.text031" /><em><EditableText contentKey="Ourteam.text032" /></em><EditableText contentKey="Ourteam.text033" /></li>
            <li><EditableText contentKey="Ourteam.text034" /></li>
            <li><EditableText contentKey="Ourteam.text035" /></li>
            <li><EditableText contentKey="Ourteam.text036" /></li>
          </ul>
        </div>
      </section>
      <div className="join-band">
        <div>
          <EditableBlock as="h2" blockKey="Ourteam.Ourteam.text037"><EditableText contentKey="Ourteam.text037" /></EditableBlock>
          <EditableBlock as="p" blockKey="Ourteam.Ourteam.text038"><EditableText contentKey="Ourteam.text038" /></EditableBlock>
        </div>
        <Link className="button" to="/opportunities"><EditableText contentKey="Ourteam.text039" /><FiArrowUpRight />
        </Link>
      </div>
    </div>
  );
}
