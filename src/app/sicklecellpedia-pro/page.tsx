import type { Metadata } from "next";
import { getSicklecellpediaPro } from "@/lib/content";
import Prose from "@/components/Prose";

export function generateMetadata(): Metadata {
  const { frontmatter } = getSicklecellpediaPro();
  return {
    title: frontmatter.title,
    description: frontmatter.meta_description,
  };
}

/**
 * SickleCellPedia Pro — lead-capture page. Form fields are declared in
 * frontmatter and rendered here as a plain (unwired) form; the submit endpoint
 * is connected during the design/integration handoff.
 */
export default function SicklecellpediaProPage() {
  const { frontmatter, html } = getSicklecellpediaPro();
  const { intro, status, form } = frontmatter;

  return (
    <article data-page="sicklecellpedia-pro">
      <h1>{frontmatter.title}</h1>
      {status ? <p data-role="status">{status}</p> : null}
      {intro ? <p>{intro}</p> : null}

      {form ? (
        <form data-endpoint={form.endpoint} data-role="lead-capture">
          {form.fields?.map((field) => (
            <p key={field.name}>
              <label htmlFor={field.name}>
                {field.label}
                {field.required ? " *" : ""}
              </label>
              <br />
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  required={field.required}
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                >
                  {field.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  required={field.required}
                />
              )}
            </p>
          ))}
          <button type="submit">{form.submit_label ?? "Submit"}</button>
        </form>
      ) : null}

      <Prose html={html} />
    </article>
  );
}
