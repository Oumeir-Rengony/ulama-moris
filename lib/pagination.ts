export type PageNumberItem = number | "...";

const MAX_VISIBLE_PAGES = 5;

// The page buttons to show under a list. Short lists show every page; long lists
// always show the first and last page, the pages around the current one, and "..."
// where pages are skipped.
export function getPageNumbers(currentPage: number, totalPages: number): PageNumberItem[] {
  const pages: PageNumberItem[] = [];

  if (totalPages <= MAX_VISIBLE_PAGES) {
    for (let page = 1; page <= totalPages; page++) {
      pages.push(page);
    }
    return pages;
  }

  const isNearStart = currentPage <= 3;
  const isNearEnd = currentPage >= totalPages - 2;

  if (isNearStart) {
    pages.push(1, 2, 3, 4, "...", totalPages);
  } else if (isNearEnd) {
    pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
  }

  return pages;
}
