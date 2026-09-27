<script lang="ts">
  /**
   * Filters the server-rendered contribution rows by toggling `hidden`.
   * Content stays in the HTML and remains crawlable; with JavaScript disabled
   * every record is simply visible.
   */
  interface Category {
    id: string;
    label: string;
  }

  let {
    categories,
    total,
    allLabel,
    filterLabel,
    emptyLabel,
    countTemplate,
    range = "",
  }: {
    categories: Category[];
    total: number;
    allLabel: string;
    filterLabel: string;
    emptyLabel: string;
    countTemplate: string;
    range?: string;
  } = $props();

  let active = $state("all");
  let visible = $state(total);

  function apply(id: string) {
    active = id;
    const rows = document.querySelectorAll<HTMLElement>("[data-contribution]");
    let shown = 0;
    for (const row of rows) {
      const match = id === "all" || row.dataset.category === id;
      row.hidden = !match;
      if (match) shown += 1;
    }
    visible = shown;
    const empty = document.querySelector<HTMLElement>("[data-filter-empty]");
    if (empty) empty.hidden = shown !== 0;
  }

  const countLabel = $derived(
    countTemplate.replace("{n}", String(visible)).replace("{total}", String(total)),
  );
</script>

<div class="filter">
  <div class="filter-row" role="group" aria-label={filterLabel}>
    <button
      type="button"
      class="filter-chip"
      aria-pressed={active === "all"}
      onclick={() => apply("all")}
    >
      {allLabel}
    </button>
    {#each categories as category (category.id)}
      <button
        type="button"
        class="filter-chip"
        aria-pressed={active === category.id}
        onclick={() => apply(category.id)}
      >
        {category.label}
      </button>
    {/each}
  </div>
  <p class="filter-count mono" aria-live="polite">
    {countLabel}{range ? ` · ${range}` : ""}
  </p>
</div>

<style>
  /* Sticks under the header so the categories stay in reach down a long list. */
  .filter {
    position: sticky;
    inset-block-start: var(--header-h);
    z-index: 5;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-3) var(--s-5);
    padding-block: var(--s-4);
    margin-block-end: var(--s-5);
    background: var(--paper);
    border-block-end: 1px solid var(--rule);
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-2);
  }

  .filter-chip {
    padding: 0.35em 0;
    margin-inline-end: var(--s-4);
    background: none;
    border: 0;
    font-size: var(--step-0);
    font-weight: 700;
    color: var(--ink-2, var(--ink));
    cursor: pointer;
    text-decoration: underline;
    text-decoration-color: transparent;
    text-decoration-thickness: 2px;
    text-underline-offset: 0.4em;
    transition:
      color var(--dur-1) var(--ease-out),
      text-decoration-color var(--dur-1) var(--ease-out);
  }

  .filter-chip:hover {
    color: var(--ink);
    text-decoration-color: var(--rule-strong);
  }

  .filter-chip[aria-pressed="true"] {
    color: var(--ink);
    text-decoration-color: var(--brand);
  }

  .filter-count {
    color: var(--text-3);
  }

  @media (max-width: 720px) {
    .filter {
      position: static;
    }
  }
</style>
