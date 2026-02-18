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

      <button type="submit">Confirmer</button>
    </form>

    <!-- Résumé -->
    <div v-if="confirmation" class="confirmation">
       Réservation enregistrée !
      <pre>{{ confirmation }}</pre>
    </div>

    <!-- Bouton retour -->
    <div>
      <button @click="goHome">Back to Home Page</button>
    </div>

  </div>
</template>

<script>
export default {
  name: "Reservation",
  data() {
  return {
    salles: [
      { id: 1, nom: "Salle Alpha", capacite: 10 },
      { id: 2, nom: "Salle Beta", capacite: 6 },
      { id: 3, nom: "Salle Gamma", capacite: 20 }
    ],
    reservation: {
      idSalle: "",
      date: "",
      heureDebut: "",
      heureFin: ""
    },
    confirmation: null
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
    submitReservation() {
      // Vérification simple
      if (this.reservation.heureDebut >= this.reservation.heureFin) {
        alert("L'heure de fin doit être après l'heure de début.");
        return;
      }

      // Simulation d’envoi au backend
      this.confirmation = {
        ...this.reservation
      };

      alert("Réservation confirmée !");
      
      // Réinitialiser le formulaire
      this.reservation = {
        idSalle: "",
        date: "",
        heureDebut: "",
        heureFin: ""
      };
    }
  }
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

input, select {
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

.confirmation {
  margin-top: 20px;
  padding: 10px;
  background: #e6fffa;
  border: 1px solid #b2f5ea;
}
</style>
