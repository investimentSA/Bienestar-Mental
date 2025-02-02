// Correcciones y mejoras en auth.js, goals.js y stats.js

// AUTH.JS - Manejo de errores al cargar el dashboard
export async function showDashboard(user) {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
    
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        document.getElementById('user-name').textContent = userDoc.exists() ? userDoc.data().name : 'Usuario';
    } catch (error) {
        console.error('Error loading user info:', error);
        document.getElementById('user-name').textContent = 'Usuario';
    }
    
    // Cargar datos del dashboard sin detener la carga general si falla alguna parte
    await Promise.allSettled([
        loadMoodHistory(),
        loadGoals(),
        loadAdvice(),
        loadStats()
    ]);
}

// GOALS.JS - Manejo de autenticación antes de cargar objetivos
export async function loadGoals() {
    if (!auth.currentUser) {
        console.warn('Usuario no autenticado');
        return;
    }
    const userId = auth.currentUser.uid;
    const types = ['daily', 'weekly', 'monthly'];
    
    types.forEach(async type => {
        const listElement = document.getElementById(`${type}-goals-list`);
        if (!listElement) return;
        listElement.innerHTML = '';
        
        try {
            const goalsQuery = query(
                collection(db, 'goals'),
                where('userId', '==', userId),
                where('type', '==', type),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(goalsQuery);
            snapshot.forEach(doc => {
                const goal = doc.data();
                const goalElement = document.createElement('div');
                goalElement.className = 'goal-item';
                goalElement.innerHTML = `
                    <input type="checkbox" ${goal.completed ? 'checked' : ''} onchange="toggleGoal('${doc.id}', this.checked)">
                    <span class="${goal.completed ? 'completed' : ''}">${goal.description}</span>
                    <button onclick="deleteGoal('${doc.id}')" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                listElement.appendChild(goalElement);
            });
        } catch (error) {
            console.error('Error loading goals:', error);
            listElement.innerHTML = '<p>Error cargando objetivos.</p>';
        }
    });
}

// STATS.JS - Fix en consultas a Firestore y verificación de elementos en DOM
async function getMoodStats(userId) {
    const moodsRef = collection(db, 'moods');
    const moodQuery = query(moodsRef, where('userId', '==', userId), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(moodQuery);
    
    const stats = { happy: 0, neutral: 0, sad: 0, angry: 0, excited: 0 };
    snapshot.forEach(doc => {
        const mood = doc.data().mood;
        stats[mood]++;
    });
    return stats;
}

function createMoodChart(moodStats) {
    const canvas = document.getElementById('mood-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Feliz', 'Neutral', 'Triste', 'Enojado', 'Emocionado'],
            datasets: [{
                data: [moodStats.happy, moodStats.neutral, moodStats.sad, moodStats.angry, moodStats.excited],
                backgroundColor: ['#ffd93d', '#6c757d', '#4834d4', '#eb4d4b', '#6c5ce7']
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}

// Funciones adicionales para gráficos de estadísticas
function createGoalsChart(goalStats) {
    const ctx = document.getElementById('goals-chart')?.getContext('2d');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Diarios', 'Semanales', 'Mensuales'],
            datasets: [{
                label: 'Completados',
                data: [goalStats.daily.completed, goalStats.weekly.completed, goalStats.monthly.completed],
                backgroundColor: '#6c5ce7'
            }, {
                label: 'Total',
                data: [goalStats.daily.total, goalStats.weekly.total, goalStats.monthly.total],
                backgroundColor: '#a8a4e6'
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
}
