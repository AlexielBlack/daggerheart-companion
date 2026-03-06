# Creating a New Agent — Setup Guide

## Prerequisites
- Violet approval (or E.I.K. recommendation + human approval)
- Clear domain definition
- At least one task type the agent will handle

## Step-by-Step

### 1. Create Directory Structure
```bash
cp -r .violet/Operations/_Template .violet/Operations/[Agent-Name]
```

### 2. Define Identity
Edit `Identity/[name]-identity.md`:
- Define thinking style, risk orientation, distinctive habit
- Identify weakness and guardrails

### 3. Write Master Directive
Edit `directives/_master.md`:
- Define routing table (task types → actions)
- Set guardrails and escalation protocol

### 4. Create Agent Picker
Create `.claude/agents/[name].md`:
- YAML frontmatter: name, description, tools, model
- Role description and key conventions
- Domain-specific guardrails

### 5. Register with Violet
- Add agent to routing table in `.violet/Admin/directives/_master.md`
- Update `CLAUDE.md` hierarchy diagram
- Update `STATE.md`

## Checklist
- [ ] Directory structure created
- [ ] Identity document written
- [ ] Master directive completed
- [ ] Agent picker file created
- [ ] Registered with Violet
- [ ] Tested in Claude Code
