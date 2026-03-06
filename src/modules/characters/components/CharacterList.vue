<template>
  <nav
    class="char-list"
    aria-label="Liste des personnages"
  >
    <div class="char-list__header">
      <h3 class="char-list__title">
        Personnages
      </h3>
      <span class="char-list__count">{{ characters.length }}/{{ maxCharacters }}</span>
    </div>

    <ul
      class="char-tabs"
      role="tablist"
      aria-label="Onglets personnages"
    >
      <li
        v-for="char in characters"
        :key="char.id"
        class="char-tab"
        :class="{ 'char-tab--active': char.id === selectedId }"
        role="tab"
        tabindex="0"
        :aria-selected="char.id === selectedId ? 'true' : 'false'"
        :aria-label="`${char.name || 'Sans nom'} — ${char.className} niv. ${char.level}`"
        @click="$emit('select', char.id)"
        @keydown.enter="$emit('select', char.id)"
      >
        <span class="char-tab__emoji">{{ getClassEmoji(char.classId) }}</span>
        <div class="char-tab__info">
          <span class="char-tab__name">{{ char.name || 'Sans nom' }}</span>
          <span class="char-tab__class">{{ char.className }} niv. {{ char.level }}</span>
        </div>
        <div class="char-tab__health">
          <span
            class="mini-bar mini-bar--hp"
            :title="`HP: ${char.currentHP}/${char.maxHP}`"
          >
            <span
              class="mini-bar__fill"
              :style="{ width: hpPercent(char) + '%' }"
            ></span>
          </span>
          <span
            class="mini-bar mini-bar--stress"
            :title="`Stress: ${char.currentStress}/${char.maxStress}`"
          >
            <span
              class="mini-bar__fill"
              :style="{ width: stressPercent(char) + '%' }"
            ></span>
          </span>
        </div>
        <button
          class="char-tab__delete"
          :aria-label="`Supprimer ${char.name || 'Sans nom'}`"
          @click.stop="$emit('delete', char.id)"
        >
          ✕
        </button>
      </li>
    </ul>

    <button
      v-if="canAdd"
      class="add-char-btn"
      @click="$emit('add')"
    >
      + Nouveau personnage
    </button>
  </nav>
</template>

<script>
import { useCharacterStore } from '../stores/characterStore'

export default {
  name: 'CharacterList',
  props: {
    characters: { type: Array, required: true },
    selectedId: { type: String, default: null },
    canAdd: { type: Boolean, default: true },
    maxCharacters: { type: Number, default: 8 }
  },
  emits: ['select', 'add', 'delete'],
  setup() {
    const store = useCharacterStore()
    return { store }
  },
  methods: {
    getClassEmoji(classId) {
      const cls = this.store.allClasses.find((c) => c.id === classId)
      return cls ? cls.emoji : '🧙'
    },
    hpPercent(char) {
      return char.maxHP > 0 ? (char.currentHP / char.maxHP) * 100 : 0
    },
    stressPercent(char) {
      return char.maxStress > 0 ? (char.currentStress / char.maxStress) * 100 : 0
    }
  }
}
</script>

<style scoped>
.char-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.char-list__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.char-list__title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1rem;
  color: var(--color-text-primary);
  margin: 0;
}

.char-list__count {
  font-size: 0.8rem;
  color: var(--color-text-muted, #6b7280);
}

.char-tabs {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.char-tab {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-secondary, #1f1f3a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms);
}

.char-tab:hover { border-color: var(--color-text-secondary); }

.char-tab--active {
  border-color: var(--color-accent-hope, #53a8b6);
  background: rgba(83, 168, 182, 0.08);
}

.char-tab:focus-visible {
  outline: 2px solid var(--color-accent-hope, #53a8b6);
  outline-offset: 1px;
}

.char-tab__emoji { font-size: 1.1rem; }

.char-tab__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.char-tab__name {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.char-tab__class {
  font-size: 0.7rem;
  color: var(--color-text-muted, #6b7280);
}

.char-tab__health {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 40px;
}

.mini-bar {
  height: 4px;
  border-radius: 2px;
  background: var(--color-bg-tertiary, #2a2a4a);
  overflow: hidden;
}

.mini-bar__fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  transition: width var(--transition-fast, 150ms);
}

.mini-bar--hp .mini-bar__fill { background: var(--color-accent-fear, #c84b31); }
.mini-bar--stress .mini-bar__fill { background: #a855f7; }

.char-tab__delete {
  padding: 2px 4px;
  background: none;
  border: none;
  color: var(--color-text-muted, #6b7280);
  cursor: pointer;
  font-size: 0.7rem;
  border-radius: 3px;
  opacity: 0;
  transition: opacity var(--transition-fast, 150ms);
}

.char-tab:hover .char-tab__delete { opacity: 1; }
.char-tab__delete:hover { color: var(--color-accent-fear, #c84b31); }

.add-char-btn {
  padding: var(--space-xs) var(--space-md);
  border: 1px dashed var(--color-border, #3a3a5a);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all var(--transition-fast, 150ms);
}

.add-char-btn:hover {
  border-color: var(--color-accent-hope, #53a8b6);
  color: var(--color-accent-hope, #53a8b6);
}
</style>
