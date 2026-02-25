<template>
  <div class="page">
    <!-- Top bar -->
    <header class="topbar">
      <div class="brand">
        <div class="dot"></div>
        <div>
          <h1>Tableau de bord</h1>
          <p>Suivi des réservations & notifications</p>
        </div>
      </div>

      <div class="actions">
        <button class="btn ghost" @click="goHome">Accueil</button>
        <button class="btn" @click="refreshAll" :disabled="loading">
          {{ loading ? "Actualisation..." : "Actualiser" }}
        </button>
      </div>
    </header>

    <!-- Tabs -->
    <nav class="tabs">
      <button
        class="tab"
        :class="{ active: activeSection === 'reservations' }"
        @click="showSection('reservations')"
      >
        Mes Réservations
        <span class="badge">{{ reservations.length }}</span>
      </button>

      <button
        class="tab"
        :class="{ active: activeSection === 'notifications' }"
        @click="showSection('notifications')"
      >
        Notifications
        <span class="badge">{{ notifications.length }}</span>
      </button>
    </nav>

    <!-- Content -->
    <main class="content">
      <!-- Global status -->
      <div v-if="error" class="alert error">
        {{ error }}
      </div>
      <div v-if="message" class="alert success">
        {{ message }}
      </div>

      <!-- RESERVATIONS -->
      <section v-if="activeSection === 'reservations'" class="card">
        <div class="card-header">
          <h2>Mes Réservations</h2>
          <p>Liste synchronisée avec l’API</p>
        </div>

        <div v-if="loadingReservations" class="muted">Chargement...</div>

        <div v-else>
          <div v-if="reservations.length === 0" class="empty">
            Aucune réservation pour le moment.
          </div>

          <table v-else class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Salle</th>
                <th>Date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in reservations" :key="r.id || r._id">
                <td class="mono">{{ r.id || r._id || "-" }}</td>
                <td>{{ r.nom || r.salle || "—" }}</td>
                <td class="mono">{{ formatDate(r.date) }}</td>
                <td class="muted">{{ r.description || "—" }}</td>
                <td>
                  <button class="btn danger" @click="deleteReservation(r.id || r._id)">
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="hint">
            Astuce : si ton backend renvoie d’autres champs, on adapte juste les colonnes.
          </div>
        </div>
      </section>

      <!-- NOTIFICATIONS -->
      <section v-if="activeSection === 'notifications'" class="card">
        <div class="card-header">
          <h2>Notifications</h2>
          <p>Pour “temps réel”, on fait un rafraîchissement auto (polling)</p>
        </div>

        <div class="row">
          <label class="switch">
            <input type="checkbox" v-model="pollingEnabled" @change="togglePolling" />
            <span>Activer le rafraîchissement auto</span>
          </label>

          <div class="poll">
            <span class="muted">Toutes les</span>
            <select v-model.number="pollingIntervalMs" @change="restartPolling">
              <option :value="5000">5s</option>
              <option :value="10000">10s</option>
              <option :value="20000">20s</option>
              <option :value="30000">30s</option>
            </select>
          </div>
        </div>

        <div v-if="loadingNotifications" class="muted">Chargement...</div>

        <ul v-else class="list">
          <li v-if="notifications.length === 0" class="empty">
            Aucune notification.
          </li>

          <li v-for="(n, idx) in notifications" :key="n.id || idx" class="list-item">
            <div class="bullet"></div>
            <div class="list-body">
              <div class="list-title">
                {{ n.message || n.titre || "Notification" }}
              </div>
              <div class="list-meta mono">
                {{ n.date ? formatDate(n.date) : "" }}
              </div>
            </div>
          </li>
        </ul>

        <div class="hint">
          Si tu veux du VRAI temps réel (push instantané), ton backend doit exposer WebSocket/SSE.
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { api } from "../services/api";

