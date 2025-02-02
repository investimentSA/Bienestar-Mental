// Correcciones y mejoras en auth.js, goals.js, stats.js y mood.js

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

// MOOD.JS - Corrección de Firestore y mejoras en la interfaz
let selectedMood = null;
let auth;
let db;

export function initMood(authInstance, dbInstance) {
    auth = authInstance;
    db = dbInstance;
    
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedMood = btn.dataset.mood;
        });
    });
}

export async function saveMood() {
    if (!selectedMood) {
        alert('Por favor selecciona un estado de ánimo');
        return;
    }

    const comment = document.getElementById('mood-comment').value;
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
        await addDoc(collection(db, 'moods'), {
            userId: userId,
            mood: selectedMood,
            comment: comment,
            timestamp: new Date()
        });
        
        loadMoodHistory();
        document.getElementById('mood-comment').value = '';
        selectedMood = null;
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
    } catch (error) {
        alert('Error al guardar el estado de ánimo: ' + error.message);
    }
}

export async function loadMoodHistory() {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const moodHistory = document.getElementById('mood-history');
    if (!moodHistory) return;
    moodHistory.innerHTML = '';

    try {
        const moodQuery = query(collection(db, 'moods'), where('userId', '==', userId), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(moodQuery);

        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp.toDate();
            
            const moodEntry = document.createElement('div');
            moodEntry.className = 'mood-entry';
            moodEntry.innerHTML = `
                <div class="mood-header">
                    <span class="mood-emoji">${getMoodEmoji(data.mood)}</span>
                    <span class="mood-date">${formatDate(date)}</span>
                    <div class="mood-actions">
                        <button onclick="editMood('${doc.id}')" class="edit-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteMood('${doc.id}')" class="delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="mood-comment">${data.comment}</p>
            `;
            
            moodHistory.appendChild(moodEntry);
        });
    } catch (error) {
        console.error('Error loading mood history:', error);
    }
}

export function getMoodEmoji(mood) {
    const emojis = { happy: '😊', neutral: '😐', sad: '😢', angry: '😠', excited: '🤩' };
    return emojis[mood] || '😐';
}

export function formatDate(date) {
    return new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export async function deleteMood(moodId) {
    if (confirm('¿Estás seguro de que quieres eliminar este estado de ánimo?')) {
        try {
            await deleteDoc(doc(db, 'moods', moodId));
            loadMoodHistory();
        } catch (error) {
            alert('Error al eliminar el estado de ánimo: ' + error.message);
        }
    }
}

// Make functions available globally
window.saveMood = saveMood;
window.loadMoodHistory = loadMoodHistory;
window.deleteMood = deleteMood;