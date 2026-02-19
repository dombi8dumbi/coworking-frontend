<template>
  <div class="home">
    <center><h1><u>Salles disponibles</u></h1></center>

    <div class="rooms-slider">
      <div class="room-card" v-for="salle in salles" :key="salle.id">
        <h2>{{ salle.nom }}</h2>

        <p><strong>Capacité :</strong> {{ salle.capacite }} personnes</p>
        <p><strong>Équipements :</strong></p>
        <ul>
          <li v-for="(eq, index) in salle.equipements" :key="index">
            {{ eq }}
          </li>
        </ul>

        <button @click="goToReservation(salle)">
          Réserver
        </button>
      </div>
    </div>

    <div style="text-align:right; margin-bottom:20px;">
      <button
        @click="$router.push('/dashboard')"
        style="background:#42b983; color:white; border:none; border-radius:5px;"
      >
        Mon Tableau de Bord
      </button>
    </div>
  </div>
</template>

<script>
import { api } from "../services/api";

export default {
  name: "Home",
  data() {
    return {
      salles: [
        { id: 1, nom: "Salle Alpha", capacite: 10, equipements: ["Projecteur", "Wifi", "Tableau"] },
        { id: 2, nom: "Salle Beta", capacite: 6, equipements: ["Wifi"] },
        { id: 3, nom: "Salle Gamma", capacite: 20, equipements: ["Projecteur", "Climatisation", "Wifi"] },
        { id: 4, nom: "Salle Delta", capacite: 15, equipements: ["Projecteur", "Wifi", "Téléphone"] },
        { id: 5, nom: "Salle Epsilon", capacite: 8, equipements: ["Tableau", "Wifi"] },
        { id: 6, nom: "Salle Zeta", capacite: 12, equipements: ["Projecteur", "Climatisation", "Tableau"] }
      ]
    };
  },

  methods: {
    goToReservation(salle) {
      this.$router.push({
        path: "/reservation",
        query: { idSalle: salle.id, nomSalle: salle.nom }
      });
    }
  }
};
</script>

<style scoped>
.home {
  padding: 20px;
}

.rooms-slider {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
  scroll-snap-type: x mandatory;
}

.room-card {
  min-width: 260px;
  flex-shrink: 0;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  scroll-snap-align: start;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.room-card h2 {
  margin-bottom: 10px;
}

.room-card ul {
  padding-left: 18px;
  margin: 8px 0;
}

button {
  margin-top: 12px;
  width: 100%;
  padding: 10px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

button:hover {
  background: #369870;
}
</style>
