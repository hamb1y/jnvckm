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
  }: {
    categories: Category[];
    total: number;
    allLabel: string;
    filterLabel: string;
    emptyLabel: string;
    countTemplate: string;
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

  const countLabel = $derived(countTemplate.replace("{n}", String(visible)).replace("{total}", String(total)));
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
  <p class="filter-count mono" aria-live="polite">{countLabel}</p>
</div>

<style>
  .filter {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--s-3) var(--s-5);
    padding-block: var(--s-4);
    border-block: 1px solid var(--rule);
    margin-block-end: var(--s-6);
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-2);
  }

  .filter-chip {
    padding: 0.4em 0.9em;
    background: transparent;
    border: 1px solid var(--rule-strong);
    border-radius: var(--r-2);
    font-size: var(--step--1);
    font-weight: 600;
    cursor: pointer;
  }

  .filter-chip:hover {
    background: var(--brand-tint);
    border-color: var(--brand);
  }

  .filter-chip[aria-pressed="true"] {
    background: var(--ink);
    border-color: var(--ink);
    color: var(--paper);
  }

  .filter-count {
    color: var(--text-3);
  }
</style>
