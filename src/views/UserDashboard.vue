<template>
  <div>
    <!-- Header avec boutons en haut à droite -->
    <header class="flex justify-end items-center p-4 bg-gray-100 shadow">
      <button @click="showSection('reservations')" 
              class="mr-2 px-4 py-2 bg-blue-500 text-white rounded ">
        Mes Réservations
      </button>
      <button @click="showSection('notifications')" 
              class="mr-2 px-4 py-2 bg-green-500 text-white rounded">
        Notifications
      </button>
    </header>

    <!-- Contenu -->
    <main class="p-4">
      <div v-if="activeSection === 'reservations'">
        <h2 class="text-xl font-bold mb-2">Mes Réservations</h2>
        <ul>
          <li v-for="res in reservations" :key="res.id">
            {{ res.salle }} - {{ res.date }}
          </li>
        </ul>
      </div>

      <div v-if="activeSection === 'notifications'">
        <h2 class="text-xl font-bold mb-2">Notifications</h2>
        <ul>
          <li v-for="note in notifications" :key="note.id">
            {{ note.message }}
          </li>
        </ul>
      </div>
      <div>
        <button 
              @click="$router.push('/')"
              class="px-4 py-2 bg-gray-500 text-white rounded ">
        Accueil
      </button>
      </div>
    </main>
  </div>
</template>

<style>
button {
  margin-top: 12px;
  padding: 10px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

button:hover {
  background: #369870;
}

.mr-2 {
  margin-right: 10px;
}
</style>

<script>
export default {
  name: "UserDashboard",
  data() {
    return {
      activeSection: 'reservations',
      reservations: [
        { id: 1, salle: "Salle A", date: "2026-01-10" },
        { id: 2, salle: "Salle B", date: "2026-01-12" }
      ],
      notifications: [
        { id: 1, message: "Votre réservation pour Salle A est confirmée." },
        { id: 2, message: "Nouvelle salle disponible : Salle C." }
      ]
    };
  },
  methods: {
    showSection(section) {
      this.activeSection = section;
    }
  }
};
</script>
