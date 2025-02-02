import { auth, db } from './auth.js';

// Export the main function
export async function loadStats() {
  const userId = auth.currentUser.uid;

  try {
    // Cargar datos de estados de ánimo
    const moodStats = await getMoodStats(userId);
    createMoodChart(moodStats);

    // Cargar datos de objetivos
    const goalStats = await getGoalStats(userId);
    createGoalsChart(goalStats);

    // Actualizar resumen de estadísticas
    updateStatsSummary(moodStats, goalStats);
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function getMoodStats(userId) {
  const snapshot = await db.collection('moods')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .get();

  const stats = {
    happy: 0,
    neutral: 0,
    sad: 0,
    angry: 0,
    excited: 0
  };

  snapshot.forEach(doc => {
    const mood = doc.data().mood;
    stats[mood]++;
  });

  return stats;
}

async function getGoalStats(userId) {
  const snapshot = await db.collection('goals')
    .where('userId', '==', userId)
    .get();

  const stats = {
    completed: 0,
    total: 0,
    daily: { completed: 0, total: 0 },
    weekly: { completed: 0, total: 0 },
    monthly: { completed: 0, total: 0 }
  };

  snapshot.forEach(doc => {
    const goal = doc.data();
    stats.total++;
    stats[goal.type].total++;
    
    if (goal.completed) {
      stats.completed++;
      stats[goal.type].completed++;
    }
  });

  return stats;
}

function createMoodChart(moodStats) {
  const ctx = document.getElementById('mood-chart').getContext('2d');
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Feliz', 'Neutral', 'Triste', 'Enojado', 'Emocionado'],
      datasets: [{
        data: [
          moodStats.happy,
          moodStats.neutral,
          moodStats.sad,
          moodStats.angry,
          moodStats.excited
        ],
        backgroundColor: [
          '#ffd93d',
          '#6c757d',
          '#4834d4',
          '#eb4d4b',
          '#6c5ce7'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function createGoalsChart(goalStats) {
  const ctx = document.getElementById('goals-chart').getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Diarios', 'Semanales', 'Mensuales'],
      datasets: [{
        label: 'Completados',
        data: [
          goalStats.daily.completed,
          goalStats.weekly.completed,
          goalStats.monthly.completed
        ],
        backgroundColor: '#6c5ce7'
      }, {
        label: 'Total',
        data: [
          goalStats.daily.total,
          goalStats.weekly.total,
          goalStats.monthly.total
        ],
        backgroundColor: '#a8a4e6'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

function getMoodEmoji(mood) {
  const emojis = {
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    angry: '😠',
    excited: '🤩'
  };
  return emojis[mood] || '😐';
}

function updateStatsSummary(moodStats, goalStats) {
  // Calcular racha actual
  const streak = calculateStreak();
  document.getElementById('current-streak').textContent = `${streak} días`;

  // Mostrar total de objetivos completados
  document.getElementById('completed-goals').textContent = goalStats.completed;

  // Encontrar el estado de ánimo más frecuente
  const frequentMood = Object.entries(moodStats)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0];
  
  document.getElementById('frequent-mood').textContent = 
    `${getMoodEmoji(frequentMood)} ${frequentMood}`;
}

async function calculateStreak() {
  const userId = auth.currentUser.uid;
  const now = new Date();
  let streak = 0;
  
  try {
    const snapshot = await db.collection('moods')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();

    let lastDate = now;
    
    snapshot.forEach(doc => {
      const moodDate = doc.data().timestamp.toDate();
      const dayDiff = Math.floor(
        (lastDate - moodDate) / (1000 * 60 * 60 * 24)
      );
      
      if (dayDiff <= 1) {
        streak++;
        lastDate = moodDate;
      } else {
        return;
      }
    });
    
    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

// Make the loadStats function available globally as well
window.loadStats = loadStats;