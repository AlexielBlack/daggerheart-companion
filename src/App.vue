<template>
  <AppShell>
    <Suspense>
      <template #default>
        <router-view />
      </template>
      <template #fallback>
        <LoadingSpinner label="Chargement du module…" />
      </template>
    </Suspense>
  </AppShell>
  <PwaBanner />
</template>

<script>
import AppShell from '@core/components/AppShell.vue'
import LoadingSpinner from '@core/components/LoadingSpinner.vue'
import PwaBanner from '@core/components/PwaBanner.vue'

export default {
  name: 'App',
  components: { AppShell, LoadingSpinner, PwaBanner }
}
</script>
