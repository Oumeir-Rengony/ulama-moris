// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonLdScript } from "@/components/json-ld-script";

function renderedScript(data: object): HTMLScriptElement {
  const { container } = render(<JsonLdScript data={data} />);
  const script = container.querySelector('script[type="application/ld+json"]');
  if (!(script instanceof HTMLScriptElement)) {
    throw new Error("No JSON-LD script was rendered");
  }
  return script;
}

describe("JsonLdScript", () => {
  it("renders the data as JSON that parses back to the same object", () => {
    const data = { "@context": "https://schema.org", "@type": "Event", name: "Seerah Week" };

    expect(JSON.parse(renderedScript(data).innerHTML)).toEqual(data);
  });

  it("escapes '<' so CMS text cannot close the script tag", () => {
    const data = { name: "Talk </script><img src=x onerror=alert(1)>" };
    const script = renderedScript(data);

    expect(script.innerHTML).not.toContain("</script>");
    expect(script.innerHTML).toContain("\\u003c/script>");
    expect(JSON.parse(script.innerHTML)).toEqual(data);
  });
});
