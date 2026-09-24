import { useState } from "react";

import "./App.css";

import SeminarResult, {
  type FinalSeminarPlan,
} from "./components/SeminarResult";

function App() {
const [title, setTitle] = useState("");
const [participants, setParticipants] = useState(2);
const [duration, setDuration] = useState(20);
const [mandatoryTopics, setMandatoryTopics] = useState("");
const [references, setReferences] = useState("");

const [result, setResult] = useState<FinalSeminarPlan | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState("");

async function handleSubmit(
event: React.SubmitEvent<HTMLFormElement>
) {
event.preventDefault();

if (!title.trim()) {
  setError("Informe o tema do seminário.");
  return;
}

if (participants < 1) {
  setError("O seminário precisa ter pelo menos 1 participante.");
  return;
}

if (duration <= 0) {
  setError("A duração do seminário deve ser maior que zero.");
  return;
}

setIsLoading(true);
setError("");
setResult(null);

const data = {
  title: title.trim(),
  participants,
  duration_minutes: duration,
  mandatory_topics: mandatoryTopics
    .split("\n")
    .map((topic) => topic.trim())
    .filter(Boolean),
  references: references
    .split("\n")
    .map((reference) => reference.trim())
    .filter(Boolean),
};

try {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/seminars`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    let message = "Não foi possível criar o planejamento.";

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

  const seminarPlan: FinalSeminarPlan =
    await response.json();

  setResult(seminarPlan);
} catch (error) {
  console.error(error);

  if (error instanceof TypeError) {
    setError(
      "Não foi possível conectar ao servidor. Verifique se o backend está rodando em localhost:8000."
    );
  } else if (error instanceof Error) {
    setError(error.message);
  } else {
    setError(
      "Ocorreu um erro inesperado ao criar o planejamento. Tente novamente."
    );
  }
} finally {
  setIsLoading(false);
}


}

function handleNewPlanning() {
setResult(null);
setError("");
}

return ( <main className="page"> <section className="container"> <header className="header"> <h1>Seminar Planner</h1> <p>
Planeje seu seminário de forma rápida e organizada
com auxílio de inteligência artificial. </p> </header>

    {result ? (
      <SeminarResult
        plan={result}
        onNewPlanning={handleNewPlanning}
      />
    ) : (
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">
            Tema do seminário
          </label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Ex.: Vibe Coding"
            disabled={isLoading}
          />
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="participants">
              Participantes
            </label>

            <input
              id="participants"
              type="number"
              min="1"
              value={participants}
              onChange={(event) =>
                setParticipants(Number(event.target.value))
              }
              disabled={isLoading}
            />
          </div>

          <div className="field">
            <label htmlFor="duration">
              Duração <span>em minutos</span>
            </label>

            <input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(event) =>
                setDuration(Number(event.target.value))
              }
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="mandatoryTopics">
            Tópicos obrigatórios{" "}
            <span>opcional</span>
          </label>

          <textarea
            id="mandatoryTopics"
            value={mandatoryTopics}
            onChange={(event) =>
              setMandatoryTopics(event.target.value)
            }
            placeholder={
              "Um tópico por linha\nEx.: Conceito\nBenefícios\nRiscos"
            }
            disabled={isLoading}
          />

          <small>
            Informe um tópico por linha.
          </small>
        </div>

        <div className="field">
          <label htmlFor="references">
            Referências <span>opcional</span>
          </label>

          <textarea
            id="references"
            value={references}
            onChange={(event) =>
              setReferences(event.target.value)
            }
            placeholder={
              "Uma referência por linha\nEx.: https://exemplo.com/artigo"
            }
            disabled={isLoading}
          />

          <small>
            Informe uma referência por linha.
          </small>
        </div>

        {error && (
          <div
            className="error-message"
            role="alert"
          >
            <strong>
              Não foi possível criar o planejamento
            </strong>

            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading-content">
              <span className="spinner" />
              Criando planejamento...
            </span>
          ) : (
            "Criar planejamento"
          )}
        </button>

        {isLoading && (
          <p className="loading-message">
            A IA está organizando os tópicos,
            participantes e slides. Isso pode levar alguns
            segundos.
          </p>
        )}
      </form>
    )}
  </section>
</main>


);
}

export default App;
