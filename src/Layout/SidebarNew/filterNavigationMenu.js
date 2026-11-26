export const filterNavigationMenu = (menu, searchTerm, translate, canView) => {
  const query = searchTerm.trim().toLocaleLowerCase();
  if (!query) return menu;

  const results = [];
  let sectionHeading;
  let sectionHasResults = false;

  menu.forEach((item) => {
    if (item.type === "text") {
      sectionHeading = item;
      sectionHasResults = false;
      return;
    }

    if (item.permission && !canView(item)) return;

    const filteredChildren = item.menu
      ? filterNavigationMenu(item.menu, searchTerm, translate, canView)
      : undefined;
    const matchesLabel =
      typeof item.title === "string" &&
      String(translate(item.title)).toLocaleLowerCase().includes(query);
    const hasMatchingChildren = filteredChildren?.some((child) => child.type !== "text");

    if (matchesLabel || hasMatchingChildren) {
      if (sectionHeading && !sectionHasResults) {
        results.push(sectionHeading);
      }

      results.push(filteredChildren ? { ...item, menu: filteredChildren } : item);
      sectionHasResults = true;
    }
  });

  return results;
};
