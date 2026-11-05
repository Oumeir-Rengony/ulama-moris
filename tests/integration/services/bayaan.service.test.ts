import { afterEach, describe, expect, it, vi } from "vitest";
import { ExecuteQuery } from "@/services/apollo/apollo.service";
import { getRelatedBayaans, selectUniqueBayaan } from "@/services/bayaans/bayaan.service";

// Only the Contentful query is mocked; the service's own logic runs for real.
vi.mock("@/services/apollo/apollo.service", () => ({ ExecuteQuery: vi.fn() }));

const mockedExecuteQuery = vi.mocked(ExecuteQuery);

function lecture(id: string) {
  return { sys: { id }, title: `Lecture ${id}` };
}

function ids(lectures: Array<{ sys: { id: string } }>): string[] {
  const result: string[] = [];
  for (const item of lectures) {
    result.push(item.sys.id);
  }
  return result;
}

afterEach(() => {
  vi.restoreAllMocks();
  mockedExecuteQuery.mockReset();
});

describe("selectUniqueBayaan", () => {
  it("takes lectures from the earlier lists first and skips duplicates", () => {
    const sameEvent = [lecture("a"), lecture("b")];
    const sameCategory = [lecture("b"), lecture("c")];
    const random = [lecture("d"), lecture("e")];

    expect(ids(selectUniqueBayaan([sameEvent, sameCategory, random]))).toEqual(["a", "b", "c", "d"]);
  });

  it("stops at the limit", () => {
    expect(ids(selectUniqueBayaan([[lecture("a"), lecture("b"), lecture("c")]], 2))).toEqual(["a", "b"]);
  });
});

describe("getRelatedBayaans", () => {
  it("returns up to 4 lectures, same event first, then same category, then random", async () => {
    mockedExecuteQuery.mockResolvedValue({
      event: { items: [lecture("event-1")] },
      category: { items: [lecture("event-1"), lecture("category-1"), lecture("category-2")] },
      random: { items: [lecture("random-1"), lecture("random-2")] },
    });

    const related = await getRelatedBayaans({
      currentSlug: "this-lecture",
      event: "Seerah Week",
      date: "2026-11-03T10:00:00Z",
      category: ["Seerah"],
      totalBayaans: 100,
    });

    expect(ids(related)).toEqual(["event-1", "category-1", "category-2", "random-1"]);
  });

  it("asks Contentful for related lectures, excluding the current one, from a random offset", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    mockedExecuteQuery.mockResolvedValue({
      event: { items: [] },
      category: { items: [] },
      random: { items: [] },
    });

    await getRelatedBayaans({
      currentSlug: "this-lecture",
      event: "Seerah Week",
      date: "2026-11-03T10:00:00Z",
      category: ["Seerah"],
      totalBayaans: 100,
    });

    const options = mockedExecuteQuery.mock.calls[0][1] as { variables: Record<string, unknown> };
    expect(options.variables).toMatchObject({
      event: "Seerah Week",
      category: ["Seerah"],
      currentSlug: "this-lecture",
      limit: 4,
      // floor(0.5 * (100 - 4))
      skip: 48,
    });
  });
});
