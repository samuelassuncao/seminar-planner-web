import { useState } from "react";

type Topic = {
  title: string;
  description: string;
  estimated_minutes: number;
};

type Participant = {
  name: string;
  topics: string[];
  estimated_minutes: number;
};

type SlideSection = {
  title: string;
  text: string | null;
  subtopics: string[];
};

type Slide = {
  number: number;
  source_slide_number: number;
  title: string;
  sections: SlideSection[];
  participant: string;
  estimated_minutes: number;
};

export type FinalSeminarPlan = {
  title: string;
  topics: Topic[];
  participants: Participant[];
  slides: Slide[];
  total_duration_minutes: number;
  references: string[];
  mandatory_topics: string[];
};

type SeminarResultProps = {
  plan: FinalSeminarPlan;
  onNewPlanning: () => void;
};

function SeminarResult({
  plan,
  onNewPlanning,
}: SeminarResultProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  async function handleDownloadPptx() {
    setIsDownloading(true);
    setDownloadError("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/seminars/pptx",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(plan),
        }
      );

      if (!response.ok) {
        let message = "Não foi possível gerar o arquivo PPTX.";

        try {
          const errorData = await response.json();

          if (typeof errorData.detail === "string") {
            message = errorData.detail;
          }
        } catch {
          // Mantém a mensagem padrão caso o backend não retorne JSON.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "seminar-plan.pptx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);

      if (error instanceof TypeError) {
        setDownloadError(
          "Não foi possível conectar ao servidor. Verifique se o backend está rodando em localhost:8000."
        );
      } else if (error instanceof Error) {
        setDownloadError(error.message);
      } else {
        setDownloadError(
          "Ocorreu um erro inesperado ao gerar o PPTX."
        );
      }
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className="result">
      <header className="result-header">
        <div>
          <span className="result-label">
            Planejamento criado
          </span>

          <h2>{plan.title}</h2>

          <p>
            {plan.total_duration_minutes} minutos ·{" "}
            {plan.participants.length} participantes
          </p>
        </div>
      </header>

      <section className="result-section">
        <div className="section-heading">
          <h3>Estrutura do seminário</h3>

          <p>
            Organização dos principais tópicos da apresentação.
          </p>
        </div>

        <div className="topic-list">
          {plan.topics.map((topic, index) => (
            <article
              className="topic-card"
              key={topic.title}
            >
              <div className="topic-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="topic-content">
                <div className="topic-title">
                  <h4>{topic.title}</h4>

                  <span>
                    {topic.estimated_minutes} min
                  </span>
                </div>

                <p>{topic.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="result-section">
        <div className="section-heading">
          <h3>Divisão dos participantes</h3>

          <p>
            Distribuição dos tópicos e tempo de fala.
          </p>
        </div>

        <div className="participants-list">
          {plan.participants.map((participant) => (
            <article
              className="participant-card"
              key={participant.name}
            >
              <div className="participant-header">
                <h4>{participant.name}</h4>

                <span>
                  {participant.estimated_minutes} min
                </span>
              </div>

              <ul>
                {participant.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="result-section">
        <div className="section-heading">
          <h3>Slides</h3>

          <p>
            Conteúdo desenvolvido para cada slide da apresentação.
          </p>
        </div>

        <div className="slides-list">
          {plan.slides.map((slide) => (
            <article
              className="slide-card"
              key={slide.number}
            >
              <div className="slide-number">
                {String(slide.number).padStart(2, "0")}
              </div>

              <div className="slide-content">
                <div className="slide-header">
                  <h4>{slide.title}</h4>

                  <span>
                    {slide.estimated_minutes} min
                  </span>
                </div>

                <div className="slide-sections">
                  {slide.sections.map((section) => (
                    <div
                      className="slide-section"
                      key={section.title}
                    >
                      <h5>{section.title}</h5>

                      {section.text && (
                        <p>{section.text}</p>
                      )}

                      {section.subtopics.length > 0 && (
                        <ul>
                          {section.subtopics.map((subtopic) => (
                            <li key={subtopic}>
                              {subtopic}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                <small>
                  Apresentado por {slide.participant}
                </small>
              </div>
            </article>
          ))}
        </div>
      </section>

      {plan.references.length > 0 && (
        <section className="result-section">
          <div className="section-heading">
            <h3>Referências</h3>
          </div>

          <ul className="references-list">
            {plan.references.map((reference) => (
              <li key={reference}>
                <a
                  href={reference}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {reference}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {downloadError && (
        <div
          className="error-message"
          role="alert"
        >
          <strong>
            Não foi possível gerar o PPTX
          </strong>

          <span>{downloadError}</span>
        </div>
      )}

      <div className="result-actions">
        <button
          type="button"
          className="download-pptx-button"
          onClick={handleDownloadPptx}
          disabled={isDownloading}
        >
          {isDownloading
            ? "Gerando PPTX..."
            : "Baixar PPTX"}
        </button>

        <button
          type="button"
          className="new-planning-button"
          onClick={onNewPlanning}
        >
          ← Criar outro planejamento
        </button>
      </div>
    </section>
  );
}

export default SeminarResult;