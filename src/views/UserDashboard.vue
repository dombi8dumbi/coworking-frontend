<template>
  <div class="page">
    <header class="topbar">
      <h1 class="title">Tableau de bord</h1>

      <div class="tabs">
        <button
          :class="['tab', activeSection === 'reservations' && 'active']"
          @click="showSection('reservations')"
        >
          Mes Réservations
        </button>

        <button
          :class="['tab', activeSection === 'notifications' && 'active']"
          @click="showSection('notifications')"
        >
          Notifications
          <span v-if="unreadCount" class="badge">{{ unreadCount }}</span>
        </button>

        <button class="tab ghost" @click="$router.push('/')">Accueil</button>
      </div>
    </header>

    <main class="content">
      <!-- RESERVATIONS -->
      <section v-if="activeSection === 'reservations'" class="card">
        <div class="cardHeader">
          <h2>Mes Réservations</h2>
          <div class="actions">
            <button class="small" @click="fetchReservations" :disabled="loading">
              {{ loading ? "Chargement..." : "Rafraîchir" }}
            </button>
          </div>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <div v-if="!loading && reservations.length === 0" class="empty">
          Aucune réservation pour le moment.
        </div>

        <div v-else class="tableWrap">
          <table class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Salle</th>
                <th>Date</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in reservations" :key="r.id || r._id">
                <td>{{ r.id || r._id || "-" }}</td>
                <td>{{ r.nom || r.salle || "-" }}</td>
                <td>{{ formatDate(r.date) }}</td>
                <td class="muted">{{ r.description || "-" }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="hint">
          Mise à jour auto toutes les {{ pollingIntervalMs / 1000 }}s.
        </p>
      </section>

      <!-- NOTIFS -->
      <section v-if="activeSection === 'notifications'" class="card">
        <div class="cardHeader">
          <h2>Notifications</h2>
          <div class="actions">
            <button class="small" @click="markAllRead" :disabled="notifications.length === 0">
              Tout marquer comme lu
            </button>
            <button class="small danger" @click="clearNotifications" :disabled="notifications.length === 0">
              Vider
            </button>
          </div>
        </div>

        <div v-if="notifications.length === 0" class="empty">
          Pas de notifications.
        </div>

        <ul v-else class="notifList">
          <li v-for="n in notifications" :key="n.id" :class="['notif', !n.read && 'unread']">
            <div class="notifMsg">{{ n.message }}</div>
            <div class="notifMeta">{{ n.time }}</div>
          </li>
        </ul>
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

      reservations: [],
      loading: false,
      error: "",

      notifications: [],
      pollingTimer: null,
      pollingIntervalMs: 5000, // ✅ ICI (5 secondes)

      lastCount: 0,
    };
  },

  computed: {
    unreadCount() {
      return this.notifications.filter((n) => !n.read).length;
    },
  },

  async mounted() {
    await this.fetchReservations();

    // ✅ Polling toutes les 5s
    this.pollingTimer = setInterval(() => {
      this.fetchReservations(true); // true = silencieux
    }, this.pollingIntervalMs);
  },

  beforeUnmount() {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
  },

  methods: {
    showSection(section) {
      this.activeSection = section;
    },

    formatDate(d) {
      if (!d) return "-";
      // si backend renvoie ISO, ça marche
      try {
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return d;
        return dt.toLocaleDateString("fr-FR");
      } catch {
        return d;
      }
    },

    pushNotif(message) {
      this.notifications.unshift({
        id: crypto?.randomUUID?.() || String(Date.now()),
        message,
        time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        read: false,
      });
    },

    markAllRead() {
      this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    },

    clearNotifications() {
      this.notifications = [];
    },

    async fetchReservations(silent = false) {
      if (!silent) {
        this.loading = true;
        this.error = "";
      }

      try {
        const res = await api.get("/api/reservations");

        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        this.reservations = list;

        // notif si nouvelle réservation apparait
        if (this.lastCount && list.length > this.lastCount) {
          const diff = list.length - this.lastCount;
          this.pushNotif(`${diff} nouvelle(s) réservation(s) reçue(s).`);
        }
        this.lastCount = list.length;
      } catch (e) {
        // Important: 401 possible si route protégée
        const status = e?.response?.status;

        if (status === 401) {
          this.error = "401 Unauthorized — cette route semble protégée (token requis).";
        } else {
          this.error =
            e?.response?.data?.message ||
            `Erreur API (${status || "?"}) — vérifie la route /api/reservations, CORS, ou le backend.`;
        }
        console.error(e);
      } finally {
        if (!silent) this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f6f7fb;
}

.topbar {
  position: sticky;
  top: 0;
  background: white;
  border-bottom: 1px solid #e9e9ef;
  padding: 16px 18px;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 22px;
  margin: 0;
  font-weight: 800;
}

.tabs {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.tab {
  border: 1px solid #e3e3ea;
  background: #ffffff;
  padding: 10px 12px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.tab.active {
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.12);
}

.tab.ghost {
  background: #f2f3f7;
}

.badge {
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  background: #42b983;
  color: white;
}

.content {
  max-width: 980px;
  margin: 18px auto;
  padding: 0 18px 28px;
}

.card {
  background: white;
  border: 1px solid #e9e9ef;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.04);
}

.cardHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.cardHeader h2 {
  margin: 0;
  font-size: 18px;
}

.actions {
  display: flex;
  gap: 8px;
}

.small {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #e3e3ea;
  background: #f6f7fb;
  cursor: pointer;
  font-weight: 700;
}

.small:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.small.danger {
  background: #fff1f1;
  border-color: #ffd0d0;
}

.tableWrap {
  overflow: auto;
  border-radius: 12px;
  border: 1px solid #f0f0f5;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f5;
  text-align: left;
}

.table th {
  background: #fafafe;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.muted {
  color: #6b7280;
}

.error {
  background: #fff1f1;
  border: 1px solid #ffd0d0;
  padding: 10px;
  border-radius: 10px;
  color: #9b1c1c;
  font-weight: 700;
}

.empty {
  padding: 14px;
  border: 1px dashed #e3e3ea;
  border-radius: 12px;
  background: #fafafe;
  color: #6b7280;
}

.hint {
  margin-top: 10px;
  color: #6b7280;
  font-size: 13px;
}

.notifList {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.notif {
  border: 1px solid #e9e9ef;
  border-radius: 12px;
  padding: 10px 12px;
  background: #fafafe;
}

.notif.unread {
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.10);
  background: #f2fffa;
}

.notifMsg {
  font-weight: 800;
}

.notifMeta {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}
</style>