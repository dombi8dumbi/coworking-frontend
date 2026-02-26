<template>
  <div class="reservation">
    <h1>📅 Réserver une salle</h1>

    <p v-if="$route.query.nomSalle">
      Salle choisie : <strong>{{ $route.query.nomSalle }}</strong>
    </p>

    <form @submit.prevent="submitReservation">
      <!-- Salle -->
      <div class="form-group">
        <label>Salle</label>
        <select v-model="reservation.idSalle" required>
          <option disabled value="">-- Choisir une salle --</option>
          <option v-for="salle in salles" :key="salle.id" :value="salle.id">
            {{ salle.nom }} ({{ salle.capacite }} pers.)
          </option>
        </select>
      </div>

      <!-- Date -->
      <div class="form-group">
        <label>Date</label>
        <input type="date" v-model="reservation.date" required />
      </div>

      <!-- Heure début -->
      <div class="form-group">
        <label>Heure de début</label>
        <input type="time" v-model="reservation.heureDebut" required />
      </div>

      <!-- Heure fin -->
      <div class="form-group">
        <label>Heure de fin</label>
        <input type="time" v-model="reservation.heureFin" required />
      </div>

      <!-- Description (optionnel mais utile) -->
      <div class="form-group">
        <label>Description (optionnel)</label>
        <input
          type="text"
          v-model="reservation.description"
          placeholder="Ex: Réunion d’équipe"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? "Envoi..." : "Confirmer" }}
      </button>
    </form>

    <!-- Résultat -->
    <div v-if="message" class="confirmation">
      {{ message }}
      <pre v-if="confirmation">{{ confirmation }}</pre>
    </div>

    <!-- Erreur -->
    <p v-if="error" style="color: red; font-weight: bold; margin-top: 12px">
      {{ error }}
    </p>

    <!-- Bouton retour -->
    <div style="margin-top: 12px">
      <button @click="goHome" type="button">Back to Home Page</button>
    </div>
  </div>
</template>

<script>
import { createReservation } from "../services/reservation";

export default {
  name: "Reservation",
  data() {
    return {
      loading: false,
      message: "",
      error: "",
      confirmation: null,

      salles: [
        { id: 1, nom: "Salle Alpha", capacite: 10 },
        { id: 2, nom: "Salle Beta", capacite: 6 },
        { id: 3, nom: "Salle Gamma", capacite: 20 },
      ],

      reservation: {
        idSalle: "",
        date: "",
        heureDebut: "",
        heureFin: "",
        description: "",
      },
    };
  },

  mounted() {
    if (this.$route.query.idSalle) {
      this.reservation.idSalle = Number(this.$route.query.idSalle);
    }
  },

  methods: {
    goHome() {
      this.$router.push({ path: "/" });
    },

    async submitReservation() {
      this.message = "";
      this.error = "";
      this.confirmation = null;

      if (this.reservation.heureDebut >= this.reservation.heureFin) {
        this.error = "L'heure de fin doit être après l'heure de début.";
        return;
      }

      const salle = this.salles.find((s) => s.id === this.reservation.idSalle);
      const nomSalle = salle?.nom || this.$route.query.nomSalle || "Salle";

      const payload = {
        nom: nomSalle,
        description:
          this.reservation.description ||
          `Réservation ${nomSalle} (${this.reservation.heureDebut} - ${this.reservation.heureFin})`,
        date: this.reservation.date,
      };

      this.loading = true;

      try {
        const res = await createReservation(payload);

        this.message = "Réservation enregistrée ! ✅";
        this.confirmation = JSON.stringify(res.data ?? res, null, 2);

        // reset
        this.reservation = {
          idSalle: "",
          date: "",
          heureDebut: "",
          heureFin: "",
          description: "",
        };

        // rediriger vers dashboard
        this.$router.push("/dashboard");
      } catch (e) {
        console.error(e);
        this.error =
          e?.response?.data?.message ||
          "Erreur API ❌ (vérifie CORS / route / backend)";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.reservation {
  max-width: 400px;
  margin: 30px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input,
select {
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

button {
  width: 100%;
  padding: 10px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background: #369870;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.confirmation {
  margin-top: 20px;
  padding: 10px;
  background: #e6fffa;
  border: 1px solid #b2f5ea;
}
</style>