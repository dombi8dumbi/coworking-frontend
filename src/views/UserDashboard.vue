<template>
  <div class="page">
    <header class="topbar">
      <h1 class="title">Tableau de bord</h1>

      <div class="actions">
        <button
          class="btn"
          :class="{ active: activeSection === 'reservations' }"
          @click="showSection('reservations')"
        >
          Mes Réservations
        </button>

        <button
          class="btn"
          :class="{ active: activeSection === 'notifications' }"
          @click="showSection('notifications')"
        >
          Notifications
          <span v-if="unreadCount" class="badge">{{ unreadCount }}</span>
        </button>

        <button class="btn secondary" @click="$router.push('/')">Accueil</button>
      </div>
    </header>

    <main class="container">
      <!-- RESERVATIONS -->
      <section v-if="activeSection === 'reservations'" class="card">
        <div class="cardHeader">
          <h2>Mes Réservations</h2>

          <div class="right">
            <button class="btn small" :disabled="loading" @click="fetchReservations(true)">
              {{ loading ? "Chargement..." : "Rafraîchir" }}
            </button>
          </div>
        </div>

        <p v-if="error" class="alert error">
          {{ error }}
        </p>

        <p v-if="loading && !reservations.length" class="muted">
          Chargement des réservations...
        </p>

        <div v-else>
          <div v-if="!reservations.length" class="empty">
            Aucune réservation pour le moment.
          </div>

          <div v-else class="tableWrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in reservations" :key="r.id ?? r._id ?? r.createdAt ?? r.nom + r.date">
                  <td class="mono">{{ r.nom }}</td>
                  <td class="muted">{{ r.description || "—" }}</td>
                  <td class="mono">{{ formatDate(r.date) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="muted small" style="margin-top: 12px">
            Mise à jour auto toutes les {{ pollingIntervalMs / 1000 }}s.
          </p>
        </div>
      </section>

      <!-- NOTIFICATIONS -->
      <section v-if="activeSection === 'notifications'" class="card">
        <div class="cardHeader">
          <h2>Notifications</h2>

          <div class="right">
            <button class="btn small secondary" @click="markAllAsRead" :disabled="!notifications.length">
              Tout marquer comme lu
            </button>
          </div>
        </div>

        <div v-if="!notifications.length" class="empty">
          Aucune notification.
        </div>

        <ul v-else class="notifList">
          <li v-for="n in notifications" :key="n.id" class="notifItem" :class="{ unread: !n.read }">
            <div class="notifMsg">{{ n.message }}</div>
            <div class="muted small">{{ n.time }}</div>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script>
import { getReservations } from "../services/reservation";

export default {
  name: "UserDashboard",
  data() {
    return {
      activeSection: "reservations",

      reservations: [],
      loading: false,
      error: "",

      // ✅ c’est ICI que tu mets ton pollingIntervalMs
      pollingIntervalMs: 5000,
      pollerId: null,

      // notifications simples côté front
      notifications: [],
      unreadCount: 0,

      // pour détecter les nouveautés
      lastKnownCount: 0,
    };
  },

  mounted() {
    this.fetchReservations(false);

    // auto refresh
    this.pollerId = setInterval(() => {
      this.fetchReservations(false);
    }, this.pollingIntervalMs);
  },

  beforeUnmount() {
    if (this.pollerId) clearInterval(this.pollerId);
  },

  methods: {
    showSection(section) {
      this.activeSection = section;
      if (section === "notifications") this.unreadCount = 0;
    },

    formatDate(d) {
      if (!d) return "—";
      // si c'est déjà "YYYY-MM-DD", on le laisse
      if (typeof d === "string" && d.length >= 10) return d.slice(0, 10);
      return String(d);
    },

    pushNotif(message) {
      const now = new Date();
      const time = now.toLocaleString();
      this.notifications.unshift({
        id: now.getTime() + Math.random(),
        message,
        time,
        read: false,
      });
      this.unreadCount += 1;
    },

    markAllAsRead() {
      this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
      this.unreadCount = 0;
    },

    async fetchReservations(fromButton) {
      this.error = "";
      if (fromButton) this.loading = true;

      try {
        const res = await getReservations();

        // selon ton backend, ça peut être res.data ou res.data.data
        const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);

        // notif si nouvelles réservations
        if (this.lastKnownCount && list.length > this.lastKnownCount) {
          const diff = list.length - this.lastKnownCount;
          this.pushNotif(`${diff} nouvelle(s) réservation(s) ajoutée(s).`);
        }

        this.reservations = list;
        this.lastKnownCount = list.length;
      } catch (e) {
        const status = e?.response?.status;
        // ✅ message plus utile pour debug prod
        this.error =
          status
            ? `Erreur API (${status}) — vérifie que VITE_API_BASE_URL est bien configuré sur Vercel, puis CORS/route côté backend.`
            : "Erreur réseau — backend injoignable ?";
        console.error(e);
      } finally {
        this.loading = false;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 18px;
  background: white;
  border-bottom: 1px solid #e9e9ef;
}

.title {
  margin: 0;
  font-size: 22px;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.container {
  max-width: 980px;
  margin: 22px auto;
  padding: 0 16px;
}

.card {
  background: white;
  border: 1px solid #ececf4;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 8px 22px rgba(0,0,0,0.04);
}

.cardHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.right { display: flex; gap: 8px; align-items: center; }

.btn {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: #42b983;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: 0.15s;
}

.btn:hover { filter: brightness(0.95); }
.btn:disabled { opacity: 0.65; cursor: not-allowed; }

.btn.secondary {
  background: #6b7280;
}

.btn.small {
  padding: 8px 10px;
  border-radius: 10px;
  font-weight: 700;
}

.btn.active {
  outline: 3px solid rgba(66, 185, 131, 0.18);
}

.badge {
  margin-left: 8px;
  background: #111827;
  color: white;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
}

.alert {
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 12px;
  font-weight: 700;
}

.alert.error {
  background: #fff1f1;
  border: 1px solid #ffd1d1;
  color: #b91c1c;
}

.empty {
  padding: 14px;
  border: 1px dashed #d7d7e5;
  border-radius: 12px;
  background: #fbfbff;
  color: #6b7280;
}

.tableWrap {
  overflow: auto;
  border-radius: 12px;
  border: 1px solid #ececf4;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}

.table th, .table td {
  padding: 12px 10px;
  border-bottom: 1px solid #f0f0f7;
  text-align: left;
  vertical-align: top;
}

.table th {
  background: #fafafa;
  font-size: 13px;
  color: #374151;
}

.muted { color: #6b7280; }
.small { font-size: 12px; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

.notifList {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.notifItem {
  border: 1px solid #ececf4;
  border-radius: 12px;
  padding: 12px;
  background: #fff;
}

.notifItem.unread {
  border-color: rgba(66, 185, 131, 0.35);
  background: rgba(66, 185, 131, 0.06);
}

.notifMsg {
  font-weight: 800;
  margin-bottom: 6px;
}
</style>