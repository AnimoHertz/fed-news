# Fed News Evolution Loop

You are continuously evolving the Fed News site. Each iteration, make meaningful progress.

## Your Mission

Build and improve a minimal news site for the [snark-tank/ralph](https://github.com/snark-tank/ralph) repository. Keep it simple, black and white, easy to understand.

## Each Iteration

1. **Read State**
   - Check `BACKLOG.md` for the next uncompleted task (marked with `[ ]`)
   - Check `CHANGELOG.md` to see what's already been done
   - Run `npm run dev` if the server isn't running

2. **Pick a Task**
   - Choose the highest priority uncompleted task from BACKLOG.md
   - Or fix any bugs/issues you notice
   - Or improve something that feels incomplete

3. **Implement**
   - Make the changes
   - Test that they work (`npm run build` should pass)
   - Keep changes focused - one feature/fix per iteration

4. **Update State**
   - Mark the task complete in `BACKLOG.md`: `[ ]` → `[x]`
   - Add an entry to `CHANGELOG.md` with what you did
   - Commit your changes with a descriptive message

5. **Verify**
   - Run `npm run build` to ensure no errors
   - Check the site still works at http://localhost:3000

## Quality Standards

- TypeScript strict mode must pass
- No console errors in the browser
- Responsive design (mobile + desktop)
- Maintain the government aesthetic (navy, gold, serif headings)
- Keep code clean and well-organized

## When You're Done

After completing a task and committing, output:

```
<iteration-complete>
Task: [what you worked on]
Status: [complete/partial/blocked]
Next: [suggested next task]
</iteration-complete>
```

## Important Rules

- Don't skip the build check
- Don't leave broken code
- Commit after each meaningful change
- If stuck, document the blocker in BACKLOG.md and move to another task
- Keep the site running and functional at all times
