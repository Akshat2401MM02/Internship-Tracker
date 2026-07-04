const ResumePreview = ({ resume }) => {
  if (!resume) return null;

  return (
    <div className="space-y-4 text-sm text-gray-200">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-100">{resume.fullName}</h2>
        {resume.contact && <p className="mt-1 text-xs text-gray-400">{resume.contact}</p>}
      </div>

      {resume.summary && (
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary-400">Summary</h3>
          <p className="text-xs leading-relaxed text-gray-300">{resume.summary}</p>
        </div>
      )}

      {resume.skills && resume.skills.length > 0 && (
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary-400">Skills</h3>
          <div className="space-y-0.5">
            {resume.skills.map((group, i) => (
              <p key={i} className="text-xs text-gray-300">
                <span className="font-semibold text-gray-200">{group.category}:</span> {group.items}
              </p>
            ))}
          </div>
        </div>
      )}

      {resume.experience && resume.experience.length > 0 && (
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary-400">Experience</h3>
          <div className="space-y-2">
            {resume.experience.map((exp, i) => (
              <div key={i}>
                <p className="text-xs font-semibold text-gray-200">
                  {exp.title} {exp.organization && `— ${exp.organization}`}
                </p>
                {exp.dates && <p className="text-[11px] italic text-gray-500">{exp.dates}</p>}
                <ul className="mt-0.5 list-disc space-y-0.5 pl-4">
                  {exp.bullets?.map((b, j) => (
                    <li key={j} className="text-xs text-gray-300">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.projects && resume.projects.length > 0 && (
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary-400">Projects</h3>
          <div className="space-y-2">
            {resume.projects.map((proj, i) => (
              <div key={i}>
                <p className="text-xs font-semibold text-gray-200">
                  {proj.name} {proj.techStack && <span className="font-normal text-gray-500">({proj.techStack})</span>}
                </p>
                <ul className="mt-0.5 list-disc space-y-0.5 pl-4">
                  {proj.bullets?.map((b, j) => (
                    <li key={j} className="text-xs text-gray-300">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.education && resume.education.length > 0 && (
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary-400">Education</h3>
          <div className="space-y-1.5">
            {resume.education.map((edu, i) => (
              <div key={i}>
                <p className="text-xs font-semibold text-gray-200">{edu.institution}</p>
                <p className="text-xs text-gray-300">{edu.degree}</p>
                <p className="text-[11px] italic text-gray-500">
                  {[edu.dates, edu.detail].filter(Boolean).join(' | ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.extras && resume.extras.length > 0 && (
        <>
          {resume.extras.map((section, i) => (
            <div key={i}>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary-400">
                {section.sectionTitle}
              </h3>
              <ul className="list-disc space-y-0.5 pl-4">
                {section.bullets?.map((b, j) => (
                  <li key={j} className="text-xs text-gray-300">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ResumePreview;
