- when you create a fix md file or summery it should be created in the docs/fixes folder
- Pattern for Future Use

  ✅ Correct:
  .element {
    @apply flex items-center;  /* Tailwind utilities */
    font-size: var(--font-size-md);  /* CSS variables */
    padding: var(--spacing-lg);
  }

  ❌ Avoid:
  .element {
    @apply text-[var(--font-size-md)] p-[var(--spacing-lg)];  /* Won't work! */
  }
- making changes to code by either changing/adding/removing code - must always be followed with updating/creating/deleting a test file.