export default {
  name: "UserDashboard",
  data() {
    return {
      activeSection: "reservations",

      // data
      reservations: [],
      notifications: [],

      // ui
      loading: false,
      loadingReservations: false,
      loadingNotifications: false,
      error: "",
      message: "",

      // polling
      pollingEnabled: true,
      pollingIntervalMs: 5000,
      pollingTimer: null,
      lastReservationCount: 0,
    };
  },

  async mounted() {
    await this.refreshAll();
    this.lastReservationCount = this.reservations.length;

    if (this.pollingEnabled) {
      this.startPolling();
    }
  },

  beforeUnmount() {
    this.stopPolling();
  },

  methods: {
    showSection(section) {
      this.activeSection = section;
      this.error = "";
      this.message = "";
    },

    goHome() {
      this.$router.push({ path: "/" });
    },

    formatDate(dateStr) {
      if (!dateStr) return "—";
      // si dateStr est déjà formatée, on laisse
      // sinon on tente une conversion simple
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return d.toISOString().slice(0, 10);
    },

    async refreshAll() {
      this.loading = true;
      this.error = "";
      this.message = "";

      try {
        await Promise.all([this.fetchReservations(), this.fetchNotifications()]);
      } finally {
        this.loading = false;
      }
    },

    async fetchReservations() {
      this.loadingReservations = true;
      this.error = "";

      try {
        // ✅ À ADAPTER si ton endpoint est différent
        // Exemples possibles:
        // - /api/reservations
        // - /api/reservations/user/:id
        const res = await api.get("/api/reservations");

        // selon ton backend, ça peut être res.data ou res.data.data
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        this.reservations = list;

        // mini notification si le nombre augmente
        if (this.lastReservationCount && list.length > this.lastReservationCount) {
          this.notifications.unshift({
            message: "Nouvelle réservation ajoutée ✅",
            date: new Date().toISOString(),
          });
        }
        this.lastReservationCount = list.length;
      } catch (e) {
        console.error(e);
        this.error =
          e?.response?.data?.message ||
          "Erreur lors du chargement des réservations (vérifie l’endpoint /api/reservations).";
      } finally {
        this.loadingReservations = false;
      }
    },

    async deleteReservation(id) {
  if (!id) return;

  const ok = confirm("Supprimer cette réservation ?");
  if (!ok) return;

  try {
    await api.delete(`/api/reservations/${id}`);
    this.message = "Réservation supprimée ✅";
    await this.fetchReservations(); // refresh
  } catch (e) {
    console.error(e);
    this.error =
      e?.response?.data?.message ||
      "Erreur lors de la suppression de la réservation.";
  }
},

    async fetchNotifications() {
      this.loadingNotifications = true;
      this.error = "";

      try {
        // ✅ Si tu n'as PAS d’endpoint notifications, on peut en générer
        // à partir des réservations, ou juste garder une liste locale.
        // Si tu as un endpoint:
        // const res = await api.get("/api/notifications");

        // Pour l’instant: notifications locales (mais alimentées lors de nouvelles réservations)
        // Tu peux remplacer cette partie quand tu auras /api/notifications.
        this.notifications = this.notifications.slice(0, 20);
      } catch (e) {
        console.error(e);
        this.error = "Erreur lors du chargement des notifications.";
      } finally {
        this.loadingNotifications = false;
      }
    },

    // Polling (pseudo temps réel)
    startPolling() {
      this.stopPolling();
      this.pollingTimer = setInterval(async () => {
        // rafraîchit surtout les réservations (qui déclenchent notifs)
        await this.fetchReservations();
      }, this.pollingIntervalMs);
    },

    stopPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
    },

    togglePolling() {
      if (this.pollingEnabled) this.startPolling();
      else this.stopPolling();
    },

    restartPolling() {
      if (this.pollingEnabled) this.startPolling();
    },
  },
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 18px;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

.topbar {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 1px solid #e6e7ee;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.06);
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #42b983;
}
h1 {
  margin: 0;
  font-size: 18px;
}
.brand p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.actions {
  display: flex;
  gap: 10px;
}
.btn.danger {
  background: #ef4444;
}
.btn.danger:hover {
  background: #dc2626;
}
.btn {
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  background: #42b983;
  color: white;
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn.ghost {
  background: #eef2ff;
  color: #111827;
}

.tabs {
  margin-top: 14px;
  display: flex;
  gap: 10px;
}

.tab {
  background: white;
  border: 1px solid #e6e7ee;
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
}
.tab.active {
  border-color: #42b983;
  box-shadow: 0 6px 18px rgba(66, 185, 131, 0.15);
}
.badge {
  font-size: 12px;
  background: #111827;
  color: white;
  padding: 2px 8px;
  border-radius: 999px;
}

.content {
  margin-top: 14px;
  display: grid;
  gap: 12px;
}

.card {
  background: white;
  border: 1px solid #e6e7ee;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.06);
}

.card-header h2 {
  margin: 0;
  font-size: 16px;
}
.card-header p {
  margin: 6px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.alert {
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 700;
  border: 1px solid transparent;
}
.alert.error {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #9f1239;
}
.alert.success {
  background: #ecfdf5;
  border-color: #bbf7d0;
  color: #065f46;
}

.muted {
  color: #6b7280;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}
.table th,
.table td {
  border-bottom: 1px solid #eef2f7;
  padding: 10px 8px;
  text-align: left;
}
.table th {
  font-size: 12px;
  color: #6b7280;
}

.empty {
  margin-top: 12px;
  padding: 14px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  color: #475569;
}

.hint {
  margin-top: 12px;
  font-size: 12px;
  color: #6b7280;
}

.row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  flex-wrap: wrap;
}
.switch {
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: 700;
}
.poll {
  display: flex;
  gap: 8px;
  align-items: center;
}
select {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #e6e7ee;
  background: white;
}

.list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: grid;
  gap: 10px;
}
.list-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #fcfcff;
}
.bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #42b983;
  margin-top: 5px;
}
.list-title {
  font-weight: 900;
}
.list-meta {
  margin-top: 4px;
  color: #6b7280;
}
</style>