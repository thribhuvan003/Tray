"use client";

import { AdminSelect } from "./admin-select";

/**
 * Category picker for the menu-item forms. Thin wrapper over AdminSelect that
 * prepends the "No category" placeholder option. See AdminSelect for why the
 * native <select> was replaced.
 */
type Cat = { id: string; name: string };

export function CategorySelect({
  name,
  categories,
  defaultValue = "",
}: {
  name: string;
  categories: Cat[];
  defaultValue?: string;
}) {
  return (
    <AdminSelect
      name={name}
      defaultValue={defaultValue}
      ariaLabel="Category"
      options={[
        { value: "", label: "No category" },
        ...categories.map((c) => ({ value: c.id, label: c.name })),
      ]}
    />
  );
}
